const User = require('../models/User.model');
const { Class } = require('../models/Class.model');
const Attendance = require('../models/Attendance.model');
const { successResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const emailService = require('../services/email.service');
const crypto = require('crypto');

const teacherController = {
  async getAll(req, res, next) {
    try {
      const { skip, limit, sort, page, search, filterQuery } = buildQuery(req.query);
      const schoolId = req.user.schoolId;

      const filter = { schoolId, role: 'teacher', ...filterQuery };
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const [teachers, total] = await Promise.all([
        User.find(filter)
          .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
          .sort(sort).skip(skip).limit(limit)
          .lean(),
        User.countDocuments(filter)
      ]);

      return successResponse(res, teachers, 'Teachers fetched', 200, paginationHelper(page, limit, total));
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const teacher = await User.findOne({ _id: req.params.id, role: 'teacher', schoolId: req.user.schoolId })
        .select('-password -refreshTokens');
      if (!teacher) return next(new AppError('Teacher not found', 404));

      // Get assigned classes
      const classes = await Class.find({
        schoolId: req.user.schoolId,
        'subjects.teacherId': teacher._id,
        isActive: true
      }).select('name section grade subjects').lean();

      return successResponse(res, { ...teacher.toObject(), classes }, 'Teacher fetched');
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const { firstName, lastName, email, phone, ...rest } = req.body;
      const tempPassword = crypto.randomBytes(8).toString('hex');

      const teacher = await User.create({
        firstName, lastName, email, phone,
        password: tempPassword,
        role: 'teacher',
        schoolId: req.user.schoolId,
        isEmailVerified: false,
        isActive: true,
        ...rest
      });

      try {
        await emailService.sendWelcomeEmail(teacher, tempPassword);
      } catch (e) {
        // Non-blocking
      }

      const { password, refreshTokens, ...teacherData } = teacher.toObject();
      await cache.delPattern(`teachers:${req.user.schoolId}:*`);

      return successResponse(res, teacherData, 'Teacher created. Welcome email sent.', 201);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      // Never allow role or password change through this endpoint
      const { password, role, schoolId, ...updateData } = req.body;

      const teacher = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'teacher', schoolId: req.user.schoolId },
        updateData,
        { new: true, runValidators: true, select: '-password -refreshTokens' }
      );

      if (!teacher) return next(new AppError('Teacher not found', 404));
      await cache.delPattern(`teachers:${req.user.schoolId}:*`);
      await cache.del(`user:${teacher._id}`);

      return successResponse(res, teacher, 'Teacher updated');
    } catch (err) { next(err); }
  },

  async toggleStatus(req, res, next) {
    try {
      const teacher = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'teacher', schoolId: req.user.schoolId },
        { isActive: req.body.isActive },
        { new: true, select: '-password -refreshTokens' }
      );
      if (!teacher) return next(new AppError('Teacher not found', 404));
      await cache.del(`user:${teacher._id}`);
      return successResponse(res, teacher, `Teacher ${teacher.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) { next(err); }
  },

  async getStats(req, res, next) {
    try {
      const schoolId = req.user.schoolId;
      const cacheKey = `teacher-stats:${schoolId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'Stats fetched');

      const [total, active, withClasses] = await Promise.all([
        User.countDocuments({ schoolId, role: 'teacher' }),
        User.countDocuments({ schoolId, role: 'teacher', isActive: true }),
        Class.aggregate([
          { $match: { schoolId, isActive: true } },
          { $unwind: '$subjects' },
          { $group: { _id: '$subjects.teacherId' } },
          { $count: 'count' }
        ])
      ]);

      const stats = { total, active, inactive: total - active, withClasses: withClasses[0]?.count || 0 };
      await cache.set(cacheKey, stats, 300);
      return successResponse(res, stats, 'Stats fetched');
    } catch (err) { next(err); }
  },


  async deleteTeacher(req, res, next) {
    try {
      const User = require('../models/User.model');
      const teacher = await User.findOneAndUpdate(
        { _id: req.params.id, role: 'teacher', schoolId: req.user.schoolId },
        { isActive: false },
        { new: true }
      );
      if (!teacher) return next(new AppError('Teacher not found', 404));
      const { cache } = require('../config/redis');
      await cache.del(`user:${teacher._id}`);
      return successResponse(res, null, 'Teacher deactivated');
    } catch (err) { next(err); }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) return next(new AppError('No file uploaded', 400));
      const avatarUrl = req.file.location || `/uploads/${req.file.filename}`;

      await User.findOneAndUpdate(
        { _id: req.params.id, schoolId: req.user.schoolId },
        { avatar: avatarUrl }
      );
      await cache.del(`user:${req.params.id}`);

      return successResponse(res, { avatarUrl }, 'Avatar updated');
    } catch (err) { next(err); }
  }
};

module.exports = teacherController;
