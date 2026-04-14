const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedAt: { type: Date, default: Date.now },
  files: [{ name: String, url: String, type: String }],
  text: String,
  status: { type: String, enum: ['submitted', 'late', 'graded', 'returned'], default: 'submitted' },
  grade: { type: Number, min: 0 },
  feedback: String,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date
});

const assignmentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true, trim: true },
  description: String,
  type: { type: String, enum: ['homework', 'project', 'quiz', 'classwork', 'lab'], default: 'homework' },
  dueDate: { type: Date, required: true },
  maxMarks: { type: Number, default: 10 },
  attachments: [{ name: String, url: String, type: String }],

  submissions: [submissionSchema],

  isPublished: { type: Boolean, default: true },
  allowLateSubmission: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions?.length || 0;
});

assignmentSchema.virtual('pendingCount').get(function() {
  return this.submissions?.filter(s => s.status === 'submitted').length || 0;
});

assignmentSchema.index({ schoolId: 1, classId: 1 });
assignmentSchema.index({ schoolId: 1, teacherId: 1 });
assignmentSchema.index({ dueDate: 1, isPublished: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
