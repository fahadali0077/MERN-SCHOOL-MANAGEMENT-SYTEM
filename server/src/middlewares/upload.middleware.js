const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    any: ['image/jpeg','image/png','image/webp','application/pdf','application/msword']
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

// Middleware to process uploaded image with Sharp
const processImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) return next();

  try {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    req.file.filename = filename;
    req.file.path = outputPath;
    req.file.location = `/uploads/${filename}`; // Would be S3 URL in production

    next();
  } catch (err) {
    next(new AppError('Image processing failed', 500));
  }
};

// Avatar upload (smaller, square crop)
const processAvatar = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `avatar-${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
      .resize(400, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 90 })
      .toFile(outputPath);

    req.file.filename = filename;
    req.file.location = `/uploads/${filename}`;
    next();
  } catch (err) {
    next(new AppError('Avatar processing failed', 500));
  }
};

module.exports = upload;
module.exports.processImage = processImage;
module.exports.processAvatar = processAvatar;
