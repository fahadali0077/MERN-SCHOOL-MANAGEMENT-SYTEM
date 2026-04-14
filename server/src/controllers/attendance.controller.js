const QRCode = require('qrcode');
const crypto = require('crypto');
const Attendance = require('../models/Attendance.model');
const Student = require('../models/Student.model');
const { successResponse, errorResponse, paginationHelper } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const { emitToClass } = require('../sockets');
const notificationService = require('../services/notification.service');

const attendanceController = {
  // Mark attendance manually
  async mark(req, res, next) {
    try {
      const { classId, date, period, records, type = 'daily' } = req.body;
      const schoolId = req.user.schoolId;

      let attendance = await Attendance.findOne({
        schoolId, classId,
        date: new Date(date),
        ...(period && { period })
      });

      if (attendance && attendance.isFinalized) {
        return next(new AppError('Attendance is already finalized', 400));
      }

      if (attendance) {
        // Update existing records
        for (const record of records) {
          const idx = attendance.records.findIndex(r => r.studentId.toString() === record.studentId);
          if (idx !== -1) {
            attendance.records[idx] = { ...attendance.records[idx].toObject(), ...record };
          } else {
            attendance.records.push(record);
          }
        }
      } else {
        attendance = new Attendance({
          schoolId, classId, date: new Date(date), period, type,
          teacherId: req.user._id,
          records
        });
      }

      await attendance.save();

      // Emit real-time update to class room
      emitToClass(classId, 'attendance:updated', { classId, date, summary: attendance.summary });

      // Send alerts for absent students
      const absentRecords = records.filter(r => r.status === 'absent');
      if (absentRecords.length > 0) {
        const absentStudentIds = absentRecords.map(r => r.studentId);
        const students = await Student.find({ _id: { $in: absentStudentIds } })
          .populate('parentId', 'firstName email')
          .populate('userId', 'firstName');

        for (const student of students) {
          if (student.parentId) {
            await notificationService.create({
              schoolId,
              recipient: student.parentId._id,
              title: 'Attendance Alert',
              message: `${student.userId?.firstName || 'Your child'} was marked absent today`,
              type: 'attendance',
              link: '/attendance'
            });
          }
        }
      }

      await cache.delPattern(`attendance:${schoolId}:*`);
      return successResponse(res, attendance, 'Attendance marked');
    } catch (err) { next(err); }
  },

  // Generate QR code for attendance session
  async generateQR(req, res, next) {
    try {
      const { classId, date, period, expiresInMinutes = 15 } = req.body;
      const schoolId = req.user.schoolId;

      const qrToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      let attendance = await Attendance.findOne({ schoolId, classId, date: new Date(date), period });

      if (!attendance) {
        attendance = new Attendance({
          schoolId, classId, date: new Date(date), period,
          teacherId: req.user._id,
          records: []
        });
      }

      attendance.qrSession = { isActive: true, token: qrToken, expiresAt };
      await attendance.save();

      // Generate QR image
      const qrData = JSON.stringify({ token: qrToken, classId, date, period, schoolId });
      const qrImage = await QRCode.toDataURL(qrData, { 
        width: 300, 
        color: { dark: '#0066FF', light: '#0D0D1A' }
      });

      // Emit QR session start to class
      emitToClass(classId, 'attendance:qr-started', { expiresAt, period });

      return successResponse(res, { qrImage, qrToken, expiresAt, attendanceId: attendance._id }, 'QR generated');
    } catch (err) { next(err); }
  },

  // Student scans QR code
  async scanQR(req, res, next) {
    try {
      const { token, studentId } = req.body;

      const attendance = await Attendance.findOne({
        'qrSession.token': token,
        'qrSession.isActive': true,
        'qrSession.expiresAt': { $gt: new Date() }
      });

      if (!attendance) return next(new AppError('QR code is invalid or expired', 400));

      const existingRecord = attendance.records.find(r => r.studentId.toString() === studentId);
      if (existingRecord) return next(new AppError('Attendance already marked', 409));

      attendance.records.push({
        studentId,
        status: 'present',
        checkInTime: new Date(),
        method: 'qr'
      });

      await attendance.save();
      emitToClass(attendance.classId.toString(), 'attendance:student-scanned', { studentId });

      return successResponse(res, null, 'Attendance marked via QR');
    } catch (err) { next(err); }
  },

  // Get class attendance for a date
  async getByClass(req, res, next) {
    try {
      const { classId, date, period } = req.query;
      const schoolId = req.user.schoolId;

      const filter = { schoolId, classId, date: new Date(date) };
      if (period) filter.period = period;

      const cacheKey = `attendance:${schoolId}:${classId}:${date}:${period || 'all'}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'Attendance fetched');

      const attendance = await Attendance.findOne(filter)
        .populate('records.studentId', 'rollNumber')
        .populate({ path: 'records.studentId', populate: { path: 'userId', select: 'firstName lastName avatar' } });

      await cache.set(cacheKey, attendance, 300);
      return successResponse(res, attendance, 'Attendance fetched');
    } catch (err) { next(err); }
  },

  // Get student attendance report
  async getStudentReport(req, res, next) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate, month, year } = req.query;
      const schoolId = req.user.schoolId;

      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
      } else if (month && year) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        dateFilter = { $gte: start, $lte: end };
      }

      const records = await Attendance.find({
        schoolId,
        'records.studentId': studentId,
        ...(Object.keys(dateFilter).length && { date: dateFilter })
      }).select('date period records.$').lean();

      const stats = records.reduce((acc, r) => {
        const record = r.records[0];
        acc.total++;
        if (record?.status === 'present') acc.present++;
        else if (record?.status === 'absent') acc.absent++;
        else if (record?.status === 'late') acc.late++;
        else if (record?.status === 'excused') acc.excused++;
        return acc;
      }, { total: 0, present: 0, absent: 0, late: 0, excused: 0 });

      stats.percentage = stats.total > 0 
        ? parseFloat(((stats.present / stats.total) * 100).toFixed(2))
        : 0;

      return successResponse(res, { stats, records }, 'Student attendance report');
    } catch (err) { next(err); }
  },

  // Finalize attendance (lock from edits)
  async finalize(req, res, next) {
    try {
      const attendance = await Attendance.findOneAndUpdate(
        { _id: req.params.id, schoolId: req.user.schoolId },
        { isFinalized: true },
        { new: true }
      );
      if (!attendance) return next(new AppError('Attendance not found', 404));
      return successResponse(res, attendance, 'Attendance finalized');
    } catch (err) { next(err); }
  }
};

module.exports = attendanceController;
