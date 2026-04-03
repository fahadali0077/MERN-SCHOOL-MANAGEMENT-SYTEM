const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');

const studentRegister = async (req, res) => {
    try {
        const existing = await Student.findOne({
            rollNum: req.body.rollNum,
            school: req.body.adminID,
            sclassName: req.body.sclassName,
        });
        if (existing) return res.status(400).json({ message: 'Roll Number already exists in this class' });

        const hashedPass = await bcrypt.hash(req.body.password, 10);
        let result = await Student.create({ ...req.body, school: req.body.adminID, password: hashedPass });
        result = result.toObject();
        delete result.password;
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const studentLogIn = async (req, res) => {
    try {
        const { rollNum, studentName, password } = req.body;
        if (!rollNum || !studentName || !password)
            return res.status(400).json({ message: 'All fields are required' });

        let student = await Student.findOne({ rollNum, name: studentName });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

        student = await student.populate('school', 'schoolName');
        student = await student.populate('sclassName', 'sclassName');

        const data = student.toObject();
        delete data.password;
        delete data.examResult;
        delete data.attendance;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ school: req.params.id }).populate('sclassName', 'sclassName');
        if (!students.length) return res.status(404).json({ message: 'No students found' });
        res.status(200).json(students.map(s => { const d = s.toObject(); delete d.password; return d; }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStudentDetail = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('school', 'schoolName')
            .populate('sclassName', 'sclassName')
            .populate('examResult.subName', 'subName')
            .populate('attendance.subName', 'subName sessions');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        const data = student.toObject();
        delete data.password;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json({ message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id });
        if (!result.deletedCount) return res.status(404).json({ message: 'No students found' });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id });
        if (!result.deletedCount) return res.status(404).json({ message: 'No students found' });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.password) data.password = await bcrypt.hash(data.password, 10);
        const result = await Student.findByIdAndUpdate(req.params.id, { $set: data }, { new: true }).select('-password');
        if (!result) return res.status(404).json({ message: 'Student not found' });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateExamResult = async (req, res) => {
    try {
        const { subName, marksObtained } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const existing = student.examResult.find(r => r.subName.toString() === subName);
        if (existing) { existing.marksObtained = marksObtained; }
        else { student.examResult.push({ subName, marksObtained }); }

        res.status(200).json(await student.save());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const studentAttendance = async (req, res) => {
    try {
        const { subName, status, date } = req.body;
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const subject = await Subject.findById(subName);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });

        const existing = student.attendance.find(
            a => a.date.toDateString() === new Date(date).toDateString() && a.subName.toString() === subName
        );
        if (existing) {
            existing.status = status;
        } else {
            const count = student.attendance.filter(a => a.subName.toString() === subName).length;
            if (count >= subject.sessions) return res.status(400).json({ message: 'Max attendance reached' });
            student.attendance.push({ date, status, subName });
        }
        res.status(200).json(await student.save());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    try {
        const result = await Student.updateMany({ 'attendance.subName': req.params.id }, { $pull: { attendance: { subName: req.params.id } } });
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const clearAllStudentsAttendance = async (req, res) => {
    try {
        const result = await Student.updateMany({ school: req.params.id }, { $set: { attendance: [] } });
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    try {
        const result = await Student.updateOne({ _id: req.params.id }, { $pull: { attendance: { subName: req.body.subId } } });
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const removeStudentAttendance = async (req, res) => {
    try {
        const result = await Student.updateOne({ _id: req.params.id }, { $set: { attendance: [] } });
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
    studentRegister, studentLogIn, getStudents, getStudentDetail,
    deleteStudents, deleteStudent, deleteStudentsByClass,
    updateStudent, updateExamResult, studentAttendance,
    clearAllStudentsAttendanceBySubject, clearAllStudentsAttendance,
    removeStudentAttendanceBySubject, removeStudentAttendance,
};
