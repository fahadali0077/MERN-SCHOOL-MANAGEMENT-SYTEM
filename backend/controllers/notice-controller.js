const Notice = require('../models/noticeSchema.js');

const noticeCreate = async (req, res) => {
    try {
        const result = await Notice.create({ ...req.body, school: req.body.adminID });
        res.status(201).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const noticeList = async (req, res) => {
    try {
        const notices = await Notice.find({ school: req.params.id });
        if (!notices.length) return res.status(404).json({ message: 'No notices found' });
        res.status(200).json(notices);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!result) return res.status(404).json({ message: 'Notice not found' });
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteNotice = async (req, res) => {
    try {
        const result = await Notice.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Notice not found' });
        res.status(200).json({ message: 'Notice deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteNotices = async (req, res) => {
    try {
        const result = await Notice.deleteMany({ school: req.params.id });
        if (!result.deletedCount) return res.status(404).json({ message: 'No notices found' });
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { noticeCreate, noticeList, updateNotice, deleteNotice, deleteNotices };
