const Complain = require('../models/complainSchema.js');

const complainCreate = async (req, res) => {
    try {
        const result = await Complain.create(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

const complainList = async (req, res) => {
    try {
        const complains = await Complain.find({ school: req.params.id }).populate('user', 'name');
        if (!complains.length) return res.status(404).json({ message: 'No complaints found' });
        res.status(200).json(complains);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { complainCreate, complainList };
