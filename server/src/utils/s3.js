const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const sharp = require('sharp');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

let s3Client = null;

const getS3Client = () => {
  if (!s3Client && process.env.AWS_ACCESS_KEY_ID) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

const BUCKET = process.env.AWS_S3_BUCKET || 'schoolms-uploads';

const s3Service = {
  /**
   * Upload file buffer to S3
   */
  async upload(buffer, { folder = 'uploads', filename, mimetype, schoolId }) {
    const client = getS3Client();
    if (!client) {
      // Fallback: save to local uploads folder
      const fs = require('fs');
      const localPath = path.join(process.cwd(), 'uploads', filename);
      fs.writeFileSync(localPath, buffer);
      return { url: `/uploads/${filename}`, key: filename, isLocal: true };
    }

    const key = `${schoolId}/${folder}/${filename}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      Metadata: { schoolId: String(schoolId) }
    });

    await client.send(command);
    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    logger.info(`S3 upload: ${key}`);
    return { url, key, isLocal: false };
  },

  /**
   * Upload and compress image to WebP
   */
  async uploadImage(buffer, { folder = 'images', schoolId, width = 1200, height = 1200, quality = 85 }) {
    const filename = `${crypto.randomBytes(16).toString('hex')}.webp`;
    const compressed = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    return this.upload(compressed, {
      folder,
      filename,
      mimetype: 'image/webp',
      schoolId
    });
  },

  /**
   * Upload avatar (square crop)
   */
  async uploadAvatar(buffer, { schoolId }) {
    const filename = `avatar-${crypto.randomBytes(8).toString('hex')}.webp`;
    const compressed = await sharp(buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 90 })
      .toBuffer();

    return this.upload(compressed, {
      folder: 'avatars',
      filename,
      mimetype: 'image/webp',
      schoolId
    });
  },

  /**
   * Upload document (PDF, Word, etc.) — no compression
   */
  async uploadDocument(buffer, { originalName, mimetype, folder = 'documents', schoolId }) {
    const ext = path.extname(originalName);
    const filename = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    return this.upload(buffer, { folder, filename, mimetype, schoolId });
  },

  /**
   * Delete file from S3
   */
  async delete(key) {
    const client = getS3Client();
    if (!client) return true;

    try {
      await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
      logger.info(`S3 delete: ${key}`);
      return true;
    } catch (err) {
      logger.error(`S3 delete failed: ${err.message}`);
      return false;
    }
  },

  /**
   * Generate pre-signed URL for temporary private access
   */
  async getSignedUrl(key, expiresIn = 3600) {
    const client = getS3Client();
    if (!client) return `/uploads/${path.basename(key)}`;

    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(client, command, { expiresIn });
  },

  /**
   * Extract S3 key from full URL
   */
  urlToKey(url) {
    if (!url || url.startsWith('/')) return url;
    const match = url.match(/amazonaws\.com\/(.+)$/);
    return match ? match[1] : url;
  }
};

module.exports = s3Service;
