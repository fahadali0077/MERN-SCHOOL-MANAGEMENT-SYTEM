const mongoose = require('mongoose');

// Exam Schema
const examSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['unitTest', 'midterm', 'final', 'practical', 'assignment', 'quiz'], required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  academicYear: { type: String, required: true },
  term: { type: String, enum: ['term1', 'term2', 'term3', 'annual'] },
  maxMarks: { type: Number, required: true, default: 100 },
  passingMarks: { type: Number, required: true, default: 35 },
  isPublished: { type: Boolean, default: false },
  schedule: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    date: Date,
    startTime: String,
    endTime: String,
    room: String,
    invigilator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

examSchema.index({ schoolId: 1, classId: 1 });
examSchema.index({ schoolId: 1, academicYear: 1 });

// Marks Schema
const marksSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Marks breakdown
  theory: { obtained: Number, max: Number },
  practical: { obtained: Number, max: Number },
  assignment: { obtained: Number, max: Number },
  
  totalObtained: Number,
  totalMax: Number,
  percentage: Number,
  grade: String,
  gradePoint: Number,
  
  isAbsent: { type: Boolean, default: false },
  isWithheld: { type: Boolean, default: false },
  remarks: String,
  
  isPublished: { type: Boolean, default: false }
  
}, { timestamps: true });

// Compound indexes
marksSchema.index({ studentId: 1, subjectId: 1 });
marksSchema.index({ schoolId: 1, examId: 1 });
marksSchema.index({ studentId: 1, examId: 1 });

// Auto-calculate percentage and grade
marksSchema.pre('save', function(next) {
  if (this.totalObtained != null && this.totalMax != null) {
    this.percentage = parseFloat(((this.totalObtained / this.totalMax) * 100).toFixed(2));
    
    // GPA calculation (10-point scale)
    const p = this.percentage;
    if (p >= 90) { this.grade = 'A+'; this.gradePoint = 10; }
    else if (p >= 80) { this.grade = 'A'; this.gradePoint = 9; }
    else if (p >= 70) { this.grade = 'B+'; this.gradePoint = 8; }
    else if (p >= 60) { this.grade = 'B'; this.gradePoint = 7; }
    else if (p >= 50) { this.grade = 'C+'; this.gradePoint = 6; }
    else if (p >= 40) { this.grade = 'C'; this.gradePoint = 5; }
    else if (p >= 35) { this.grade = 'D'; this.gradePoint = 4; }
    else { this.grade = 'F'; this.gradePoint = 0; }
  }
  next();
});

const Exam = mongoose.model('Exam', examSchema);
const Marks = mongoose.model('Marks', marksSchema);

module.exports = { Exam, Marks };
