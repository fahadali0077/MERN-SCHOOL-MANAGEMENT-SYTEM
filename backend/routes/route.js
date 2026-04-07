const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// ── Controllers ───────────────────────────────────────────────────────────────
const { adminRegister, adminLogIn, getAdminDetail, updateAdmin } =
  require('../controllers/admin-controller');

const {
  studentRegister, studentLogIn, getStudents, getStudentDetail,
  deleteStudent, updateStudent, updateStudentAttendance,
  removeAllStudentsAttendance, deleteStudentAttendanceBySubject,
  updateExamResult, removeAllStudentsMarks, deleteStudentMarks,
} = require('../controllers/student-controller');

const {
  teacherRegister, teacherLogIn, getTeachers, getTeacherDetail,
  deleteTeacher, updateTeacher, updateTeacherSubject,
} = require('../controllers/teacher-controller');

const { sclassCreate, getSclasses, getSclassDetail, getSclassStudents, deleteSclass } =
  require('../controllers/class-controller');

const { subjectCreate, getClassSubjects, getFreeSubjectList, getSubjectDetail, deleteSubject } =
  require('../controllers/subject-controller');

const { noticeCreate, getNoticeList, updateNotice, deleteNotice } =
  require('../controllers/notice-controller');

const { complainCreate, getComplainList } =
  require('../controllers/complain-controller');

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES — No JWT required
// ══════════════════════════════════════════════════════════════════════════════

router.post('/AdminReg',      adminRegister);
router.post('/AdminLogin',    adminLogIn);
router.post('/StudentLogin',  studentLogIn);
router.post('/TeacherLogin',  teacherLogIn);

// ══════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES — JWT required on all routes below
// ══════════════════════════════════════════════════════════════════════════════
router.use(authMiddleware);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/Admin/:id',  getAdminDetail);
router.put('/Admin/:id',  updateAdmin);

// ── Student ───────────────────────────────────────────────────────────────────
router.post('/StudentReg',           studentRegister);
router.get('/Students/:id',          getStudents);          // all students for a school
router.get('/Student/:id',           getStudentDetail);     // single student
router.delete('/Student/:id',        deleteStudent);
router.put('/Student/:id',           updateStudent);

// Attendance routes
router.put('/StudentAttendance/:id',                 updateStudentAttendance);
router.put('/RemoveAllStudentsAttendance/:id',        removeAllStudentsAttendance);
router.put('/DeleteStudentAttendanceBySubject/:id',   deleteStudentAttendanceBySubject);

// Exam result routes
router.put('/ExamResult/:id',         updateExamResult);
router.put('/RemoveAllStudentsMarks/:id', removeAllStudentsMarks);
router.put('/DeleteStudentMarks/:id', deleteStudentMarks);

// ── Teacher ───────────────────────────────────────────────────────────────────
router.post('/TeacherReg',        teacherRegister);
router.get('/Teachers/:id',       getTeachers);         // all teachers for a school
router.get('/Teacher/:id',        getTeacherDetail);    // single teacher
router.delete('/Teacher/:id',     deleteTeacher);
router.put('/Teacher/:id',        updateTeacher);
router.put('/TeacherSubject',     updateTeacherSubject); // assign subject → no :id, body has teacherId

// ── Class (Sclass) ────────────────────────────────────────────────────────────
// IMPORTANT: /Sclass/Students/:id must be declared BEFORE /Sclass/:id
// otherwise Express will match "Students" as the :id param
router.post('/SclassCreate',          sclassCreate);
router.get('/SclassList/:id',         getSclasses);
router.get('/Sclass/Students/:id',    getSclassStudents); // ← declared first
router.get('/Sclass/:id',             getSclassDetail);
router.delete('/Sclass/:id',          deleteSclass);

// ── Subject ───────────────────────────────────────────────────────────────────
router.post('/SubjectCreate',         subjectCreate);
router.get('/ClassSubjects/:id',      getClassSubjects);   // subjects for a class
router.get('/FreeSubjectList/:id',    getFreeSubjectList); // unassigned subjects for a school
router.get('/Subject/:id',            getSubjectDetail);
router.delete('/Subject/:id',         deleteSubject);

// ── Notice ────────────────────────────────────────────────────────────────────
router.post('/NoticeCreate',      noticeCreate);
router.get('/NoticeList/:id',     getNoticeList);
router.put('/Notice/:id',         updateNotice);
router.delete('/Notice/:id',      deleteNotice);

// ── Complain ──────────────────────────────────────────────────────────────────
router.post('/ComplainCreate',    complainCreate);
router.get('/ComplainList/:id',   getComplainList);

module.exports = router;
