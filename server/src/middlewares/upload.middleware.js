/**
 * upload.middleware.js
 *
 * In development: stores processed images to local /uploads folder.
 * In production:  streams directly to Cloudinary via cloudinaryService.
 *
 * FIX: Removed dependency on S3 / AWS SDK entirely.
 */

const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');
const cloudinaryService = require('../utils/cloudinary');

// Always use memory storage — we process the buffer before deciding where to save it
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    any: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword']
  };

  const type = req.uploadType || 'any';
  const allowedTypes = allowed[type] || allowed.any;

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} not allowed`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ─── Image processing middleware ──────────────────────────────────────────────
// Resizes, converts to WebP, then uploads to Cloudinary (or local fallback).
const processImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) return next();

  try {
    const schoolId = req.user?.schoolId || 'shared';
    const result = await cloudinaryService.uploadImage(req.file.buffer, {
      folder: 'images',
      schoolId,
    });

    req.file.location = result.url;        // URL to store in DB
    req.file.cloudinaryId = result.publicId;
    next();
  } catch (err) {
    next(new AppError(`Image upload failed: ${err.message}`, 500));
  }
};

// ─── Avatar processing middleware ─────────────────────────────────────────────
// Square crop 400×400, upload to Cloudinary avatars folder.
const processAvatar = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const schoolId = req.user?.schoolId || 'shared';
    const result = await cloudinaryService.uploadAvatar(req.file.buffer, { schoolId });

    req.file.location = result.url;
    req.file.cloudinaryId = result.publicId;
    next();
  } catch (err) {
    next(new AppError(`Avatar upload failed: ${err.message}`, 500));
  }
};

// ─── Document upload middleware ───────────────────────────────────────────────
const processDocument = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const schoolId = req.user?.schoolId || 'shared';
    const result = await cloudinaryService.uploadDocument(req.file.buffer, {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: 'documents',
      schoolId,
    });

    req.file.location = result.url;
    req.file.cloudinaryId = result.publicId;
    next();
  } catch (err) {
    next(new AppError(`Document upload failed: ${err.message}`, 500));
  }
};

module.exports = upload;
module.exports.processImage = processImage;
module.exports.processAvatar = processAvatar;
module.exports.processDocument = processDocument;
