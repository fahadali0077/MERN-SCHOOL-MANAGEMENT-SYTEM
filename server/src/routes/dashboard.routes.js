// dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/admin', authorize('schoolAdmin', 'superAdmin'), dashboardController.getAdminDashboard);
router.get('/teacher', authorize('teacher'), dashboardController.getTeacherDashboard);
router.get('/student', authorize('student', 'parent'), dashboardController.getStudentDashboard);

module.exports = router;
