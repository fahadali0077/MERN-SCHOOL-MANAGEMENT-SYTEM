const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { AppError } = require('./errorHandler');
const { cache } = require('../config/redis');

// Verify access token
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first, then cookies
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check blacklist (logout tokens)
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next(new AppError('Token has been invalidated', 401));
    }

    // Get user (with caching)
    let user = await cache.get(`user:${decoded.id}`);
    if (!user) {
      user = await User.findById(decoded.id)
        .select('-password -refreshTokens')
        .lean();
      if (!user) return next(new AppError('User not found', 401));
      await cache.set(`user:${decoded.id}`, user, 300);
    }

    if (!user.isActive) {
      return next(new AppError('Account has been deactivated', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        `Access denied. Required role(s): ${roles.join(', ')}`,
        403
      ));
    }
    next();
  };
};

// School-level access control (tenant isolation)
const authorizeSchool = async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    
    // Super admin can access all schools
    if (req.user.role === 'superAdmin') return next();

    // Others can only access their own school
    if (req.user.schoolId?.toString() !== schoolId) {
      return next(new AppError('Access denied to this school', 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication (for public routes that behave differently when logged in)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();
    req.user = user;
    next();
  } catch {
    next(); // Continue without auth
  }
};

module.exports = { authenticate, authorize, authorizeSchool, optionalAuth };
