const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String, required: true },
  role:         { type: String, default: 'Teacher' },
  school:       { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
  teachSubject: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', default: null },
  teachSclass:  { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', default: null },
});

// Hash password before saving if it has been modified
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.models.teacher || mongoose.model('teacher', teacherSchema);
