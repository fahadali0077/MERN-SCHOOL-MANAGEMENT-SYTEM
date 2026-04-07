const Notice = require('../models/noticeSchema');

// POST /NoticeCreate
// Body: { title, details, date, adminID }
const noticeCreate = async (req, res) => {
  try {
    const { title, details, date, adminID } = req.body;
    const notice = new Notice({ title, details, date, school: adminID });
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /NoticeList/:id  (id = adminID)
// Returns notices sorted newest first
const getNoticeList = async (req, res) => {
  try {
    const notices = await Notice.find({ school: req.params.id }).sort({ date: -1 });
    res.status(200).json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /Notice/:id
// Body: { title, details, date }
const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!notice) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /Notice/:id
const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { noticeCreate, getNoticeList, updateNotice, deleteNotice };
