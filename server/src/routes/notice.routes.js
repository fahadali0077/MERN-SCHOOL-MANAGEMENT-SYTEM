const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const Notice = require('../models/Notice.model');
const { successResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const notificationService = require('../services/notification.service');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { skip, limit, sort, page, filterQuery } = buildQuery(req.query);
    const schoolId = req.user.schoolId;
    const cacheKey = `notices:${schoolId}:${page}`;
    const cached = await cache.get(cacheKey);
    if (cached) return successResponse(res, cached.data, 'Notices fetched', 200, cached.pagination);

    const filter = { schoolId, isPublished: true, ...filterQuery };
    if (req.query.type) filter.type = req.query.type;

    const [notices, total] = await Promise.all([
      Notice.find(filter).populate('author', 'firstName lastName avatar').sort('-publishAt').skip(skip).limit(limit),
      Notice.countDocuments(filter)
    ]);

    const pagination = paginationHelper(page, limit, total);
    await cache.set(cacheKey, { data: notices, pagination }, 300);
    return successResponse(res, notices, 'Notices fetched', 200, pagination);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'firstName lastName avatar');
    if (!notice) return next(new AppError('Notice not found', 404));
    return successResponse(res, notice, 'Notice fetched');
  } catch (err) { next(err); }
});

router.post('/', authorize('schoolAdmin', 'superAdmin', 'teacher'), async (req, res, next) => {
  try {
    const notice = await Notice.create({ ...req.body, schoolId: req.user.schoolId, author: req.user._id });
    
    if (notice.isPublished) {
      await notificationService.sendToRole(req.user.schoolId, 'student', {
        title: notice.title,
        message: notice.content.substring(0, 100),
        type: 'notice',
        link: `/notices/${notice._id}`
      });
    }

    await cache.delPattern(`notices:${req.user.schoolId}:*`);
    return successResponse(res, notice, 'Notice created', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authorize('schoolAdmin', 'superAdmin', 'teacher'), async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      req.body, { new: true }
    );
    if (!notice) return next(new AppError('Notice not found', 404));
    await cache.delPattern(`notices:${req.user.schoolId}:*`);
    return successResponse(res, notice, 'Notice updated');
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    await Notice.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
    await cache.delPattern(`notices:${req.user.schoolId}:*`);
    return successResponse(res, null, 'Notice deleted');
  } catch (err) { next(err); }
});

module.exports = router;
