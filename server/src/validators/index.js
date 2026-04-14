const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────
const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2, max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('role').optional().isIn(['superAdmin','schoolAdmin','teacher','student','parent']),
  validate
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  validate
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate
];

// ─── Student Validators ───────────────────────────────────────────────────────
const createStudentValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('classId').isMongoId().withMessage('Valid class ID required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('admissionDate').isISO8601().withMessage('Valid admission date required'),
  body('gender').optional().isIn(['male','female','other']),
  body('bloodGroup').optional().isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-']),
  validate
];

const updateStudentValidator = [
  param('id').isMongoId().withMessage('Valid student ID required'),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('gender').optional().isIn(['male','female','other']),
  body('status').optional().isIn(['active','inactive','transferred','graduated','expelled']),
  validate
];

// ─── Class Validators ─────────────────────────────────────────────────────────
const createClassValidator = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('grade').isInt({ min: 1, max: 12 }).withMessage('Grade must be between 1-12'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  validate
];

// ─── Attendance Validators ────────────────────────────────────────────────────
const markAttendanceValidator = [
  body('classId').isMongoId().withMessage('Valid class ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('records').isArray({ min: 1 }).withMessage('At least one attendance record required'),
  body('records.*.studentId').isMongoId().withMessage('Valid student ID required in each record'),
  body('records.*.status').isIn(['present','absent','late','excused','holiday']).withMessage('Invalid status'),
  validate
];

const generateQRValidator = [
  body('classId').isMongoId().withMessage('Valid class ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('expiresInMinutes').optional().isInt({ min: 5, max: 60 }).withMessage('Expiry must be 5-60 minutes'),
  validate
];

// ─── Marks Validators ─────────────────────────────────────────────────────────
const createExamValidator = [
  body('name').trim().notEmpty().withMessage('Exam name is required'),
  body('type').isIn(['unitTest','midterm','final','practical','assignment','quiz']).withMessage('Invalid exam type'),
  body('classId').isMongoId().withMessage('Valid class ID required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('maxMarks').isInt({ min: 1, max: 1000 }).withMessage('Max marks must be between 1-1000'),
  body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks must be non-negative'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  validate
];

const enterMarksValidator = [
  body('examId').isMongoId().withMessage('Valid exam ID required'),
  body('subjectId').isMongoId().withMessage('Valid subject ID required'),
  body('marksData').isArray({ min: 1 }).withMessage('Marks data required'),
  body('marksData.*.studentId').isMongoId().withMessage('Valid student ID required'),
  validate
];

// ─── Fee Validators ───────────────────────────────────────────────────────────
const createFeeStructureValidator = [
  body('name').trim().notEmpty().withMessage('Fee structure name is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('components').isArray({ min: 1 }).withMessage('At least one fee component required'),
  body('components.*.name').notEmpty().withMessage('Component name required'),
  body('components.*.amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('components.*.frequency').isIn(['monthly','quarterly','annual','once']),
  validate
];

const recordPaymentValidator = [
  param('id').isMongoId().withMessage('Valid invoice ID required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Payment amount must be positive'),
  body('method').isIn(['cash','online','cheque','card','upi']).withMessage('Invalid payment method'),
  validate
];

const generateInvoicesValidator = [
  body('classId').isMongoId().withMessage('Valid class ID required'),
  body('feeStructureId').isMongoId().withMessage('Valid fee structure ID required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  body('dueDate').isISO8601().withMessage('Valid due date required'),
  validate
];

// ─── Notice Validators ────────────────────────────────────────────────────────
const createNoticeValidator = [
  body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title required (max 200 chars)'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('type').optional().isIn(['general','exam','holiday','event','urgent','circular']),
  body('priority').optional().isIn(['low','medium','high']),
  validate
];

// ─── Common Validators ────────────────────────────────────────────────────────
const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('order').optional().isIn(['asc','desc']),
  validate
];

module.exports = {
  validate,
  registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator,
  createStudentValidator, updateStudentValidator,
  createClassValidator,
  markAttendanceValidator, generateQRValidator,
  createExamValidator, enterMarksValidator,
  createFeeStructureValidator, recordPaymentValidator, generateInvoicesValidator,
  createNoticeValidator,
  mongoIdParam, paginationQuery
};
