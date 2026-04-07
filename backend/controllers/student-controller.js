const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/studentSchema');

// Helper: sign a JWT token
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, schoolId: user.school },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

// POST /StudentReg
const studentRegister = async (req, res) => {
  try {
    const { name, rollNum, password, sclassName, adminID, role, attendance } = req.body;

    // Check for duplicate rollNum within the same class
    const existing = await Student.findOne({ rollNum, sclassName, school: adminID });
    if (existing) {
      return res.status(400).json({ message: 'Roll number already exists in this class' });
    }

    const student = new Student({
      name,
      rollNum,
      password,
      sclassName,
      school: adminID, // frontend sends adminID as school reference
      role,
      attendance: attendance || [],
    });

    await student.save();

    // Return created doc (frontend checks for .school field → entityAdded)
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry' });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /StudentLogin
const studentLogIn = async (req, res) => {
  try {
    const { rollNum, studentName, password } = req.body;

    const student = await Student.findOne({ rollNum, name: studentName })
      .populate('sclassName', 'sclassName')
      .populate('school', 'schoolName')
      .populate('examResult.subName', 'subName sessions')
      .populate('attendance.subName', 'subName sessions');

    if (!student) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(student);

    // Convert to plain object and strip password
    const studentObj = student.toObject();
    delete studentObj.password;

    res.status(200).json({ ...studentObj, token, role: 'Student' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Students/:id  (id = adminID / school)
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ school: req.params.id })
      .populate('sclassName', 'sclassName')
      .select('-password');

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Student/:id
const getStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('sclassName', 'sclassName')
      .populate('school', 'schoolName')
      .populate('examResult.subName', 'subName sessions')
      .populate('attendance.subName', 'subName sessions')
      .select('-password');

    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /Student/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /Student/:id  (general field update)
const updateStudent = async (req, res) => {
  try {
    // Hash password if it's being changed
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /StudentAttendance/:id
// Body: { subName, status, date }
// Upsert logic: if same date+subName already exists, update; otherwise push
const updateStudentAttendance = async (req, res) => {
  try {
    const { subName, status, date } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Not Found' });

    // Find if an attendance record already exists for this date + subject
    const existingIndex = student.attendance.findIndex(
      (a) =>
        a.subName &&
        a.subName.toString() === subName &&
        new Date(a.date).toDateString() === new Date(date).toDateString()
    );

    if (existingIndex !== -1) {
      // Update existing entry
      student.attendance[existingIndex].status = status;
    } else {
      // Push new entry
      student.attendance.push({ subName, status, date });
    }

    await student.save();
    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /RemoveAllStudentsAttendance/:id
// Clears the entire attendance array for this student
const removeAllStudentsAttendance = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { attendance: [] } },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /DeleteStudentAttendanceBySubject/:id
// Body: { subId }
// Removes all attendance entries for a specific subject
const deleteStudentAttendanceBySubject = async (req, res) => {
  try {
    const { subId } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $pull: { attendance: { subName: subId } } },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /ExamResult/:id
// Body: { subName, marksObtained }
// Upsert: update existing entry or push a new one
const updateExamResult = async (req, res) => {
  try {
    const { subName, marksObtained } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Not Found' });

    const existingIndex = student.examResult.findIndex(
      (r) => r.subName && r.subName.toString() === subName
    );

    if (existingIndex !== -1) {
      // Update existing result
      student.examResult[existingIndex].marksObtained = marksObtained;
    } else {
      // Push new result
      student.examResult.push({ subName, marksObtained });
    }

    await student.save();
    res.status(200).json({ message: 'Exam result updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /RemoveAllStudentsMarks/:id
const removeAllStudentsMarks = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: { examResult: [] } },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /DeleteStudentMarks/:id
// Body: { subId }
const deleteStudentMarks = async (req, res) => {
  try {
    const { subId } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $pull: { examResult: { subName: subId } } },
      { new: true }
    ).select('-password');

    if (!student) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudent,
  updateStudent,
  updateStudentAttendance,
  removeAllStudentsAttendance,
  deleteStudentAttendanceBySubject,
  updateExamResult,
  removeAllStudentsMarks,
  deleteStudentMarks,
};
