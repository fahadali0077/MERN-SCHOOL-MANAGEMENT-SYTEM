const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const { cache } = require('../config/redis');
const { AppError } = require('../middlewares/errorHandler');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

const generateTokens = (userId, role, schoolId) => {
  const accessToken = jwt.sign(
    { id: userId, role, schoolId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000 // 15 min
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth/refresh'
  });
};

const clearCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
};

const authService = {
  async register(data) {
    const { firstName, lastName, email, password, role, schoolId, phone } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError('Email already registered', 409);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      firstName, lastName, email, password, role: role || 'student',
      schoolId, phone,
      emailVerificationToken: crypto.createHash('sha256').update(verificationToken).digest('hex'),
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (err) {
      // Don't block registration if email fails
      console.error('Email send failed:', err.message);
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.schoolId);
    
    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
  },

  async login(email, password, res) {
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +refreshTokens');
    
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.isLocked) throw new AppError('Account temporarily locked due to too many failed attempts', 423);
    if (!user.isActive) throw new AppError('Account has been deactivated. Contact admin.', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role, user.schoolId);
    
    // Store new refresh token (keep max 5)
    user.refreshTokens.push({ token: refreshToken });
    if (user.refreshTokens.length > 5) user.refreshTokens.shift();
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Invalidate user cache
    await cache.del(`user:${user._id}`);

    return { user, accessToken, refreshToken };
  },

  async refreshTokens(oldRefreshToken) {
    if (!oldRefreshToken) throw new AppError('Refresh token required', 401);

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': oldRefreshToken
    }).select('+refreshTokens');

    if (!user) throw new AppError('Refresh token not found or already used', 401);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== oldRefreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role, user.schoolId);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    await cache.del(`user:${user._id}`);

    return { accessToken, refreshToken: newRefreshToken, user };
  },

  async logout(userId, token, refreshToken) {
    // Blacklist access token (TTL = 15min)
    if (token) await cache.set(`blacklist:${token}`, '1', 900);
    
    // Remove refresh token from DB
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: refreshToken } }
    });

    await cache.del(`user:${userId}`);
  },

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) return; // Silent fail for security

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await emailService.sendPasswordResetEmail(user, resetToken);
    return resetToken;
  },

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+refreshTokens');

    if (!user) throw new AppError('Token is invalid or expired', 400);

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    await cache.del(`user:${user._id}`);
    return user;
  },

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) throw new AppError('Token is invalid or expired', 400);

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return user;
  }
};

module.exports = { authService, generateTokens, setCookies, clearCookies };
