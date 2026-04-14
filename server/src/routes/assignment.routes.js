const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment.model');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { successResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const upload = require('../middlewares/upload.middleware');
const notificationService = require('../services/notification.service');
const { cache } = require('../config/redis');

router.use(authenticate);

// ─── Get assignments (students see their class, teachers see theirs) ──────────
router.get('/', async (req, res, next) => {
  try {
    const { skip, limit, sort, page, filterQuery } = buildQuery(req.query);
    const schoolId = req.user.schoolId;
    const filter = { schoolId, isPublished: true, ...filterQuery };

    if (req.user.role === 'teacher') filter.teacherId = req.user._id;
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter)
        .populate('classId', 'name section')
        .populate('subjectId', 'name code')
        .populate('teacherId', 'firstName lastName')
        .select('-submissions.text')
        .sort(sort).skip(skip).limit(limit),
      Assignment.countDocuments(filter)
    ]);

    return successResponse(res, assignments, 'Assignments fetched', 200, paginationHelper(page, limit, total));
  } catch (err) { next(err); }
});

// ─── Get single assignment with submissions ───────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
      .populate('classId', 'name section grade')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName avatar')
      .populate('submissions.studentId', 'rollNumber')
      .populate('submissions.gradedBy', 'firstName lastName');

    if (!assignment) return next(new AppError('Assignment not found', 404));
    return successResponse(res, assignment, 'Assignment fetched');
  } catch (err) { next(err); }
});

// ─── Create assignment ────────────────────────────────────────────────────────
router.post('/', authorize('teacher', 'schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      schoolId: req.user.schoolId,
      teacherId: req.user._id
    });

    // Notify class students
    if (assignment.isPublished && assignment.classId) {
      await notificationService.sendToClass(req.user.schoolId, assignment.classId, {
        title: 'New Assignment',
        message: `${assignment.title} — Due: ${new Date(assignment.dueDate).toLocaleDateString()}`,
        type: 'assignment',
        link: `/dashboard/assignments/${assignment._id}`
      });
    }

    await cache.delPattern(`assignments:${req.user.schoolId}:*`);
    return successResponse(res, assignment, 'Assignment created', 201);
  } catch (err) { next(err); }
});

// ─── Update assignment ────────────────────────────────────────────────────────
router.put('/:id', authorize('teacher', 'schoolAdmin'), async (req, res, next) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) return next(new AppError('Assignment not found', 404));
    return successResponse(res, assignment, 'Assignment updated');
  } catch (err) { next(err); }
});

// ─── Delete assignment ────────────────────────────────────────────────────────
router.delete('/:id', authorize('teacher', 'schoolAdmin'), async (req, res, next) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
    return successResponse(res, null, 'Assignment deleted');
  } catch (err) { next(err); }
});

// ─── Submit assignment (students) ─────────────────────────────────────────────
router.post('/:id/submit', authorize('student'), async (req, res, next) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!assignment) return next(new AppError('Assignment not found', 404));

    const Student = require('../models/Student.model');
    const student = await Student.findOne({ userId: req.user._id, schoolId: req.user.schoolId });
    if (!student) return next(new AppError('Student not found', 404));

    const existing = assignment.submissions.find(s => s.studentId.toString() === student._id.toString());
    if (existing && !assignment.allowLateSubmission) return next(new AppError('Already submitted', 409));

    const isLate = new Date() > new Date(assignment.dueDate);
    assignment.submissions.push({
      studentId: student._id,
      text: req.body.text,
      files: req.body.files || [],
      status: isLate ? 'late' : 'submitted'
    });

    await assignment.save();

    // Notify teacher
    await notificationService.create({
      schoolId: req.user.schoolId,
      recipient: assignment.teacherId,
      sender: req.user._id,
      title: 'Assignment Submitted',
      message: `${req.user.firstName} ${req.user.lastName} submitted "${assignment.title}"`,
      type: 'assignment',
      link: `/dashboard/assignments/${assignment._id}`
    });

    return successResponse(res, null, isLate ? 'Submitted (late)' : 'Submitted successfully');
  } catch (err) { next(err); }
});

// ─── Grade submission ─────────────────────────────────────────────────────────
router.patch('/:id/submissions/:studentId/grade', authorize('teacher', 'schoolAdmin'), async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!assignment) return next(new AppError('Assignment not found', 404));

    const submission = assignment.submissions.find(s => s.studentId.toString() === req.params.studentId);
    if (!submission) return next(new AppError('Submission not found', 404));

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await assignment.save();

    // Notify student
    const Student = require('../models/Student.model');
    const student = await Student.findById(req.params.studentId);
    if (student?.userId) {
      await notificationService.create({
        schoolId: req.user.schoolId,
        recipient: student.userId,
        title: 'Assignment Graded',
        message: `"${assignment.title}" has been graded. Grade: ${grade}/${assignment.maxMarks}`,
        type: 'assignment',
        link: `/dashboard/assignments/${assignment._id}`
      });
    }

    return successResponse(res, submission, 'Submission graded');
  } catch (err) { next(err); }
});

module.exports = router;
