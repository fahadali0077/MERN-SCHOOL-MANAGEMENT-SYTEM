const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  phone: String,
  email: String,
  principal: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  logo: String,
  website: String,
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branches: [branchSchema],
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
    startDate: Date,
    endDate: Date,
    maxStudents: { type: Number, default: 100 },
    maxTeachers: { type: Number, default: 20 },
    features: [String]
  },
  settings: {
    academicYear: { start: String, end: String },
    gradingSystem: { type: String, enum: ['percentage', 'gpa', 'letter'], default: 'percentage' },
    attendanceThreshold: { type: Number, default: 75 },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' }
  },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});


schoolSchema.index({ admin: 1 });

module.exports = mongoose.model('School', schoolSchema);
