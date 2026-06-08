const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { createStudentValidator, updateStudentValidator, mongoIdParam } = require('../validators');

router.use(authenticate);

router.get('/stats', authorize('schoolAdmin', 'superAdmin'), studentController.getStats);
router.get('/', authorize('schoolAdmin', 'superAdmin', 'teacher'), studentController.getAll);
router.get('/:id', mongoIdParam, studentController.getOne);
router.post('/', authorize('schoolAdmin', 'superAdmin'), createStudentValidator, studentController.create);
router.put('/:id', authorize('schoolAdmin', 'superAdmin'), updateStudentValidator, studentController.update);
router.patch('/:id', authorize('schoolAdmin', 'superAdmin'), updateStudentValidator, studentController.update);
router.delete('/:id', authorize('schoolAdmin', 'superAdmin'), mongoIdParam, studentController.delete);
router.post('/:id/documents', authorize('schoolAdmin', 'superAdmin'),
  (req, res, next) => { req.uploadType = 'document'; next(); },
  upload.single('document'), upload.processDocument, studentController.uploadDocument);

module.exports = router;
