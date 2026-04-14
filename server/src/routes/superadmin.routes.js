const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const School = require('../models/School.model');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const { FeeInvoice } = require('../models/Fee.model');
const { successResponse } = require('../utils/apiResponse');
const { cache } = require('../config/redis');

router.use(authenticate, authorize('superAdmin'));

// ─── Platform overview stats ──────────────────────────────────────────────────
router.get('/overview', async (req, res, next) => {
  try {
    const cacheKey = 'superadmin:overview';
    const cached = await cache.get(cacheKey);
    if (cached) return successResponse(res, cached, 'Overview fetched');

    const [
      totalSchools, activeSchools,
      totalUsers, totalStudents,
      totalRevenue, monthlyRevenue,
      schoolsByPlan, recentSchools
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ isActive: true }),
      User.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      FeeInvoice.aggregate([
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      FeeInvoice.aggregate([
        { $match: { createdAt: { $gte: new Date(new Date().setDate(1)) } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      School.aggregate([
        { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
      ]),
      School.find({ isActive: true })
        .populate('admin', 'firstName lastName email')
        .select('name code subscription createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const data = {
      schools: { total: totalSchools, active: activeSchools, inactive: totalSchools - activeSchools },
      users: { total: totalUsers },
      students: { active: totalStudents },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      },
      schoolsByPlan,
      recentSchools,
      generatedAt: new Date()
    };

    await cache.set(cacheKey, data, 300);
    return successResponse(res, data, 'Overview fetched');
  } catch (err) { next(err); }
});

// ─── Per-school breakdown ─────────────────────────────────────────────────────
router.get('/schools/:schoolId/stats', async (req, res, next) => {
  try {
    const { schoolId } = req.params;
    const cacheKey = `superadmin:school:${schoolId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return successResponse(res, cached, 'School stats fetched');

    const [
      school, studentCount, teacherCount,
      revenue, pendingFees
    ] = await Promise.all([
      School.findById(schoolId).populate('admin', 'firstName lastName email'),
      Student.countDocuments({ schoolId, status: 'active' }),
      User.countDocuments({ schoolId, role: 'teacher', isActive: true }),
      FeeInvoice.aggregate([
        { $match: { schoolId: require('mongoose').Types.ObjectId(schoolId) } },
        { $group: { _id: null, collected: { $sum: '$paidAmount' }, pending: { $sum: '$balanceDue' } } }
      ]),
      FeeInvoice.countDocuments({ schoolId, status: { $in: ['pending', 'overdue'] } })
    ]);

    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    const data = {
      school,
      stats: {
        students: studentCount,
        teachers: teacherCount,
        revenue: { collected: revenue[0]?.collected || 0, pending: revenue[0]?.pending || 0 },
        pendingInvoices: pendingFees
      }
    };

    await cache.set(cacheKey, data, 300);
    return successResponse(res, data, 'School stats fetched');
  } catch (err) { next(err); }
});

// ─── Update school subscription ───────────────────────────────────────────────
router.patch('/schools/:schoolId/subscription', async (req, res, next) => {
  try {
    const { plan, maxStudents, maxTeachers, endDate, features } = req.body;
    const school = await School.findByIdAndUpdate(
      req.params.schoolId,
      {
        'subscription.plan': plan,
        'subscription.maxStudents': maxStudents,
        'subscription.maxTeachers': maxTeachers,
        'subscription.endDate': endDate,
        'subscription.features': features,
      },
      { new: true }
    );
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    await cache.del(`superadmin:school:${req.params.schoolId}`);
    return successResponse(res, school, 'Subscription updated');
  } catch (err) { next(err); }
});

// ─── Toggle school active status ──────────────────────────────────────────────
router.patch('/schools/:schoolId/toggle', async (req, res, next) => {
  try {
    const school = await School.findById(req.params.schoolId);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });
    school.isActive = !school.isActive;
    await school.save();
    await cache.del(`superadmin:school:${req.params.schoolId}`);
    await cache.del('superadmin:overview');
    return successResponse(res, { isActive: school.isActive }, `School ${school.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
});

// ─── Platform activity feed ───────────────────────────────────────────────────
router.get('/activity', async (req, res, next) => {
  try {
    const [recentUsers, recentStudents] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(10)
        .select('firstName lastName role schoolId createdAt')
        .populate('schoolId', 'name'),
      Student.find({ status: 'active' }).sort({ createdAt: -1 }).limit(10)
        .populate('userId', 'firstName lastName')
        .populate('schoolId', 'name')
        .select('admissionNumber admissionDate classId schoolId')
    ]);

    return successResponse(res, { recentUsers, recentStudents }, 'Activity fetched');
  } catch (err) { next(err); }
});

// ─── Queue stats ──────────────────────────────────────────────────────────────
router.get('/queues', async (req, res, next) => {
  try {
    const { jobs } = require('../jobs');
    const stats = await jobs.getStats();
    return successResponse(res, stats, 'Queue stats fetched');
  } catch (err) { next(err); }
});

module.exports = router;
