// fee.routes.js
const express = require('express');
const router = express.Router();
const feeController = require('../controllers/fee.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.post('/structures', authorize('schoolAdmin', 'superAdmin'), feeController.createStructure);
router.get('/structures', feeController.getStructures);
router.post('/generate', authorize('schoolAdmin', 'superAdmin'), feeController.generateClassInvoices);
router.get('/', authorize('schoolAdmin', 'superAdmin'), feeController.getInvoices);
router.get('/student/:studentId', feeController.getStudentFees);
router.post('/:id/payment', authorize('schoolAdmin', 'superAdmin'), feeController.recordPayment);
router.post('/reminders', authorize('schoolAdmin', 'superAdmin'), feeController.sendReminders);

module.exports = router;
