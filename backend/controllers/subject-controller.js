const Subject = require('../models/subjectSchema');
const Teacher = require('../models/teacherSchema');

// POST /SubjectCreate
// Body: { subjects: [{ subName, sessions }], sclassName, adminID }
// Bulk insert — frontend sends an array of subjects at once
const subjectCreate = async (req, res) => {
  try {
    const { subjects, sclassName, adminID } = req.body;

    // Build an array of subject documents to insert
    const subjectDocs = subjects.map((s) => ({
      subName: s.subName,
      sessions: s.sessions,
      sclassName,
      school: adminID,
      teacher: null,
    }));

    const created = await Subject.insertMany(subjectDocs);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'One or more subjects already exist for this class' });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /ClassSubjects/:id  (id = classId / sclassName)
const getClassSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ sclassName: req.params.id })
      .populate('teacher', 'name');

    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /FreeSubjectList/:id  (id = adminID / school)
// Returns only subjects that have NO teacher assigned yet
const getFreeSubjectList = async (req, res) => {
  try {
    const subjects = await Subject.find({
      school: req.params.id,
      teacher: null, // unassigned subjects only
    });

    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Subject/:id
const getSubjectDetail = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('sclassName', 'sclassName')
      .populate('school', 'schoolName')
      .populate('teacher', 'name email');

    if (!subject) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /Subject/:id
// Also removes teacher assignment if a teacher was linked to this subject
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Not Found' });

    // Unassign the teacher that was teaching this subject
    if (subject.teacher) {
      await Teacher.findByIdAndUpdate(subject.teacher, { teachSubject: null });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  subjectCreate,
  getClassSubjects,
  getFreeSubjectList,
  getSubjectDetail,
  deleteSubject,
};
