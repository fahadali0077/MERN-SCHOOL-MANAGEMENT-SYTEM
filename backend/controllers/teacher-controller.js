const bcrypt = require('bcrypt');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');

const teacherRegister = async (req, res) => {
    try {
        const { name, email, password, role, school, teachSubject, teachSclass } = req.body;
        if (await Teacher.findOne({ email }))
            return res.status(400).json({ message: 'Email already exists' });

        const hashedPass = await bcrypt.hash(password, 10);
        let result = await Teacher.create({ name, email, password: hashedPass, role, school, teachSubject, teachSclass });
        if (teachSubject) await Subject.findByIdAndUpdate(teachSubject, { teacher: result._id });
        result = result.toObject();
        delete result.password;
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const teacherLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        let teacher = await Teacher.findOne({ email });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

        teacher = await teacher.populate('teachSubject', 'subName sessions');
        teacher = await teacher.populate('school', 'schoolName');
        teacher = await teacher.populate('teachSclass', 'sclassName');
        const data = teacher.toObject();
        delete data.password;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ school: req.params.id })
            .populate('teachSubject', 'subName').populate('teachSclass', 'sclassName');
        if (!teachers.length) return res.status(404).json({ message: 'No teachers found' });
        res.status(200).json(teachers.map(t => { const d = t.toObject(); delete d.password; return d; }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTeacherDetail = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('teachSubject', 'subName sessions')
            .populate('school', 'schoolName')
            .populate('teachSclass', 'sclassName');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        const data = teacher.toObject();
        delete data.password;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateTeacherSubject = async (req, res) => {
    try {
        const { teacherId, teachSubject } = req.body;
        const updated = await Teacher.findByIdAndUpdate(teacherId, { teachSubject }, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ message: 'Teacher not found' });
        await Subject.findByIdAndUpdate(teachSubject, { teacher: updated._id });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        await Subject.updateOne({ teacher: teacher._id }, { $unset: { teacher: 1 } });
        res.status(200).json({ message: 'Teacher deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ school: req.params.id });
        if (!teachers.length) return res.status(404).json({ message: 'No teachers found' });
        const ids = teachers.map(t => t._id);
        await Teacher.deleteMany({ school: req.params.id });
        await Subject.updateMany({ teacher: { $in: ids } }, { $unset: { teacher: 1 } });
        res.status(200).json({ message: `${ids.length} teacher(s) deleted` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteTeachersByClass = async (req, res) => {
    try {
        const teachers = await Teacher.find({ teachSclass: req.params.id });
        if (!teachers.length) return res.status(404).json({ message: 'No teachers found' });
        const ids = teachers.map(t => t._id);
        await Teacher.deleteMany({ teachSclass: req.params.id });
        await Subject.updateMany({ teacher: { $in: ids } }, { $unset: { teacher: 1 } });
        res.status(200).json({ message: `${ids.length} teacher(s) deleted` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const teacherAttendance = async (req, res) => {
    try {
        const { status, date } = req.body;
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        const existing = teacher.attendance.find(a => a.date.toDateString() === new Date(date).toDateString());
        if (existing) { existing.status = status; }
        else { teacher.attendance.push({ date, status }); }
        res.status(200).json(await teacher.save());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    teacherRegister, teacherLogIn, getTeachers, getTeacherDetail,
    updateTeacherSubject, deleteTeacher, deleteTeachers, deleteTeachersByClass, teacherAttendance
};
