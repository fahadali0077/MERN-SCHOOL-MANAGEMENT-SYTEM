const { FeeStructure, FeeInvoice } = require('../models/Fee.model');
const Student = require('../models/Student.model');
const { successResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');

const generateInvoiceNumber = (schoolCode, count) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  return `${schoolCode || 'SCH'}-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

const feeController = {
  // Fee Structure CRUD
  async createStructure(req, res, next) {
    try {
      const structure = await FeeStructure.create({ ...req.body, schoolId: req.user.schoolId });
      return successResponse(res, structure, 'Fee structure created', 201);
    } catch (err) { next(err); }
  },

  async getStructures(req, res, next) {
    try {
      const structures = await FeeStructure.find({ schoolId: req.user.schoolId, isActive: true })
        .populate('classId', 'name section grade');
      return successResponse(res, structures, 'Fee structures fetched');
    } catch (err) { next(err); }
  },

  // Generate invoices for entire class
  async generateClassInvoices(req, res, next) {
    try {
      const { classId, feeStructureId, month, year, dueDate } = req.body;
      const schoolId = req.user.schoolId;

      const [structure, students] = await Promise.all([
        FeeStructure.findOne({ _id: feeStructureId, schoolId }),
        Student.find({ schoolId, classId, status: 'active' }).populate('userId', 'firstName lastName email')
      ]);

      if (!structure) return next(new AppError('Fee structure not found', 404));

      const existingCount = await FeeInvoice.countDocuments({ schoolId });
      const invoices = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        // Check if invoice already exists
        const exists = await FeeInvoice.findOne({ schoolId, studentId: student._id, month, year });
        if (exists) continue;

        const discount = student.discount || 0;
        const items = structure.components.map(c => ({
          name: c.name,
          amount: c.amount,
          discount: (c.amount * discount) / 100,
          finalAmount: c.amount - (c.amount * discount) / 100
        }));

        const subtotal = items.reduce((a, i) => a + i.amount, 0);
        const discountAmount = items.reduce((a, i) => a + i.discount, 0);
        const totalAmount = subtotal - discountAmount;

        invoices.push({
          invoiceNumber: generateInvoiceNumber('SCH', existingCount + i),
          schoolId, studentId: student._id, feeStructureId,
          month, year,
          dueDate: new Date(dueDate),
          items, subtotal,
          discount: discountAmount,
          totalAmount, paidAmount: 0,
          balanceDue: totalAmount
        });
      }

      if (invoices.length === 0) {
        return successResponse(res, [], 'All invoices already generated for this period');
      }

      const created = await FeeInvoice.insertMany(invoices);
      await cache.delPattern(`fees:${schoolId}:*`);

      return successResponse(res, { count: created.length }, `${created.length} invoices generated`, 201);
    } catch (err) { next(err); }
  },

  // Get invoices
  async getInvoices(req, res, next) {
    try {
      const { skip, limit, sort, page, filterQuery } = buildQuery(req.query);
      const { search, status, month, year } = req.query;
      const schoolId = req.user.schoolId;

      const filter = { schoolId, ...filterQuery };
      if (status) filter.status = status;
      if (month) filter.month = parseInt(month);
      if (year) filter.year = parseInt(year);

      const [invoices, total, stats] = await Promise.all([
        FeeInvoice.find(filter)
          .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName' } })
          .sort(sort).skip(skip).limit(limit),
        FeeInvoice.countDocuments(filter),
        FeeInvoice.aggregate([
          { $match: { schoolId: require('mongoose').Types.ObjectId(schoolId) } },
          { $group: {
            _id: null,
            totalCollected: { $sum: '$paidAmount' },
            totalPending: { $sum: '$balanceDue' },
            totalInvoiced: { $sum: '$totalAmount' }
          }}
        ])
      ]);

      return successResponse(res, { invoices, stats: stats[0] }, 'Invoices fetched', 200, paginationHelper(page, limit, total));
    } catch (err) { next(err); }
  },

  // Record payment
  async recordPayment(req, res, next) {
    try {
      const { amount, method, transactionId, notes } = req.body;
      const schoolId = req.user.schoolId;

      const invoice = await FeeInvoice.findOne({ _id: req.params.id, schoolId })
        .populate({ path: 'studentId', populate: [{ path: 'userId', select: 'firstName lastName email' }, { path: 'parentId', select: 'firstName email' }] });

      if (!invoice) return next(new AppError('Invoice not found', 404));
      if (invoice.status === 'paid') return next(new AppError('Invoice already paid', 400));
      if (amount > invoice.balanceDue) return next(new AppError('Payment exceeds balance due', 400));

      invoice.payments.push({
        amount, method, transactionId,
        receivedBy: req.user._id,
        date: new Date()
      });
      invoice.paidAmount += amount;
      await invoice.save(); // triggers pre-save for status update

      // Notify parent
      const student = invoice.studentId;
      if (student?.parentId) {
        await notificationService.create({
          schoolId,
          recipient: student.parentId._id,
          title: 'Payment Recorded',
          message: `Payment of $${amount} received for invoice #${invoice.invoiceNumber}`,
          type: 'fee'
        });
      }

      await cache.delPattern(`fees:${schoolId}:*`);
      return successResponse(res, invoice, 'Payment recorded');
    } catch (err) { next(err); }
  },

  // Student's fee overview
  async getStudentFees(req, res, next) {
    try {
      const { studentId } = req.params;
      const schoolId = req.user.schoolId;

      const invoices = await FeeInvoice.find({ schoolId, studentId })
        .sort({ year: -1, month: -1 });

      const summary = invoices.reduce((acc, inv) => {
        acc.total += inv.totalAmount;
        acc.paid += inv.paidAmount;
        acc.pending += inv.balanceDue;
        return acc;
      }, { total: 0, paid: 0, pending: 0 });

      return successResponse(res, { invoices, summary }, 'Student fees fetched');
    } catch (err) { next(err); }
  },

  // Send fee reminders
  async sendReminders(req, res, next) {
    try {
      const schoolId = req.user.schoolId;
      const overdueInvoices = await FeeInvoice.find({ schoolId, status: 'overdue' })
        .populate({ path: 'studentId', populate: { path: 'userId parentId', select: 'firstName email' } });

      let sent = 0;
      for (const invoice of overdueInvoices) {
        const parent = invoice.studentId?.parentId;
        if (parent?.email) {
          try {
            await emailService.sendFeeReminder(parent, invoice);
            invoice.remindersSent += 1;
            invoice.lastReminderAt = new Date();
            await invoice.save({ validateBeforeSave: false });
            sent++;
          } catch (e) {}
        }
      }

      return successResponse(res, { sent }, `${sent} reminders sent`);
    } catch (err) { next(err); }
  }
};

module.exports = feeController;
