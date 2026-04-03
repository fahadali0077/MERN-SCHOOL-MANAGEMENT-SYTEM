const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    rollNum:    { type: Number, required: true },
    password:   { type: String, required: true },
    role:       { type: String, default: 'Student' },
    school:     { type: mongoose.Schema.Types.ObjectId, ref: 'admin', required: true },
    sclassName: { type: mongoose.Schema.Types.ObjectId, ref: 'sclass', required: true },
    examResult: [{
        subName:       { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
        marksObtained: { type: Number, default: 0 },
    }],
    attendance: [{
        date:    { type: Date, required: true },
        status:  { type: String, enum: ['Present', 'Absent'], required: true },
        subName: { type: mongoose.Schema.Types.ObjectId, ref: 'subject', required: true },
    }],
}, { timestamps: true });

module.exports = mongoose.model('student', studentSchema);
