const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminSchema');

// Helper: sign a JWT token
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, schoolId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

// POST /AdminReg
const adminRegister = async (req, res) => {
  try {
    const { schoolName, email, password, role } = req.body;

    if (!schoolName || !email || !password) {
      return res.status(400).json({ message: 'schoolName, email, and password are required' });
    }

    // Password is hashed by the pre-save hook in adminSchema — do NOT hash here
    const admin = new Admin({ schoolName, email, password, role });
    await admin.save();

    const token = signToken(admin);

    res.status(201).json({
      _id: admin._id,
      schoolName: admin.schoolName,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'School name or email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// POST /AdminLogin
const adminLogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(admin);

    res.status(200).json({
      _id: admin._id,
      schoolName: admin.schoolName,
      email: admin.email,
      role: admin.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /Admin/:id
const getAdminDetail = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /Admin/:id
const updateAdmin = async (req, res) => {
  try {
    // If password is being updated, hash it manually before update
    // (findByIdAndUpdate bypasses pre-save hooks)
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) return res.status(404).json({ message: 'Not Found' });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, updateAdmin };
