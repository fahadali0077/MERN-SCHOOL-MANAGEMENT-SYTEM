const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { Class, Subject } = require('../models/Class.model');
const { successResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');

router.use(authenticate);

// Classes
router.get('/', async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId;
    const cacheKey = `classes:${schoolId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return successResponse(res, cached, 'Classes fetched');

    const classes = await Class.find({ schoolId, isActive: true })
      .populate('classTeacher', 'firstName lastName avatar')
      .populate('subjects.subjectId', 'name code')
      .populate('subjects.teacherId', 'firstName lastName')
      .sort({ grade: 1, section: 1 });

    await cache.set(cacheKey, classes, 300);
    return successResponse(res, classes, 'Classes fetched');
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
      .populate('classTeacher', 'firstName lastName email avatar')
      .populate('subjects.subjectId subjects.teacherId');
    if (!cls) return next(new AppError('Class not found', 404));
    return successResponse(res, cls, 'Class fetched');
  } catch (err) { next(err); }
});

router.post('/', authorize('schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    const cls = await Class.create({ ...req.body, schoolId: req.user.schoolId });
    await cache.del(`classes:${req.user.schoolId}`);
    return successResponse(res, cls, 'Class created', 201);
  } catch (err) { next(err); }
});

router.put('/:id', authorize('schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      req.body, { new: true, runValidators: true }
    );
    if (!cls) return next(new AppError('Class not found', 404));
    await cache.del(`classes:${req.user.schoolId}`);
    return successResponse(res, cls, 'Class updated');
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    await Class.findOneAndUpdate({ _id: req.params.id, schoolId: req.user.schoolId }, { isActive: false });
    await cache.del(`classes:${req.user.schoolId}`);
    return successResponse(res, null, 'Class deleted');
  } catch (err) { next(err); }
});

// Timetable
router.put('/:id/timetable', authorize('schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      { timetable: req.body.timetable }, { new: true }
    );
    await cache.del(`classes:${req.user.schoolId}`);
    return successResponse(res, cls.timetable, 'Timetable updated');
  } catch (err) { next(err); }
});

// Subjects
router.get('/subjects/all', async (req, res, next) => {
  try {
    const subjects = await Subject.find({ schoolId: req.user.schoolId, isActive: true }).sort('name');
    return successResponse(res, subjects, 'Subjects fetched');
  } catch (err) { next(err); }
});

router.post('/subjects', authorize('schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    const subject = await Subject.create({ ...req.body, schoolId: req.user.schoolId });
    return successResponse(res, subject, 'Subject created', 201);
  } catch (err) { next(err); }
});

module.exports = router;
