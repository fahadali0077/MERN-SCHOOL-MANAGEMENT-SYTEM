const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marks.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { createExamValidator, enterMarksValidator } = require('../validators');

router.use(authenticate);

// Exams
router.post('/exams', authorize('schoolAdmin', 'superAdmin'), createExamValidator, marksController.createExam);
router.get('/exams', marksController.getExams);
router.get('/exams/:id', marksController.getExam);
router.put('/exams/:id', authorize('schoolAdmin', 'superAdmin'), marksController.updateExam);
router.post('/exams/:examId/publish', authorize('schoolAdmin', 'superAdmin'), marksController.publishResults);

// Marks entry
router.post('/', authorize('teacher', 'schoolAdmin'), enterMarksValidator, marksController.enterMarks);
router.get('/exam/:examId/class/:classId', authorize('teacher', 'schoolAdmin'), marksController.getExamMarks);

// Report card
router.get('/report-card/:studentId/:examId', marksController.getReportCard);

module.exports = router;
