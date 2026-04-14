const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['theory', 'practical', 'both'], default: 'theory' },
  credits: { type: Number, default: 1 },
  description: String,
  isElective: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

const timetableSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
  period: Number,
  startTime: String,
  endTime: String,
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room: String
});

const classSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true, trim: true }, // "Grade 10"
  section: { type: String, trim: true },              // "A"
  grade: { type: Number, required: true },
  academicYear: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  timetable: [timetableSlotSchema],
  capacity: { type: Number, default: 40 },
  room: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

classSchema.index({ schoolId: 1, grade: 1, section: 1 });
classSchema.index({ schoolId: 1, academicYear: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
const Class = mongoose.model('Class', classSchema);

module.exports = { Subject, Class };
