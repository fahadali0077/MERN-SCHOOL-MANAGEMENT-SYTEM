const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authenticate);

router.get('/stats', authorize('schoolAdmin', 'superAdmin'), studentController.getStats);
router.get('/', authorize('schoolAdmin', 'superAdmin', 'teacher'), studentController.getAll);
router.get('/:id', studentController.getOne);
router.post('/', authorize('schoolAdmin', 'superAdmin'), studentController.create);
router.put('/:id', authorize('schoolAdmin', 'superAdmin'), studentController.update);
router.patch('/:id', authorize('schoolAdmin', 'superAdmin'), studentController.update);
router.delete('/:id', authorize('schoolAdmin', 'superAdmin'), studentController.delete);
router.post('/:id/documents', authorize('schoolAdmin', 'superAdmin'), upload.single('document'), studentController.uploadDocument);

module.exports = router;
