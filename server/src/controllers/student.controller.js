const Student = require('../models/Student.model');
const User = require('../models/User.model');
const { successResponse, errorResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const crypto = require('crypto');
const emailService = require('../services/email.service');

const studentController = {
  async getAll(req, res, next) {
    try {
      const { skip, limit, sort, page, search, filterQuery } = buildQuery(req.query);
      const schoolId = req.user.schoolId || req.params.schoolId;

      const filter = { schoolId, ...filterQuery };
      if (search) {
        filter.$or = [
          { rollNumber: { $regex: search, $options: 'i' } },
          { admissionNumber: { $regex: search, $options: 'i' } }
        ];
      }

      const cacheKey = `students:${schoolId}:${page}:${limit}:${search || ''}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached.data, 'Students fetched', 200, cached.pagination);

      const [students, total] = await Promise.all([
        Student.find(filter)
          .populate('userId', 'firstName lastName email avatar phone')
          .populate('classId', 'name section grade')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Student.countDocuments(filter)
      ]);

      const pagination = paginationHelper(page, limit, total);
      await cache.set(cacheKey, { data: students, pagination }, 300);

      return successResponse(res, students, 'Students fetched', 200, pagination);
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
        .populate('userId', 'firstName lastName email avatar phone isActive')
        .populate('classId', 'name section grade')
        .populate('parentId', 'firstName lastName email phone');

      if (!student) return next(new AppError('Student not found', 404));
      return successResponse(res, student, 'Student fetched');
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const { firstName, lastName, email, phone, classId, rollNumber, admissionDate, ...studentData } = req.body;
      const schoolId = req.user.schoolId;

      // Check for duplicate roll number in class
      const existing = await Student.findOne({ schoolId, classId, rollNumber });
      if (existing) return next(new AppError('Roll number already taken in this class', 409));

      // Generate admission number
      const count = await Student.countDocuments({ schoolId });
      const year = new Date().getFullYear().toString().slice(-2);
      const admissionNumber = `ADM${year}${String(count + 1).padStart(5, '0')}`;

      // Create user account
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const user = await User.create({
        firstName, lastName, email, phone,
        password: tempPassword,
        role: 'student',
        schoolId
      });

      const student = await Student.create({
        userId: user._id, schoolId, classId, rollNumber,
        admissionNumber, admissionDate: admissionDate || new Date(),
        ...studentData
      });

      // Send welcome email with temp password
      try {
        await emailService.sendWelcomeEmail(user, tempPassword);
      } catch (e) {}

      // ─── Auto-generate fee invoice for admission month ────────────────────
      // If a fee structure exists matching the student's class + feeCategory,
      // automatically create their first invoice so admins don't have to do it manually.
      try {
        const { FeeStructure, FeeInvoice } = require('../models/Fee.model');
        const feeCategory = studentData.feeCategory || 'regular';
        const now = new Date();

        // Find a matching fee structure (by class or school-wide)
        const structure = await FeeStructure.findOne({
          schoolId,
          isActive: true,
          $or: [{ classId: classId }, { classId: null }, { classId: { $exists: false } }],
          category: feeCategory,
        }).sort({ classId: -1 }); // prefer class-specific over generic

        if (structure) {
          const invoiceCount = await FeeInvoice.countDocuments({ schoolId });
          const School = require('../models/School.model');
          const school = await School.findById(schoolId).select('code').lean();
          const schoolCode = school?.code || 'SCH';
          const invoiceNumber = `${schoolCode}-${now.getFullYear().toString().slice(-2)}${String(now.getMonth()+1).padStart(2,'0')}-${String(invoiceCount+1).padStart(5,'0')}`;

          const discount = student.discount || 0;
          const items = structure.components.map(c => ({
            name: c.name, amount: c.amount,
            discount: (c.amount * discount) / 100,
            finalAmount: c.amount - (c.amount * discount) / 100,
          }));
          const subtotal = items.reduce((a, i) => a + i.amount, 0);
          const discountAmt = items.reduce((a, i) => a + i.discount, 0);
          const totalAmount = subtotal - discountAmt;
          const dueDate = new Date(now.getFullYear(), now.getMonth(), structure.components[0]?.dueDay || 15);

          await FeeInvoice.create({
            invoiceNumber, schoolId,
            studentId: student._id, feeStructureId: structure._id,
            month: now.getMonth() + 1, year: now.getFullYear(),
            dueDate, items, subtotal,
            discount: discountAmt, totalAmount, paidAmount: 0, balanceDue: totalAmount,
          });
        }
      } catch (feeErr) {
        // Non-fatal: log but don't block student creation response
        const logger = require('../utils/logger');
        logger.warn(`Auto-fee-generation failed for student ${student._id}: ${feeErr.message}`);
      }
      // ─────────────────────────────────────────────────────────────────────

      await cache.delPattern(`students:${schoolId}:*`);

      const populated = await Student.findById(student._id)
        .populate('userId', 'firstName lastName email avatar')
        .populate('classId', 'name section grade');

      return successResponse(res, populated, 'Student created successfully', 201);
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const { firstName, lastName, email, phone, ...studentData } = req.body;
      const schoolId = req.user.schoolId;

      const student = await Student.findOne({ _id: req.params.id, schoolId });
      if (!student) return next(new AppError('Student not found', 404));

      // Update user fields if provided
      if (firstName || lastName || email || phone) {
        await User.findByIdAndUpdate(student.userId, { 
          ...(firstName && { firstName }), ...(lastName && { lastName }),
          ...(email && { email }), ...(phone && { phone })
        });
      }

      Object.assign(student, studentData);
      await student.save();

      await cache.delPattern(`students:${schoolId}:*`);

      return successResponse(res, student, 'Student updated');
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      const schoolId = req.user.schoolId;
      const student = await Student.findOne({ _id: req.params.id, schoolId });
      if (!student) return next(new AppError('Student not found', 404));

      // Soft delete - mark as inactive
      student.status = 'inactive';
      await student.save();
      await User.findByIdAndUpdate(student.userId, { isActive: false });

      await cache.delPattern(`students:${schoolId}:*`);
      return successResponse(res, null, 'Student deactivated');
    } catch (err) { next(err); }
  },

  async uploadDocument(req, res, next) {
    try {
      if (!req.file) return next(new AppError('No file uploaded', 400));
      
      const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
      if (!student) return next(new AppError('Student not found', 404));

      const doc = {
        name: req.body.name || req.file.originalname,
        type: req.body.type || 'other',
        url: req.file.location || `/uploads/${req.file.filename}`
      };

      student.documents.push(doc);
      await student.save();

      return successResponse(res, doc, 'Document uploaded', 201);
    } catch (err) { next(err); }
  },

  async getStats(req, res, next) {
    try {
      const schoolId = req.user.schoolId;
      const cacheKey = `student-stats:${schoolId}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'Stats fetched');

      const [total, active, byGender, byClass] = await Promise.all([
        Student.countDocuments({ schoolId }),
        Student.countDocuments({ schoolId, status: 'active' }),
        Student.aggregate([
          { $match: { schoolId: require('mongoose').Types.ObjectId.createFromHexString ? schoolId : schoolId } },
          { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]),
        Student.aggregate([
          { $match: { schoolId } },
          { $lookup: { from: 'classes', localField: 'classId', foreignField: '_id', as: 'class' } },
          { $group: { _id: '$classId', className: { $first: { $arrayElemAt: ['$class.name', 0] } }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      const stats = { total, active, inactive: total - active, byGender, byClass };
      await cache.set(cacheKey, stats, 300);

      return successResponse(res, stats, 'Stats fetched');
    } catch (err) { next(err); }
  }
};

module.exports = studentController;
