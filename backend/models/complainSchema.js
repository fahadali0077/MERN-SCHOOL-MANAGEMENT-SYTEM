const mongoose = require('mongoose');

const complainSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'student', required: true },
  date:      { type: Date, default: Date.now },
  complaint: { type: String, required: true },
  school:    { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
});

module.exports = mongoose.models.complain || mongoose.model('complain', complainSchema);
