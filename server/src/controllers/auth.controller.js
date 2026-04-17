const { authService, setCookies, clearCookies } = require('../services/auth.service');
const { successResponse } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');

const authController = {
  async register(req, res, next) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(req.body);
      setCookies(res, accessToken, refreshToken);

      const userResponse = {
        _id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, schoolId: user.schoolId,
        avatar: user.avatar, isEmailVerified: user.isEmailVerified
      };

      return successResponse(res, { user: userResponse, accessToken }, 'Registration successful', 201);
    } catch (err) { next(err); }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return next(new AppError('Email and password are required', 400));

      const { user, accessToken, refreshToken } = await authService.login(email, password, res);
      setCookies(res, accessToken, refreshToken);

      const userResponse = {
        _id: user._id, firstName: user.firstName, lastName: user.lastName,
        email: user.email, role: user.role, schoolId: user.schoolId,
        avatar: user.avatar, isEmailVerified: user.isEmailVerified,
        preferences: user.preferences, lastLogin: user.lastLogin
      };

      return successResponse(res, { user: userResponse, accessToken }, 'Login successful');
    } catch (err) { next(err); }
  },

  async refresh(req, res, next) {
    try {
      const oldToken = req.cookies?.refreshToken;
      if (!oldToken) return next(new AppError('Refresh token missing', 401));
      const { accessToken, refreshToken } = await authService.refreshTokens(oldToken);
      setCookies(res, accessToken, refreshToken);
      return successResponse(res, { accessToken }, 'Token refreshed');
    } catch (err) { next(err); }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await authService.logout(req.user._id, req.token, refreshToken);
      clearCookies(res);
      return successResponse(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  },

  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      return successResponse(res, null, 'If an account exists with this email, a reset link has been sent.');
    } catch (err) { next(err); }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return successResponse(res, null, 'Password reset successful. Please log in.');
    } catch (err) { next(err); }
  },

  async verifyEmail(req, res, next) {
    try {
      await authService.verifyEmail(req.query.token);
      return successResponse(res, null, 'Email verified successfully');
    } catch (err) { next(err); }
  },

  async getMe(req, res, next) {
    try {
      return successResponse(res, { user: req.user }, 'Profile fetched');
    } catch (err) { next(err); }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const User = require('../models/User.model');
      const user = await User.findById(req.user._id).select('+password');

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) return next(new AppError('Current password is incorrect', 400));

      user.password = newPassword;
      await user.save();

      const { cache } = require('../config/redis');
      await cache.del(`user:${user._id}`);

      clearCookies(res);
      return successResponse(res, null, 'Password changed. Please log in again.');
    } catch (err) { next(err); }
  },


  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone } = req.body;
      const User = require('../models/User.model');
      const allowed = {};
      if (firstName) allowed.firstName = firstName.trim();
      if (lastName)  allowed.lastName  = lastName.trim();
      if (phone !== undefined) allowed.phone = phone;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        allowed,
        { new: true, select: '-password -refreshTokens', runValidators: true }
      ).lean();

      if (!user) return next(new AppError('User not found', 404));
      const { cache } = require('../config/redis');
      await cache.del(`user:${req.user._id}`);
      return successResponse(res, { user }, 'Profile updated');
    } catch (err) { next(err); }
  },

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) return next(new AppError('No file uploaded', 400));
      const avatarUrl = req.file.location;
      const User = require('../models/User.model');
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatarUrl },
        { new: true, select: '-password -refreshTokens' }
      ).lean();
      const { cache } = require('../config/redis');
      await cache.del(`user:${req.user._id}`);
      return successResponse(res, { user, avatarUrl }, 'Avatar updated');
    } catch (err) { next(err); }
  },

  // FIX: New — called by SettingsPage.tsx to persist notification preferences
  async updatePreferences(req, res, next) {
    try {
      const { notifications } = req.body;
      const User = require('../models/User.model');

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'preferences.notifications': notifications } },
        { new: true, select: '-password -refreshTokens' }
      ).lean();

      if (!user) return next(new AppError('User not found', 404));

      // Bust the Redis user cache so AuthInitializer picks up the new preferences
      const { cache } = require('../config/redis');
      await cache.del(`user:${req.user._id}`);

      return successResponse(res, { user }, 'Preferences updated');
    } catch (err) { next(err); }
  },

  // FIX: New — called by SettingsPage.tsx danger zone
  async deleteAccount(req, res, next) {
    try {
      const { password } = req.body;
      if (!password) return next(new AppError('Password is required to delete your account', 400));

      const User = require('../models/User.model');
      const bcrypt = require('bcryptjs');

      const user = await User.findById(req.user._id).select('+password');
      if (!user) return next(new AppError('User not found', 404));

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return next(new AppError('Incorrect password', 401));

      // Soft-delete: mark inactive and anonymise email so it can't be re-used
      await User.findByIdAndUpdate(req.user._id, {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`,
        refreshTokens: [],
      });

      const { cache } = require('../config/redis');
      await cache.del(`user:${req.user._id}`);

      clearCookies(res);
      return successResponse(res, null, 'Account deleted');
    } catch (err) { next(err); }
  },
};

module.exports = authController;
