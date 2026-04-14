const { Exam, Marks } = require('../models/Marks.model');
const Student = require('../models/Student.model');
const { successResponse, errorResponse, paginationHelper, buildQuery } = require('../utils/apiResponse');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const notificationService = require('../services/notification.service');

const marksController = {
  // Exam CRUD
  async createExam(req, res, next) {
    try {
      const exam = await Exam.create({ ...req.body, schoolId: req.user.schoolId });
      await cache.delPattern(`exams:${req.user.schoolId}:*`);
      return successResponse(res, exam, 'Exam created', 201);
    } catch (err) { next(err); }
  },

  async getExams(req, res, next) {
    try {
      const { skip, limit, sort, page, filterQuery } = buildQuery(req.query);
      const schoolId = req.user.schoolId;

      const filter = { schoolId, ...filterQuery };
      const [exams, total] = await Promise.all([
        Exam.find(filter).populate('classId', 'name section grade').sort(sort).skip(skip).limit(limit),
        Exam.countDocuments(filter)
      ]);

      return successResponse(res, exams, 'Exams fetched', 200, paginationHelper(page, limit, total));
    } catch (err) { next(err); }
  },

  async getExam(req, res, next) {
    try {
      const exam = await Exam.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
        .populate('classId subjects');
      if (!exam) return next(new AppError('Exam not found', 404));
      return successResponse(res, exam, 'Exam fetched');
    } catch (err) { next(err); }
  },

  async updateExam(req, res, next) {
    try {
      const exam = await Exam.findOneAndUpdate(
        { _id: req.params.id, schoolId: req.user.schoolId },
        req.body, { new: true, runValidators: true }
      );
      if (!exam) return next(new AppError('Exam not found', 404));
      return successResponse(res, exam, 'Exam updated');
    } catch (err) { next(err); }
  },

  // Enter marks for a subject
  async enterMarks(req, res, next) {
    try {
      const { examId, subjectId, marksData } = req.body;
      const schoolId = req.user.schoolId;

      const exam = await Exam.findOne({ _id: examId, schoolId });
      if (!exam) return next(new AppError('Exam not found', 404));

      const operations = marksData.map(({ studentId, theory, practical, assignment, isAbsent, remarks }) => {
        const totalObtained = (theory?.obtained || 0) + (practical?.obtained || 0) + (assignment?.obtained || 0);
        const totalMax = (theory?.max || 0) + (practical?.max || 0) + (assignment?.max || 0) || exam.maxMarks;

        return {
          updateOne: {
            filter: { schoolId, examId, studentId, subjectId },
            update: {
              $set: {
                schoolId, examId, studentId, subjectId,
                teacherId: req.user._id,
                theory, practical, assignment,
                totalObtained: isAbsent ? 0 : totalObtained,
                totalMax, isAbsent, remarks
              }
            },
            upsert: true
          }
        };
      });

      await Marks.bulkWrite(operations);
      await cache.delPattern(`marks:${schoolId}:*`);

      return successResponse(res, null, 'Marks saved successfully');
    } catch (err) { next(err); }
  },

  // Get marks by exam + class
  async getExamMarks(req, res, next) {
    try {
      const { examId, classId } = req.params;
      const { subjectId } = req.query;
      const schoolId = req.user.schoolId;

      const cacheKey = `marks:${schoolId}:${examId}:${classId}:${subjectId || 'all'}`;
      const cached = await cache.get(cacheKey);
      if (cached) return successResponse(res, cached, 'Marks fetched');

      const students = await Student.find({ schoolId, classId, status: 'active' })
        .populate('userId', 'firstName lastName');

      const filter = { schoolId, examId, ...(subjectId && { subjectId }) };
      const marksRecords = await Marks.find(filter)
        .populate('subjectId', 'name code')
        .lean();

      const marksMap = {};
      marksRecords.forEach(m => {
        const key = `${m.studentId}`;
        if (!marksMap[key]) marksMap[key] = [];
        marksMap[key].push(m);
      });

      const result = students.map(student => ({
        student: {
          _id: student._id,
          rollNumber: student.rollNumber,
          name: `${student.userId?.firstName} ${student.userId?.lastName}`
        },
        marks: marksMap[student._id.toString()] || []
      }));

      await cache.set(cacheKey, result, 300);
      return successResponse(res, result, 'Marks fetched');
    } catch (err) { next(err); }
  },

  // Get student's complete report card
  async getReportCard(req, res, next) {
    try {
      const { studentId, examId } = req.params;
      const schoolId = req.user.schoolId;

      const [student, exam, marksRecords] = await Promise.all([
        Student.findOne({ _id: studentId, schoolId })
          .populate('userId', 'firstName lastName avatar')
          .populate('classId', 'name section grade'),
        Exam.findOne({ _id: examId, schoolId }),
        Marks.find({ schoolId, studentId, examId, isPublished: true })
          .populate('subjectId', 'name code type credits')
      ]);

      if (!student) return next(new AppError('Student not found', 404));
      if (!exam) return next(new AppError('Exam not found', 404));

      // Calculate GPA
      let totalGradePoints = 0, totalCredits = 0;
      const subjectResults = marksRecords.map(m => {
        const credits = m.subjectId?.credits || 1;
        totalGradePoints += m.gradePoint * credits;
        totalCredits += credits;
        return {
          subject: m.subjectId,
          theory: m.theory,
          practical: m.practical,
          assignment: m.assignment,
          totalObtained: m.totalObtained,
          totalMax: m.totalMax,
          percentage: m.percentage,
          grade: m.grade,
          gradePoint: m.gradePoint,
          isAbsent: m.isAbsent
        };
      });

      const gpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;
      const overallPercentage = marksRecords.length > 0
        ? parseFloat((marksRecords.reduce((a, m) => a + (m.percentage || 0), 0) / marksRecords.length).toFixed(2))
        : 0;

      // Determine overall grade
      let overallGrade = 'F';
      if (gpa >= 9) overallGrade = 'A+';
      else if (gpa >= 8) overallGrade = 'A';
      else if (gpa >= 7) overallGrade = 'B+';
      else if (gpa >= 6) overallGrade = 'B';
      else if (gpa >= 5) overallGrade = 'C';
      else if (gpa >= 4) overallGrade = 'D';

      const reportCard = {
        student: {
          ...student.toObject(),
          name: `${student.userId?.firstName} ${student.userId?.lastName}`
        },
        exam,
        subjects: subjectResults,
        summary: { gpa, overallPercentage, overallGrade, totalCredits, rank: null }
      };

      return successResponse(res, reportCard, 'Report card generated');
    } catch (err) { next(err); }
  },

  // Publish results
  async publishResults(req, res, next) {
    try {
      const { examId } = req.params;
      const schoolId = req.user.schoolId;

      await Marks.updateMany({ schoolId, examId }, { isPublished: true });
      await Exam.findOneAndUpdate({ _id: examId, schoolId }, { isPublished: true });

      // Notify students and parents
      const exam = await Exam.findById(examId).populate('classId');
      if (exam?.classId) {
        await notificationService.sendToClass(schoolId, exam.classId._id, {
          title: 'Results Published',
          message: `${exam.name} results are now available`,
          type: 'marks',
          link: `/marks/results/${examId}`
        });
      }

      await cache.delPattern(`marks:${schoolId}:*`);
      return successResponse(res, null, 'Results published successfully');
    } catch (err) { next(err); }
  }
};

module.exports = marksController;
