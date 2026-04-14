const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  readBy: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }],
  attachments: [{ name: String, url: String, type: String, size: Number }],
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  type: { type: String, enum: ['direct', 'group', 'announcement'], default: 'direct' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  name: String, // for group chats
  subject: String, // context (e.g., "Math Homework Help")
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: Date
  },
  isArchived: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

conversationSchema.virtual('messageCount').get(function() {
  return this.messages?.length || 0;
});

conversationSchema.index({ schoolId: 1, participants: 1 });
conversationSchema.index({ schoolId: 1, updatedAt: -1 });

// Update lastMessage on new message
conversationSchema.pre('save', function(next) {
  if (this.messages?.length > 0) {
    const last = this.messages[this.messages.length - 1];
    this.lastMessage = { content: last.content, sender: last.sender, sentAt: last.createdAt };
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
