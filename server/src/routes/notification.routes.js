const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const notificationService = require('../services/notification.service');
const { successResponse } = require('../utils/apiResponse');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const result = await notificationService.getForUser(req.user._id, {
      page: parseInt(page), limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });
    return successResponse(res, result, 'Notifications fetched');
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await notificationService.markRead(req.params.id, req.user._id);
    return successResponse(res, null, 'Marked as read');
  } catch (err) { next(err); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user._id);
    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
});

module.exports = router;
