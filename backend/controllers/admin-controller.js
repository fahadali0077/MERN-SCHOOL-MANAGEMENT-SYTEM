const bcrypt = require('bcrypt');
const Admin = require('../models/adminSchema.js');
const Sclass = require('../models/sclassSchema.js');
const Student = require('../models/studentSchema.js');
const Teacher = require('../models/teacherSchema.js');
const Subject = require('../models/subjectSchema.js');
const Notice = require('../models/noticeSchema.js');
const Complain = require('../models/complainSchema.js');

const adminRegister = async (req, res) => {
    try {
        if (await Admin.findOne({ email: req.body.email }))
            return res.status(400).json({ message: 'Email already exists' });
        if (await Admin.findOne({ schoolName: req.body.schoolName }))
            return res.status(400).json({ message: 'School name already exists' });

        const hashedPass = await bcrypt.hash(req.body.password, 10);
        let result = await Admin.create({ ...req.body, password: hashedPass });
        result = result.toObject();
        delete result.password;
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const adminLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

        const data = admin.toObject();
        delete data.password;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAdminDetail = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) return res.status(404).json({ message: 'No admin found' });
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.password) data.password = await bcrypt.hash(data.password, 10);
        const result = await Admin.findByIdAndUpdate(req.params.id, { $set: data }, { new: true }).select('-password');
        if (!result) return res.status(404).json({ message: 'Admin not found' });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        await Promise.all([
            Sclass.deleteMany({ school: req.params.id }),
            Student.deleteMany({ school: req.params.id }),
            Teacher.deleteMany({ school: req.params.id }),
            Subject.deleteMany({ school: req.params.id }),
            Notice.deleteMany({ school: req.params.id }),
            Complain.deleteMany({ school: req.params.id }),
        ]);
        res.status(200).json({ message: 'Admin and all related data deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { adminRegister, adminLogIn, getAdminDetail, updateAdmin, deleteAdmin };
