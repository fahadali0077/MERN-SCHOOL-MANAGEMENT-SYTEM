const Student = require('../models/Student.model');
const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const { Exam, Marks } = require('../models/Marks.model');
const { FeeInvoice } = require('../models/Fee.model');
const Notice = require('../models/Notice.model');
const { successResponse } = require('../utils/apiResponse');
const { cache } = require('../config/redis');

const dashboardController = {
  async getAdminDashboard(req, res, next) {
    try {
      const schoolId = req.user.schoolId;
      const cacheKey = `dashboard:admin:${schoolId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'Dashboard data fetched');

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      const [
        totalStudents, activeStudents,
        totalTeachers, activeTeachers,
        todayAttendance, monthlyFeeCollection,
        lastMonthFeeCollection, recentNotices,
        feeStats, upcomingExams,
        attendanceTrend
      ] = await Promise.all([
        Student.countDocuments({ schoolId }),
        Student.countDocuments({ schoolId, status: 'active' }),
        User.countDocuments({ schoolId, role: 'teacher' }),
        User.countDocuments({ schoolId, role: 'teacher', isActive: true }),
        Attendance.aggregate([
          { $match: { schoolId, date: today } },
          { $unwind: '$records' },
          { $group: { _id: '$records.status', count: { $sum: 1 } } }
        ]),
        FeeInvoice.aggregate([
          { $match: { schoolId, 'payments.date': { $gte: monthStart } } },
          { $unwind: '$payments' },
          { $match: { 'payments.date': { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: '$payments.amount' } } }
        ]),
        FeeInvoice.aggregate([
          { $match: { schoolId, 'payments.date': { $gte: lastMonthStart, $lte: lastMonthEnd } } },
          { $unwind: '$payments' },
          { $match: { 'payments.date': { $gte: lastMonthStart, $lte: lastMonthEnd } } },
          { $group: { _id: null, total: { $sum: '$payments.amount' } } }
        ]),
        Notice.find({ schoolId, isPublished: true }).sort({ createdAt: -1 }).limit(5).select('title type createdAt priority'),
        FeeInvoice.aggregate([
          { $match: { schoolId } },
          { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
        ]),
        Exam.find({ schoolId, startDate: { $gte: today } }).sort({ startDate: 1 }).limit(5)
          .populate('classId', 'name section'),
        // Last 7 days attendance trend
        Attendance.aggregate([
          { $match: { schoolId, date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
          { $unwind: '$records' },
          { $group: {
            _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, status: '$records.status' },
            count: { $sum: 1 }
          }},
          { $sort: { '_id.date': 1 } }
        ])
      ]);

      // Process attendance today
      const attendanceSummary = todayAttendance.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { present: 0, absent: 0, late: 0 });

      const attendanceRate = activeStudents > 0
        ? parseFloat(((attendanceSummary.present / activeStudents) * 100).toFixed(1))
        : 0;

      // Revenue comparison
      const currentRevenue = monthlyFeeCollection[0]?.total || 0;
      const lastRevenue = lastMonthFeeCollection[0]?.total || 0;
      const revenueGrowth = lastRevenue > 0
        ? parseFloat((((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1))
        : 0;

      const data = {
        stats: {
          students: { total: totalStudents, active: activeStudents },
          teachers: { total: totalTeachers, active: activeTeachers },
          attendance: { ...attendanceSummary, rate: attendanceRate },
          revenue: { current: currentRevenue, last: lastRevenue, growth: revenueGrowth }
        },
        feeStats,
        upcomingExams,
        recentNotices,
        attendanceTrend,
        generatedAt: new Date()
      };

      await cache.set(cacheKey, data, 300); // 5 min cache
      return successResponse(res, data, 'Dashboard data fetched');
    } catch (err) { next(err); }
  },

  async getTeacherDashboard(req, res, next) {
    try {
      const teacherId = req.user._id;
      const schoolId = req.user.schoolId;
      const cacheKey = `dashboard:teacher:${teacherId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'Dashboard fetched');

      const { Class } = require('../models/Class.model');
      const today = new Date(); today.setHours(0, 0, 0, 0);

      const [myClasses, todayAttendance, pendingMarks, recentNotices] = await Promise.all([
        Class.find({ schoolId, 'subjects.teacherId': teacherId, isActive: true })
          .select('name section grade subjects'),
        Attendance.countDocuments({ schoolId, teacherId, date: today }),
        Marks.countDocuments({ schoolId, teacherId, isPublished: false }),
        Notice.find({ schoolId, isPublished: true, targetAudience: { $in: ['all', 'teachers'] } })
          .sort({ createdAt: -1 }).limit(5)
      ]);

      const data = { myClasses, todayAttendance, pendingMarks, recentNotices };
      await cache.set(cacheKey, data, 300);
      return successResponse(res, data, 'Dashboard fetched');
    } catch (err) { next(err); }
  },

  async getStudentDashboard(req, res, next) {
    try {
      const userId = req.user._id;
      const schoolId = req.user.schoolId;

      const student = await Student.findOne({ userId, schoolId })
        .populate('classId', 'name section grade');

      if (!student) return successResponse(res, {}, 'Dashboard fetched');

      const [attendanceStats, recentMarks, pendingFees, notices] = await Promise.all([
        Attendance.aggregate([
          { $match: { schoolId, 'records.studentId': student._id } },
          { $unwind: '$records' },
          { $match: { 'records.studentId': student._id } },
          { $group: { _id: '$records.status', count: { $sum: 1 } } }
        ]),
        Marks.find({ schoolId, studentId: student._id, isPublished: true })
          .sort({ createdAt: -1 }).limit(5)
          .populate('subjectId', 'name').populate('examId', 'name type'),
        FeeInvoice.find({ schoolId, studentId: student._id, status: { $in: ['pending', 'overdue'] } })
          .select('invoiceNumber totalAmount dueDate status month year'),
        Notice.find({
          schoolId, isPublished: true,
          $or: [
            { targetAudience: { $in: ['all', 'students'] } },
            { targetClasses: student.classId }
          ]
        }).sort({ createdAt: -1 }).limit(5)
      ]);

      const attendance = attendanceStats.reduce((acc, i) => { acc[i._id] = i.count; return acc; }, {});
      const totalDays = Object.values(attendance).reduce((a, b) => a + b, 0);
      
      return successResponse(res, {
        student,
        attendance: { ...attendance, total: totalDays, rate: totalDays > 0 ? ((attendance.present || 0) / totalDays * 100).toFixed(1) : 0 },
        recentMarks,
        pendingFees,
        notices
      }, 'Dashboard fetched');
    } catch (err) { next(err); }
  }
};

module.exports = dashboardController;
