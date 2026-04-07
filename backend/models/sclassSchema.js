const mongoose = require('mongoose');

const sclassSchema = new mongoose.Schema({
  sclassName: { type: String, required: true },
  school:     { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
});

// A class name must be unique within the same school
sclassSchema.index({ sclassName: 1, school: 1 }, { unique: true });

module.exports = mongoose.models.sclass || mongoose.model('sclass', sclassSchema);
