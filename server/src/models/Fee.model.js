const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  name: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  category: { type: String, default: 'regular' },
  academicYear: { type: String, required: true },
  components: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annual', 'once'], default: 'monthly' },
    dueDay: { type: Number, default: 10 }, // day of month
    isMandatory: { type: Boolean, default: true }
  }],
  totalAnnual: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const feeInvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure' },
  
  month: Number,
  year: Number,
  dueDate: { type: Date, required: true },
  
  items: [{
    name: String,
    amount: Number,
    discount: { type: Number, default: 0 },
    finalAmount: Number
  }],
  
  subtotal: Number,
  discount: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceDue: Number,
  
  status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'], default: 'pending' },
  
  payments: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ['cash', 'online', 'cheque', 'card', 'upi'] },
    transactionId: String,
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiptUrl: String
  }],
  
  remindersSent: { type: Number, default: 0 },
  lastReminderAt: Date,
  notes: String

}, { timestamps: true });

feeInvoiceSchema.index({ schoolId: 1, studentId: 1 });
feeInvoiceSchema.index({ schoolId: 1, status: 1, dueDate: 1 });


// Auto-calculate balance
feeInvoiceSchema.pre('save', function(next) {
  this.balanceDue = this.totalAmount - this.paidAmount;
  if (this.balanceDue <= 0) this.status = 'paid';
  else if (this.paidAmount > 0) this.status = 'partial';
  else if (new Date() > this.dueDate) this.status = 'overdue';
  next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const FeeInvoice = mongoose.model('FeeInvoice', feeInvoiceSchema);

module.exports = { FeeStructure, FeeInvoice };
