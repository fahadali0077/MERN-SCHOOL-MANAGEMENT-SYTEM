const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  rollNumber: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true },
  admissionDate: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  section: String,
  
  // Personal Information
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  nationality: String,
  religion: String,
  caste: String,
  
  // Contact
  address: {
    permanent: { street: String, city: String, state: String, country: String, zipCode: String },
    current: { street: String, city: String, state: String, country: String, zipCode: String }
  },
  
  // Parent/Guardian
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guardian: {
    name: String,
    relation: String,
    phone: String,
    email: String,
    occupation: String
  },
  
  // Academic
  previousSchool: { name: String, class: String, yearCompleted: Number, tcNumber: String },
  
  // Health
  healthInfo: {
    height: Number,
    weight: Number,
    eyeSight: String,
    allergies: [String],
    medicalConditions: [String],
    emergencyContact: { name: String, phone: String, relation: String }
  },
  
  // Documents
  documents: [{
    name: String,
    type: { type: String, enum: ['birthCertificate', 'tc', 'photo', 'aadhaar', 'marksheet', 'other'] },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'transferred', 'graduated', 'expelled'], default: 'active' },
  
  // Fee Structure
  feeCategory: { type: String, default: 'regular' },
  discount: { type: Number, default: 0 },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Compound indexes for performance
studentSchema.index({ schoolId: 1, classId: 1 });
studentSchema.index({ schoolId: 1, rollNumber: 1 });

studentSchema.index({ parentId: 1 });

// Full text search index
studentSchema.index({ 
  rollNumber: 'text', 
  admissionNumber: 'text'
});

module.exports = mongoose.model('Student', studentSchema);
