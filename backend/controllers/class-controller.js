const Sclass = require('../models/sclassSchema');
const Student = require('../models/studentSchema');

// POST /SclassCreate
// Body: { sclassName, adminID }
const sclassCreate = async (req, res) => {
  try {
    const { sclassName, adminID } = req.body;

    const sclass = new Sclass({ sclassName, school: adminID });
    await sclass.save();

    res.status(201).json(sclass);
  } catch (err) {
    if (err.code === 11000) {
      // Compound unique index violation — class already exists in this school
      return res.status(400).json({ message: 'Sorry, this class already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /SclassList/:id  (id = adminID)
const getSclasses = async (req, res) => {
  try {
    const classes = await Sclass.find({ school: req.params.id });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Sclass/:id
const getSclassDetail = async (req, res) => {
  try {
    const sclass = await Sclass.findById(req.params.id).populate('school', 'schoolName');
    if (!sclass) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(sclass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Sclass/Students/:id  (id = classId)
const getSclassStudents = async (req, res) => {
  try {
    const students = await Student.find({ sclassName: req.params.id })
      .populate('sclassName', 'sclassName')
      .select('-password');

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /Sclass/:id
// Cascade: also delete all students belonging to this class
const deleteSclass = async (req, res) => {
  try {
    const sclass = await Sclass.findById(req.params.id);
    if (!sclass) return res.status(404).json({ message: 'Not Found' });

    // Delete all students in this class first
    await Student.deleteMany({ sclassName: req.params.id });

    await Sclass.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Class and its students deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { sclassCreate, getSclasses, getSclassDetail, getSclassStudents, deleteSclass };
