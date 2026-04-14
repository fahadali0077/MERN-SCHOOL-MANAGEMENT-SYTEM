const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  period: { type: Number, min: 1, max: 12 }, // null for full-day attendance
  type: { type: String, enum: ['daily', 'period-wise'], default: 'daily' },
  
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { 
      type: String, 
      enum: ['present', 'absent', 'late', 'excused', 'holiday'], 
      default: 'absent' 
    },
    checkInTime: Date,
    checkOutTime: Date,
    method: { type: String, enum: ['manual', 'qr', 'biometric'], default: 'manual' },
    remarks: String
  }],
  
  // QR Code session
  qrSession: {
    isActive: { type: Boolean, default: false },
    token: String,
    expiresAt: Date,
    location: { lat: Number, lng: Number, radius: Number } // geo-fence
  },
  
  // Summary
  summary: {
    total: Number,
    present: Number,
    absent: Number,
    late: Number,
    excused: Number
  },
  
  isFinalized: { type: Boolean, default: false },
  remarks: String

}, { timestamps: true });

// Compound indexes
attendanceSchema.index({ schoolId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, classId: 1, date: 1 });
attendanceSchema.index({ 'records.studentId': 1, date: 1 });

// Pre-save: calculate summary
attendanceSchema.pre('save', function(next) {
  if (this.records.length > 0) {
    this.summary = {
      total: this.records.length,
      present: this.records.filter(r => r.status === 'present').length,
      absent: this.records.filter(r => r.status === 'absent').length,
      late: this.records.filter(r => r.status === 'late').length,
      excused: this.records.filter(r => r.status === 'excused').length
    };
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
