const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'exam', 'holiday', 'event', 'urgent', 'circular'], default: 'general' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  targetAudience: [{ type: String, enum: ['all', 'students', 'teachers', 'parents', 'staff'] }],
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attachments: [{ name: String, url: String, type: String }],
  publishAt: { type: Date, default: Date.now },
  expiresAt: Date,
  isPublished: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  acknowledgements: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, readAt: Date }]
}, { timestamps: true });

noticeSchema.index({ schoolId: 1, isPublished: 1, publishAt: -1 });
noticeSchema.index({ schoolId: 1, type: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
