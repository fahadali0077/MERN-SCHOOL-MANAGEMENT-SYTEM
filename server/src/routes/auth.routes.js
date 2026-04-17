const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.patch('/change-password', authController.changePassword);
// FIX: Added missing endpoints required by SettingsPage.tsx
router.patch('/preferences', authController.updatePreferences);
router.patch('/profile', authController.updateProfile);
router.delete('/account', authController.deleteAccount);

// Avatar upload — multer processes file, Cloudinary stores it
const upload = require('../middlewares/upload.middleware');
router.post('/avatar', upload.single('avatar'), upload.processAvatar, authController.uploadAvatar);

module.exports = router;
