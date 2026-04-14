const express = require('express');
const router = express.Router();
const Conversation = require('../models/Message.model');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { successResponse, paginationHelper } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { emitToUser } = require('../sockets');

router.use(authenticate);

// ─── Get all conversations for current user ───────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      schoolId: req.user.schoolId,
      participants: req.user._id,
      isArchived: false
    })
      .populate('participants', 'firstName lastName avatar role')
      .populate('lastMessage.sender', 'firstName lastName')
      .select('-messages')
      .sort({ updatedAt: -1 })
      .limit(50);

    return successResponse(res, conversations, 'Conversations fetched');
  } catch (err) { next(err); }
});

// ─── Get single conversation with messages ────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      participants: req.user._id
    })
      .populate('participants', 'firstName lastName avatar role')
      .populate('messages.sender', 'firstName lastName avatar');

    if (!conversation) return next(new AppError('Conversation not found', 404));

    // Mark all messages as read
    const now = new Date();
    let hasUnread = false;
    conversation.messages.forEach(msg => {
      const alreadyRead = msg.readBy.some(r => r.userId.toString() === req.user._id.toString());
      if (!alreadyRead && msg.sender.toString() !== req.user._id.toString()) {
        msg.readBy.push({ userId: req.user._id, readAt: now });
        hasUnread = true;
      }
    });

    if (hasUnread) await conversation.save();

    return successResponse(res, conversation, 'Conversation fetched');
  } catch (err) { next(err); }
});

// ─── Create or get direct conversation ───────────────────────────────────────
router.post('/direct', async (req, res, next) => {
  try {
    const { recipientId, subject } = req.body;
    const schoolId = req.user.schoolId;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      schoolId,
      type: 'direct',
      participants: { $all: [req.user._id, recipientId], $size: 2 }
    }).populate('participants', 'firstName lastName avatar role');

    if (!conversation) {
      conversation = await Conversation.create({
        schoolId,
        type: 'direct',
        participants: [req.user._id, recipientId],
        subject,
        createdBy: req.user._id
      });
      await conversation.populate('participants', 'firstName lastName avatar role');
    }

    return successResponse(res, conversation, 'Conversation ready', conversation.messages?.length ? 200 : 201);
  } catch (err) { next(err); }
});

// ─── Send message ─────────────────────────────────────────────────────────────
router.post('/:id/messages', async (req, res, next) => {
  try {
    const { content, attachments } = req.body;
    if (!content?.trim()) return next(new AppError('Message content required', 400));

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      schoolId: req.user.schoolId,
      participants: req.user._id
    });

    if (!conversation) return next(new AppError('Conversation not found', 404));

    const message = {
      content: content.trim(),
      sender: req.user._id,
      attachments: attachments || [],
      readBy: [{ userId: req.user._id, readAt: new Date() }]
    };

    conversation.messages.push(message);
    await conversation.save();

    const newMsg = conversation.messages[conversation.messages.length - 1];

    // Emit to other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        emitToUser(participantId, 'message:new', {
          conversationId: conversation._id,
          message: { ...newMsg.toObject(), sender: { _id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName } }
        });
      }
    });

    return successResponse(res, newMsg, 'Message sent', 201);
  } catch (err) { next(err); }
});

// ─── Create group conversation ────────────────────────────────────────────────
router.post('/group', authorize('teacher', 'schoolAdmin', 'superAdmin'), async (req, res, next) => {
  try {
    const { name, participantIds, subject } = req.body;
    const allParticipants = [req.user._id, ...participantIds];

    const conversation = await Conversation.create({
      schoolId: req.user.schoolId,
      type: 'group',
      name,
      subject,
      participants: allParticipants,
      createdBy: req.user._id
    });

    await conversation.populate('participants', 'firstName lastName avatar role');
    return successResponse(res, conversation, 'Group created', 201);
  } catch (err) { next(err); }
});

// ─── Archive conversation ─────────────────────────────────────────────────────
router.patch('/:id/archive', async (req, res, next) => {
  try {
    await Conversation.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId, participants: req.user._id },
      { isArchived: true }
    );
    return successResponse(res, null, 'Conversation archived');
  } catch (err) { next(err); }
});

module.exports = router;
