const router = require('express').Router();

const { adminRegister, adminLogIn, getAdminDetail, updateAdmin, deleteAdmin } = require('../controllers/admin-controller.js');
const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister, studentLogIn, getStudents, getStudentDetail,
    deleteStudents, deleteStudent, deleteStudentsByClass,
    updateStudent, updateExamResult, studentAttendance,
    clearAllStudentsAttendanceBySubject, clearAllStudentsAttendance,
    removeStudentAttendanceBySubject, removeStudentAttendance
} = require('../controllers/student-controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');

// ── Admin ──────────────────────────────────────────────────────────────────────
router.post('/AdminReg', adminRegister);
router.post('/AdminLogin', adminLogIn);
router.get('/Admin/:id', getAdminDetail);
router.put('/Admin/:id', updateAdmin);
router.delete('/Admin/:id', deleteAdmin);

// ── Student ────────────────────────────────────────────────────────────────────
router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn);
router.get('/Students/:id', getStudents);
router.get('/Student/:id', getStudentDetail);
router.put('/Student/:id', updateStudent);
router.delete('/Students/:id', deleteStudents);
router.delete('/StudentsClass/:id', deleteStudentsByClass);
router.delete('/Student/:id', deleteStudent);
router.put('/UpdateExamResult/:id', updateExamResult);
router.put('/StudentAttendance/:id', studentAttendance);
router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);
router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance);

// ── Teacher ────────────────────────────────────────────────────────────────────
router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn);
router.get('/Teachers/:id', getTeachers);
router.get('/Teacher/:id', getTeacherDetail);
router.put('/TeacherSubject', updateTeacherSubject);
router.post('/TeacherAttendance/:id', teacherAttendance);
router.delete('/Teachers/:id', deleteTeachers);
router.delete('/TeachersClass/:id', deleteTeachersByClass);
router.delete('/Teacher/:id', deleteTeacher);

// ── Notice ─────────────────────────────────────────────────────────────────────
router.post('/NoticeCreate', noticeCreate);
router.get('/NoticeList/:id', noticeList);
router.put('/Notice/:id', updateNotice);
router.delete('/Notice/:id', deleteNotice);
router.delete('/Notices/:id', deleteNotices);

// ── Complain ───────────────────────────────────────────────────────────────────
router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);

// ── Class ──────────────────────────────────────────────────────────────────────
router.post('/SclassCreate', sclassCreate);
router.get('/SclassList/:id', sclassList);
router.get('/Sclass/:id', getSclassDetail);
router.get('/Sclass/Students/:id', getSclassStudents);
router.delete('/Sclass/:id', deleteSclass);
router.delete('/Sclasses/:id', deleteSclasses);

// ── Subject ────────────────────────────────────────────────────────────────────
router.post('/SubjectCreate', subjectCreate);
router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get('/Subject/:id', getSubjectDetail);
router.delete('/Subject/:id', deleteSubject);
router.delete('/Subjects/:id', deleteSubjects);
router.delete('/SubjectsClass/:id', deleteSubjectsByClass);

module.exports = router;
