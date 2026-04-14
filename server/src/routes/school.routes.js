const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const { mongoIdParam } = require('../validators');

router.use(authenticate);

router.get('/', authorize('superAdmin'), schoolController.getAll);
router.get('/me', authorize('schoolAdmin', 'superAdmin'), schoolController.getOne);
router.put('/me/settings', authorize('schoolAdmin'), schoolController.updateSettings);
router.post('/me/logo', authorize('schoolAdmin'), upload.single('logo'), upload.processAvatar, schoolController.uploadLogo);
router.get('/:id', mongoIdParam, schoolController.getOne);
router.post('/', authorize('superAdmin'), schoolController.create);
router.put('/:id', authorize('superAdmin', 'schoolAdmin'), mongoIdParam, schoolController.update);
router.post('/:id/branches', authorize('superAdmin', 'schoolAdmin'), mongoIdParam, schoolController.addBranch);
router.put('/:id/branches/:branchId', authorize('superAdmin', 'schoolAdmin'), mongoIdParam, schoolController.updateBranch);
router.delete('/:id/branches/:branchId', authorize('superAdmin'), mongoIdParam, schoolController.deleteBranch);

module.exports = router;
