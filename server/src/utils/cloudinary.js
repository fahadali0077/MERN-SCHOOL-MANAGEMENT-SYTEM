/**
 * cloudinary.js — replaces s3.js
 *
 * Provides the same API surface as s3.js so existing callers need minimal changes.
 * Requires env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * Falls back to local /uploads folder if Cloudinary env vars are not set,
 * so development works without any cloud account.
 */

const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const logger = require('./logger');

let cloudinaryConfigured = false;
let cloudinary = null;

// Lazy-init: don't crash at require time if env vars are missing
const getCloudinary = () => {
  if (cloudinaryConfigured) return cloudinary;

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      cloudinaryConfigured = true;
      logger.info('✅ Cloudinary configured');
    } catch (err) {
      logger.warn(`⚠️  Cloudinary init failed (package missing?): ${err.message} — using local storage`);
    }
  } else {
    logger.warn('⚠️  Cloudinary env vars not set — uploads will be stored locally in /uploads');
  }

  return cloudinary;
};

// ─── Local fallback ──────────────────────────────────────────────────────────
const saveLocally = (buffer, filename) => {
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const localPath = path.join(uploadDir, filename);
  fs.writeFileSync(localPath, buffer);
  return { url: `/uploads/${filename}`, publicId: filename, isLocal: true };
};

// ─── Upload buffer via stream ─────────────────────────────────────────────────
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const cl = getCloudinary();
    if (!cl) {
      // Fallback: local storage
      const filename = options.public_id
        ? `${options.public_id}.webp`
        : `${crypto.randomBytes(16).toString('hex')}.webp`;
      const result = saveLocally(buffer, filename);
      return resolve(result);
    }

    const uploadStream = cl.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id, isLocal: false });
    });
    uploadStream.end(buffer);
  });
};

// ─── Public API (matches s3.js surface) ──────────────────────────────────────
const cloudinaryService = {
  /**
   * Upload raw buffer.
   */
  async upload(buffer, { folder = 'uploads', filename, mimetype, schoolId } = {}) {
    const resourceType = mimetype?.startsWith('image/') ? 'image' : 'raw';
    return uploadBuffer(buffer, {
      folder: `schoolms/${schoolId || 'shared'}/${folder}`,
      resource_type: resourceType,
      use_filename: true,
    });
  },

  /**
   * Upload and compress image to WebP.
   */
  async uploadImage(buffer, { folder = 'images', schoolId, width = 1200, height = 1200, quality = 85 } = {}) {
    const sharp = require('sharp');
    const compressed = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    return uploadBuffer(compressed, {
      folder: `schoolms/${schoolId || 'shared'}/${folder}`,
      resource_type: 'image',
      format: 'webp',
    });
  },

  /**
   * Upload avatar (square crop).
   */
  async uploadAvatar(buffer, { schoolId } = {}) {
    const sharp = require('sharp');
    const compressed = await sharp(buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 90 })
      .toBuffer();

    return uploadBuffer(compressed, {
      folder: `schoolms/${schoolId || 'shared'}/avatars`,
      resource_type: 'image',
      format: 'webp',
    });
  },

  /**
   * Upload document (PDF, etc.) — no compression.
   */
  async uploadDocument(buffer, { originalName, mimetype, folder = 'documents', schoolId } = {}) {
    return uploadBuffer(buffer, {
      folder: `schoolms/${schoolId || 'shared'}/${folder}`,
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
    });
  },

  /**
   * Delete asset by publicId.
   */
  async delete(publicId, resourceType = 'image') {
    try {
      const cl = getCloudinary();
      if (!cl) {
        // Try to delete local file
        const localPath = path.join(process.cwd(), 'uploads', path.basename(publicId));
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        return true;
      }
      await cl.uploader.destroy(publicId, { resource_type: resourceType });
      logger.info(`Cloudinary delete: ${publicId}`);
      return true;
    } catch (err) {
      logger.error(`Cloudinary delete failed: ${err.message}`);
      return false;
    }
  },

  /**
   * Get a signed/temporary URL (Cloudinary signed URLs or just return public URL).
   */
  async getSignedUrl(publicId, expiresIn = 3600) {
    const cl = getCloudinary();
    if (!cl) return `/uploads/${path.basename(publicId)}`;

    return cl.utils.private_download_url(publicId, 'image', {
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    });
  },

  urlToKey(url) {
    if (!url || url.startsWith('/')) return url;
    // Extract Cloudinary publicId from secure_url
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : url;
  }
};

module.exports = cloudinaryService;
