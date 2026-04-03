const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Student = require('../models/studentSchema.js');

const subjectCreate = async (req, res) => {
    try {
        const subjects = req.body.subjects.map(s => ({
            subName: s.subName, subCode: s.subCode, sessions: s.sessions,
            sclassName: req.body.sclassName, school: req.body.adminID,
        }));
        const existing = await Subject.findOne({ subCode: subjects[0].subCode, school: req.body.adminID });
        if (existing) return res.status(400).json({ message: 'Subject code already exists' });
        const result = await Subject.insertMany(subjects);
        res.status(201).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const allSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.params.id }).populate('sclassName', 'sclassName');
        if (!subjects.length) return res.status(404).json({ message: 'No subjects found' });
        res.status(200).json(subjects);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const classSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id });
        if (!subjects.length) return res.status(404).json({ message: 'No subjects found' });
        res.status(200).json(subjects);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const freeSubjectList = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id, teacher: { $exists: false } });
        if (!subjects.length) return res.status(404).json({ message: 'No free subjects found' });
        res.status(200).json(subjects);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSubjectDetail = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('sclassName', 'sclassName').populate('teacher', 'name');
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        res.status(200).json(subject);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        await Teacher.updateOne({ teachSubject: subject._id }, { $unset: { teachSubject: 1 } });
        await Student.updateMany({}, { $pull: { examResult: { subName: subject._id }, attendance: { subName: subject._id } } });
        res.status(200).json({ message: 'Subject deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ school: req.params.id });
        if (!subjects.length) return res.status(404).json({ message: 'No subjects found' });
        const ids = subjects.map(s => s._id);
        await Subject.deleteMany({ school: req.params.id });
        await Teacher.updateMany({ teachSubject: { $in: ids } }, { $unset: { teachSubject: 1 } });
        await Student.updateMany({ school: req.params.id }, { $set: { examResult: [], attendance: [] } });
        res.status(200).json({ message: `${ids.length} subject(s) deleted` });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSubjectsByClass = async (req, res) => {
    try {
        const subjects = await Subject.find({ sclassName: req.params.id });
        if (!subjects.length) return res.status(404).json({ message: 'No subjects found' });
        const ids = subjects.map(s => s._id);
        await Subject.deleteMany({ sclassName: req.params.id });
        await Teacher.updateMany({ teachSubject: { $in: ids } }, { $unset: { teachSubject: 1 } });
        await Student.updateMany({ sclassName: req.params.id }, { $set: { examResult: [], attendance: [] } });
        res.status(200).json({ message: `${ids.length} subject(s) deleted` });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { subjectCreate, allSubjects, classSubjects, freeSubjectList, getSubjectDetail, deleteSubject, deleteSubjects, deleteSubjectsByClass };
