// attendance.routes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.post('/', authorize('teacher', 'schoolAdmin'), attendanceController.mark);
router.post('/qr/generate', authorize('teacher', 'schoolAdmin'), attendanceController.generateQR);
router.post('/qr/scan', authorize('student'), attendanceController.scanQR);
router.get('/', authorize('teacher', 'schoolAdmin'), attendanceController.getByClass);
router.get('/student/:studentId', attendanceController.getStudentReport);
router.patch('/:id/finalize', authorize('teacher', 'schoolAdmin'), attendanceController.finalize);

module.exports = router;
