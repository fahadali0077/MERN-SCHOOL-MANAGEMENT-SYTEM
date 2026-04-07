const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacherSchema');
const Subject = require('../models/subjectSchema');

// Helper: sign a JWT token
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, schoolId: user.school },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

// POST /TeacherReg
const teacherRegister = async (req, res) => {
  try {
    const { name, email, password, role, school, teachSubject, teachSclass } = req.body;

    const teacher = new Teacher({ name, email, password, role, school, teachSubject, teachSclass });
    await teacher.save();

    // If a subject was assigned at registration, mark that subject's teacher field
    if (teachSubject) {
      await Subject.findByIdAndUpdate(teachSubject, { teacher: teacher._id });
    }

    // Return created doc (has .school field → entityAdded on frontend)
    const result = teacher.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /TeacherLogin
const teacherLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email })
      .populate('teachSubject', 'subName sessions')
      .populate('teachSclass', 'sclassName')
      .populate('school', 'schoolName');

    if (!teacher) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(teacher);

    const teacherObj = teacher.toObject();
    delete teacherObj.password;

    res.status(200).json({ ...teacherObj, token, role: 'Teacher' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Teachers/:id  (id = adminID / school)
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ school: req.params.id })
      .populate('teachSubject', 'subName sessions')
      .populate('teachSclass', 'sclassName')
      .select('-password');

    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Teacher/:id
const getTeacherDetail = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('teachSubject', 'subName sessions')
      .populate('teachSclass', 'sclassName')
      .populate('school', 'schoolName')
      .select('-password');

    if (!teacher) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /Teacher/:id
// Also unassigns the teacher from their subject
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Not Found' });

    // Unassign teacher from their subject before deleting
    if (teacher.teachSubject) {
      await Subject.findByIdAndUpdate(teacher.teachSubject, { teacher: null });
    }

    await Teacher.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /Teacher/:id  (general update)
const updateTeacher = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!teacher) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /TeacherSubject
// Body: { teacherId, teachSubject }
// Assigns a subject to a teacher and links the teacher on the subject document
const updateTeacherSubject = async (req, res) => {
  try {
    const { teacherId, teachSubject } = req.body;

    // Update teacher document
    await Teacher.findByIdAndUpdate(teacherId, { teachSubject });

    // Mark the subject as assigned to this teacher
    await Subject.findByIdAndUpdate(teachSubject, { teacher: teacherId });

    res.status(200).json({ message: 'Teacher assigned to subject successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  deleteTeacher,
  updateTeacher,
  updateTeacherSubject,
};
