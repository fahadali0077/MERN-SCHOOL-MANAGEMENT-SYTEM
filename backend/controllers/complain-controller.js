const Complain = require('../models/complainSchema');

// POST /ComplainCreate
// Body: { user, date, complaint, school }
const complainCreate = async (req, res) => {
  try {
    const { user, date, complaint, school } = req.body;
    const complain = new Complain({ user, date, complaint, school });
    await complain.save();
    res.status(201).json(complain);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /ComplainList/:id  (id = adminID / school)
const getComplainList = async (req, res) => {
  try {
    const complains = await Complain.find({ school: req.params.id })
      .populate('user', 'name rollNum'); // show student name and roll number

    res.status(200).json(complains);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { complainCreate, getComplainList };
