const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  details: { type: String, required: true },
  date:    { type: Date, default: Date.now },
  school:  { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
});

module.exports = mongoose.models.notice || mongoose.model('notice', noticeSchema);
