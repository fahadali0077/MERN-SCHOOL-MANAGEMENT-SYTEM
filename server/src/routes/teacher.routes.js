const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { mongoIdParam, paginationQuery } = require('../validators');

router.use(authenticate);

router.get('/stats', authorize('schoolAdmin', 'superAdmin'), teacherController.getStats);
router.get('/', authorize('schoolAdmin', 'superAdmin'), paginationQuery, teacherController.getAll);
router.post('/', authorize('schoolAdmin', 'superAdmin'), teacherController.create);
router.get('/:id', mongoIdParam, teacherController.getOne);
router.put('/:id', authorize('schoolAdmin', 'superAdmin'), mongoIdParam, teacherController.update);
router.patch('/:id', authorize('schoolAdmin', 'superAdmin'), mongoIdParam, teacherController.update);
router.patch('/:id/status', authorize('schoolAdmin', 'superAdmin'), mongoIdParam, teacherController.toggleStatus);
router.post('/:id/avatar', authorize('schoolAdmin', 'superAdmin'), mongoIdParam,
  upload.single('avatar'), upload.processAvatar, teacherController.uploadAvatar);

module.exports = router;
