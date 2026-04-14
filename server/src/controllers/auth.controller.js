const { authService, setCookies, clearCookies } = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
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
      const { accessToken, refreshToken, user } = await authService.refreshTokens(oldToken);
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
  }
};

module.exports = authController;
