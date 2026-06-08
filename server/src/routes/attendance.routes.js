// attendance.routes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { markAttendanceValidator, generateQRValidator, mongoIdParam } = require('../validators');

router.use(authenticate);
router.post('/', authorize('teacher', 'schoolAdmin'), markAttendanceValidator, attendanceController.mark);
router.post('/qr/generate', authorize('teacher', 'schoolAdmin'), generateQRValidator, attendanceController.generateQR);
router.post('/qr/scan', authorize('student'), attendanceController.scanQR);
router.get('/', authorize('teacher', 'schoolAdmin'), attendanceController.getByClass);
router.get('/student/:studentId', attendanceController.getStudentReport);
router.patch('/:id/finalize', authorize('teacher', 'schoolAdmin'), mongoIdParam, attendanceController.finalize);

module.exports = router;
