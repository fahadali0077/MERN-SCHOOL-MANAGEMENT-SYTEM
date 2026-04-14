require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../../src/models/User.model');
const School = require('../../src/models/School.model');
const Student = require('../../src/models/Student.model');
const { Class, Subject } = require('../../src/models/Class.model');
const { Exam, Marks } = require('../../src/models/Marks.model');
const { FeeStructure, FeeInvoice } = require('../../src/models/Fee.model');
const Notice = require('../../src/models/Notice.model');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sms_db';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  if (process.argv.includes('--fresh')) {
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}), School.deleteMany({}), Student.deleteMany({}),
      Class.deleteMany({}), Subject.deleteMany({}), Exam.deleteMany({}),
      Marks.deleteMany({}), FeeStructure.deleteMany({}), FeeInvoice.deleteMany({}),
      Notice.deleteMany({})
    ]);
    console.log('✅ Cleared');
  }

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const superAdmin = await User.create({
    firstName: 'System', lastName: 'Admin',
    email: 'superadmin@schoolms.com',
    password: 'Admin@1234',
    role: 'superAdmin',
    isEmailVerified: true, isActive: true
  });
  console.log('✅ Super Admin created');

  // ─── School ───────────────────────────────────────────────────────────────
  const school = await School.create({
    name: 'Oakwood International Academy',
    code: 'OIA',
    email: 'admin@oakwood.edu',
    phone: '+1-555-0100',
    address: { street: '100 Academy Drive', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94102' },
    branches: [{ name: 'Main Campus', code: 'MAIN', address: { city: 'San Francisco' }, isActive: true }],
    subscription: { plan: 'pro', maxStudents: 1000, maxTeachers: 100 },
    settings: { gradingSystem: 'gpa', attendanceThreshold: 75, currency: 'USD', timezone: 'America/Los_Angeles' }
  });
  console.log(`✅ School created: ${school.name}`);

  // ─── School Admin ─────────────────────────────────────────────────────────
  const schoolAdmin = await User.create({
    firstName: 'Sarah', lastName: 'Mitchell',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'schoolAdmin',
    schoolId: school._id,
    isEmailVerified: true, isActive: true
  });
  school.admin = schoolAdmin._id;
  await school.save();

  // ─── Subjects ─────────────────────────────────────────────────────────────
  const subjectData = [
    { name: 'Mathematics', code: 'MATH', type: 'theory', credits: 4 },
    { name: 'English Language', code: 'ENG', type: 'theory', credits: 4 },
    { name: 'Science', code: 'SCI', type: 'both', credits: 4 },
    { name: 'Social Studies', code: 'SOC', type: 'theory', credits: 3 },
    { name: 'Computer Science', code: 'CS', type: 'both', credits: 3 },
    { name: 'Physical Education', code: 'PE', type: 'practical', credits: 2 },
    { name: 'Arts', code: 'ART', type: 'practical', credits: 2 },
  ];

  const subjects = await Subject.insertMany(subjectData.map(s => ({ ...s, schoolId: school._id })));
  console.log(`✅ ${subjects.length} subjects created`);

  // ─── Teachers ─────────────────────────────────────────────────────────────
  const teacherData = [
    { firstName: 'James', lastName: 'Wilson', email: 'teacher@demo.com' },
    { firstName: 'Emily', lastName: 'Chen', email: 'emily.chen@oakwood.edu' },
    { firstName: 'Michael', lastName: 'Johnson', email: 'mjohnson@oakwood.edu' },
    { firstName: 'Lisa', lastName: 'Park', email: 'lpark@oakwood.edu' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const teacher = await User.create({ ...t, password: 'demo1234', role: 'teacher', schoolId: school._id, isEmailVerified: true, isActive: true });
    teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} teachers created`);

  // ─── Classes ──────────────────────────────────────────────────────────────
  const classData = [
    { name: 'Grade 9', section: 'A', grade: 9, teacher: teachers[0] },
    { name: 'Grade 9', section: 'B', grade: 9, teacher: teachers[1] },
    { name: 'Grade 10', section: 'A', grade: 10, teacher: teachers[2] },
    { name: 'Grade 11', section: 'A', grade: 11, teacher: teachers[3] },
  ];

  const classes = [];
  for (const c of classData) {
    const cls = await Class.create({
      name: c.name, section: c.section, grade: c.grade,
      schoolId: school._id,
      academicYear: '2024-25',
      classTeacher: c.teacher._id,
      capacity: 35, room: `${c.grade}0${c.section.charCodeAt(0) - 64}`,
      subjects: subjects.slice(0, 5).map((s, i) => ({
        subjectId: s._id,
        teacherId: teachers[i % teachers.length]._id
      })),
      timetable: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].flatMap((day, d) =>
        [1, 2, 3, 4, 5, 6].map((period, p) => ({
          day, period,
          startTime: `${8 + p}:00`, endTime: `${9 + p}:00`,
          subjectId: subjects[p % subjects.length]._id,
          teacherId: teachers[p % teachers.length]._id,
          room: `${c.grade}0${c.section.charCodeAt(0) - 64}`
        }))
      )
    });
    classes.push(cls);
  }
  console.log(`✅ ${classes.length} classes created`);

  // ─── Students ─────────────────────────────────────────────────────────────
  const studentNames = [
    ['Alex', 'Thompson'], ['Priya', 'Sharma'], ['Carlos', 'Martinez'],
    ['Emma', 'Davis'], ['Liam', 'Anderson'], ['Sofia', 'Rodriguez'],
    ['Noah', 'Taylor'], ['Aisha', 'Hassan'], ['Oliver', 'Brown'],
    ['Isabella', 'Garcia'], ['Ethan', 'Wilson'], ['Mia', 'Lee'],
    ['James', 'Moore'], ['Charlotte', 'Jackson'], ['Benjamin', 'White'],
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const [firstName, lastName] = studentNames[i];
    const cls = classes[i % classes.length];
    const isDemo = i === 0;

    const userDoc = await User.create({
      firstName, lastName,
      email: isDemo ? 'student@demo.com' : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@oakwood.edu`,
      password: 'demo1234',
      role: 'student',
      schoolId: school._id,
      isEmailVerified: true, isActive: true
    });

    const year = new Date().getFullYear().toString().slice(-2);
    const studentDoc = await Student.create({
      userId: userDoc._id,
      schoolId: school._id,
      classId: cls._id,
      rollNumber: String(i + 1).padStart(3, '0'),
      admissionNumber: `ADM${year}${String(i + 1).padStart(5, '0')}`,
      admissionDate: new Date(`2024-06-${String((i % 28) + 1).padStart(2, '0')}`),
      gender: i % 2 === 0 ? 'male' : 'female',
      dateOfBirth: new Date(`${2008 - (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-15`),
      bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
      status: 'active',
      feeCategory: i % 5 === 0 ? 'scholarship' : 'regular',
      discount: i % 5 === 0 ? 20 : 0,
      guardian: {
        name: `Parent of ${firstName}`,
        relation: i % 2 === 0 ? 'father' : 'mother',
        phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        email: `parent.${firstName.toLowerCase()}@email.com`
      },
      address: {
        current: { street: `${100 + i} Main St`, city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94100' }
      }
    });
    students.push({ user: userDoc, student: studentDoc, cls });
  }
  console.log(`✅ ${students.length} students created`);

  // ─── Parent ───────────────────────────────────────────────────────────────
  const parent = await User.create({
    firstName: 'Robert', lastName: 'Thompson',
    email: 'parent@demo.com', password: 'demo1234',
    role: 'parent', schoolId: school._id,
    isEmailVerified: true, isActive: true
  });
  await Student.findByIdAndUpdate(students[0].student._id, { parentId: parent._id });
  console.log('✅ Demo parent created');

  // ─── Fee Structures ───────────────────────────────────────────────────────
  for (const cls of classes) {
    await FeeStructure.create({
      schoolId: school._id,
      name: `${cls.name} ${cls.section} - Regular`,
      classId: cls._id,
      academicYear: '2024-25',
      components: [
        { name: 'Tuition Fee', amount: 500, frequency: 'monthly', dueDay: 10, isMandatory: true },
        { name: 'Library Fee', amount: 50, frequency: 'quarterly', dueDay: 10 },
        { name: 'Sports Fee', amount: 75, frequency: 'quarterly', dueDay: 10 },
        { name: 'Lab Fee', amount: 100, frequency: 'annual', dueDay: 1 },
      ],
      totalAnnual: 7100
    });
  }
  console.log('✅ Fee structures created');

  // ─── Sample Invoices ──────────────────────────────────────────────────────
  for (let i = 0; i < Math.min(students.length, 10); i++) {
    const { student } = students[i];
    const status = ['paid', 'paid', 'paid', 'partial', 'pending', 'overdue'][i % 6];
    const totalAmount = 500;
    const paidAmount = status === 'paid' ? 500 : status === 'partial' ? 250 : 0;

    await FeeInvoice.create({
      invoiceNumber: `OIA-2410-${String(i + 1).padStart(5, '0')}`,
      schoolId: school._id,
      studentId: student._id,
      month: 10, year: 2024,
      dueDate: new Date('2024-10-10'),
      items: [
        { name: 'Tuition Fee', amount: 500, discount: student.discount || 0, finalAmount: 500 * (1 - (student.discount || 0) / 100) }
      ],
      subtotal: totalAmount, discount: 0, totalAmount, paidAmount,
      balanceDue: totalAmount - paidAmount,
      status,
      payments: paidAmount > 0 ? [{ amount: paidAmount, date: new Date('2024-10-08'), method: 'online', transactionId: `TXN${Date.now()}${i}` }] : []
    });
  }
  console.log('✅ Sample invoices created');

  // ─── Exam & Marks ─────────────────────────────────────────────────────────
  const exam = await Exam.create({
    schoolId: school._id,
    name: 'Mid-Term Examination 2024',
    type: 'midterm',
    classId: classes[0]._id,
    subjects: subjects.slice(0, 5).map(s => s._id),
    startDate: new Date('2024-10-15'),
    endDate: new Date('2024-10-22'),
    academicYear: '2024-25',
    term: 'term1',
    maxMarks: 100,
    passingMarks: 35,
    isPublished: true
  });

  // Generate marks for grade 9A students
  const grade9Students = students.filter(s => s.cls._id.toString() === classes[0]._id.toString());
  for (const { student } of grade9Students) {
    for (const subject of subjects.slice(0, 5)) {
      const obtained = Math.floor(Math.random() * 45) + 50; // 50-95
      await Marks.create({
        schoolId: school._id,
        examId: exam._id,
        studentId: student._id,
        subjectId: subject._id,
        teacherId: teachers[0]._id,
        theory: { obtained, max: 80 },
        practical: { obtained: Math.floor(Math.random() * 15) + 10, max: 20 },
        totalObtained: obtained + Math.floor(Math.random() * 15) + 10,
        totalMax: 100,
        isPublished: true
      });
    }
  }
  console.log('✅ Exam and marks created');

  // ─── Notices ──────────────────────────────────────────────────────────────
  const noticeData = [
    { title: 'Mid-Term Exam Schedule Released', content: 'Dear students and parents,\n\nThe mid-term examination schedule for October 2024 has been released. Please check the academic portal for detailed timetable.\n\nExams begin: October 15, 2024\nExams end: October 22, 2024\n\nAll students must carry their ID cards during examinations.', type: 'exam', priority: 'high' },
    { title: 'National Holiday - School Closed', content: 'Please note that the school will remain closed on October 25th, 2024 on account of the national holiday.\n\nRegular classes will resume on October 26th, 2024.', type: 'holiday', priority: 'medium' },
    { title: 'Annual Sports Day Registration Open', content: 'We are pleased to announce that registrations for the Annual Sports Day 2024 are now open.\n\nEvent Date: November 15, 2024\nVenue: School Grounds\n\nStudents interested in participating should register with their class teachers by November 1st.', type: 'event', priority: 'medium' },
    { title: 'Fee Payment Reminder - October 2024', content: 'This is a friendly reminder that fee payments for October 2024 are due by October 10th, 2024.\n\nLate payment will incur a penalty of $25. Please ensure timely payment to avoid inconvenience.', type: 'general', priority: 'high' },
    { title: 'Parent-Teacher Conference - November', content: 'The Parent-Teacher Conference for the first term will be held on November 5th, 2024 from 9:00 AM to 1:00 PM.\n\nParents are requested to schedule appointments with their children\'s class teachers in advance.', type: 'general', priority: 'medium' },
  ];

  for (const notice of noticeData) {
    await Notice.create({
      schoolId: school._id,
      ...notice,
      targetAudience: ['all'],
      author: schoolAdmin._id,
      isPublished: true,
      publishAt: new Date()
    });
  }
  console.log(`✅ ${noticeData.length} notices created`);

  // ─── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('─'.repeat(50));
  console.log('Demo Credentials:');
  console.log('─'.repeat(50));
  console.log('🔴 Super Admin:    superadmin@schoolms.com / Admin@1234');
  console.log('🔵 School Admin:   admin@demo.com         / demo1234');
  console.log('🟢 Teacher:        teacher@demo.com        / demo1234');
  console.log('🟡 Student:        student@demo.com        / demo1234');
  console.log('🟣 Parent:         parent@demo.com         / demo1234');
  console.log('─'.repeat(50));
  console.log(`📊 School: ${school.name} (${school.code})`);
  console.log(`👥 Students: ${students.length}`);
  console.log(`👨‍🏫 Teachers: ${teachers.length}`);
  console.log(`📚 Classes: ${classes.length}`);
  console.log(`📝 Subjects: ${subjects.length}`);
  console.log(`💰 Invoices: 10 sample invoices`);
  console.log(`📢 Notices: ${noticeData.length}`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
