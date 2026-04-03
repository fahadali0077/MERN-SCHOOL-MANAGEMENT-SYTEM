const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const Teacher = require('../models/teacherSchema.js');

const sclassCreate = async (req, res) => {
    try {
        const existing = await Sclass.findOne({ sclassName: req.body.sclassName, school: req.body.adminID });
        if (existing) return res.status(400).json({ message: 'Class name already exists' });
        const result = await Sclass.create({ sclassName: req.body.sclassName, school: req.body.adminID });
        res.status(201).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const sclassList = async (req, res) => {
    try {
        const classes = await Sclass.find({ school: req.params.id });
        if (!classes.length) return res.status(404).json({ message: 'No classes found' });
        res.status(200).json(classes);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSclassDetail = async (req, res) => {
    try {
        const sclass = await Sclass.findById(req.params.id).populate('school', 'schoolName');
        if (!sclass) return res.status(404).json({ message: 'Class not found' });
        res.status(200).json(sclass);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSclassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        if (!students.length) return res.status(404).json({ message: 'No students found' });
        res.status(200).json(students.map(s => { const d = s.toObject(); delete d.password; return d; }));
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSclass = async (req, res) => {
    try {
        const sclass = await Sclass.findByIdAndDelete(req.params.id);
        if (!sclass) return res.status(404).json({ message: 'Class not found' });
        await Promise.all([
            Student.deleteMany({ sclassName: req.params.id }),
            Subject.deleteMany({ sclassName: req.params.id }),
            Teacher.deleteMany({ teachSclass: req.params.id }),
        ]);
        res.status(200).json({ message: 'Class and related data deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSclasses = async (req, res) => {
    try {
        const result = await Sclass.deleteMany({ school: req.params.id });
        if (!result.deletedCount) return res.status(404).json({ message: 'No classes found' });
        await Promise.all([
            Student.deleteMany({ school: req.params.id }),
            Subject.deleteMany({ school: req.params.id }),
            Teacher.deleteMany({ school: req.params.id }),
        ]);
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents };
