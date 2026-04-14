const School = require('../models/School.model');
const User = require('../models/User.model');
const { successResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');

const schoolController = {
  async getAll(req, res, next) {
    try {
      const { skip, limit, sort, page, search } = buildQuery(req.query);
      const filter = {};
      if (search) filter.name = { $regex: search, $options: 'i' };
      if (req.query.plan) filter['subscription.plan'] = req.query.plan;
      if (req.query.active !== undefined) filter.isActive = req.query.active === 'true';

      const [schools, total] = await Promise.all([
        School.find(filter)
          .populate('admin', 'firstName lastName email')
          .sort(sort).skip(skip).limit(limit)
          .lean(),
        School.countDocuments(filter)
      ]);

      return successResponse(res, schools, 'Schools fetched', 200, paginationHelper(page, limit, total));
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const schoolId = req.user.role === 'superAdmin' ? req.params.id : req.user.schoolId;
      const cacheKey = `school:${schoolId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'School fetched');

      const school = await School.findById(schoolId)
        .populate('admin', 'firstName lastName email avatar phone');
      if (!school) return next(new AppError('School not found', 404));

      await cache.set(cacheKey, school, 600);
      return successResponse(res, school, 'School fetched');
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const school = await School.create(req.body);
      return successResponse(res, school, 'School created', 201);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const schoolId = req.user.role === 'superAdmin' ? req.params.id : req.user.schoolId;
      const school = await School.findByIdAndUpdate(schoolId, req.body, {
        new: true,
        runValidators: true
      });
      if (!school) return next(new AppError('School not found', 404));
      await cache.del(`school:${schoolId}`);
      return successResponse(res, school, 'School updated');
    } catch (err) { next(err); }
  },

  // ─── Branch management ─────────────────────────────────────────────────────
  async addBranch(req, res, next) {
    try {
      const school = await School.findByIdAndUpdate(
        req.params.id,
        { $push: { branches: req.body } },
        { new: true }
      );
      if (!school) return next(new AppError('School not found', 404));
      const newBranch = school.branches[school.branches.length - 1];
      await cache.del(`school:${req.params.id}`);
      return successResponse(res, newBranch, 'Branch added', 201);
    } catch (err) { next(err); }
  },

  async updateBranch(req, res, next) {
    try {
      const { branchId } = req.params;
      const updates = {};
      Object.keys(req.body).forEach(key => {
        updates[`branches.$.${key}`] = req.body[key];
      });

      const school = await School.findOneAndUpdate(
        { _id: req.params.id, 'branches._id': branchId },
        { $set: updates },
        { new: true }
      );
      if (!school) return next(new AppError('Branch not found', 404));
      await cache.del(`school:${req.params.id}`);
      const branch = school.branches.id(branchId);
      return successResponse(res, branch, 'Branch updated');
    } catch (err) { next(err); }
  },

  async deleteBranch(req, res, next) {
    try {
      const school = await School.findByIdAndUpdate(
        req.params.id,
        { $pull: { branches: { _id: req.params.branchId } } },
        { new: true }
      );
      if (!school) return next(new AppError('School not found', 404));
      await cache.del(`school:${req.params.id}`);
      return successResponse(res, null, 'Branch deleted');
    } catch (err) { next(err); }
  },

  // ─── Settings ──────────────────────────────────────────────────────────────
  async updateSettings(req, res, next) {
    try {
      const schoolId = req.user.schoolId;
      const school = await School.findByIdAndUpdate(
        schoolId,
        { $set: { settings: req.body } },
        { new: true }
      );
      if (!school) return next(new AppError('School not found', 404));
      await cache.del(`school:${schoolId}`);
      return successResponse(res, school.settings, 'Settings updated');
    } catch (err) { next(err); }
  },

  // ─── Upload school logo ─────────────────────────────────────────────────────
  async uploadLogo(req, res, next) {
    try {
      if (!req.file) return next(new AppError('No file uploaded', 400));
      const logoUrl = req.file.location || `/uploads/${req.file.filename}`;
      const schoolId = req.user.schoolId || req.params.id;

      await School.findByIdAndUpdate(schoolId, { logo: logoUrl });
      await cache.del(`school:${schoolId}`);
      return successResponse(res, { logoUrl }, 'Logo updated');
    } catch (err) { next(err); }
  }
};

module.exports = schoolController;
