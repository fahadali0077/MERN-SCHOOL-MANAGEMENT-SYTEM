const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  rollNum:    { type: Number, required: true },
  password:   { type: String, required: true },
  sclassName: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true },
  school:     { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
  role:       { type: String, default: 'Student' },

  attendance: [
    {
      date:    { type: Date, required: true },
      status:  { type: String, enum: ['Present', 'Absent'], required: true },
      subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
    },
  ],

  examResult: [
    {
      subName:       { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
      marksObtained: { type: Number, default: 0 },
    },
  ],
});

// Hash password before saving if it has been modified
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.models.student || mongoose.model('student', studentSchema);
