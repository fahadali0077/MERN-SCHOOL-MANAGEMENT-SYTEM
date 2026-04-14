const Bull = require('bull');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Queue definitions
const emailQueue = new Bull('email', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

const reportQueue = new Bull('reports', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2,
    timeout: 60000, // 60s for PDF generation
    removeOnComplete: 50,
    removeOnFail: 20
  }
});

const smsQueue = new Bull('sms', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 100
  }
});

const notificationQueue = new Bull('notifications', REDIS_URL, {
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 200
  }
});

// ─── Email Queue Processor ────────────────────────────────────────────────────
emailQueue.process(async (job) => {
  const emailService = require('../services/email.service');
  const { type, data } = job.data;

  logger.info(`Processing email job: ${type} (${job.id})`);

  switch (type) {
    case 'feeReminder':
      await emailService.sendFeeReminder(data.user, data.invoice);
      break;
    case 'attendanceAlert':
      await emailService.sendAttendanceAlert(data.parent, data.student, data.date, data.status);
      break;
    case 'welcome':
      await emailService.sendWelcomeEmail(data.user, data.tempPassword);
      break;
    case 'verification':
      await emailService.sendVerificationEmail(data.user, data.token);
      break;
    case 'passwordReset':
      await emailService.sendPasswordResetEmail(data.user, data.token);
      break;
    case 'bulkNotice':
      for (const recipient of data.recipients) {
        await emailService.send({ to: recipient.email, subject: data.subject, html: data.html });
      }
      break;
    default:
      await emailService.send(data);
  }
});

emailQueue.on('completed', (job) => logger.info(`Email job completed: ${job.id}`));
emailQueue.on('failed', (job, err) => logger.error(`Email job failed: ${job.id} — ${err.message}`));
emailQueue.on('stalled', (job) => logger.warn(`Email job stalled: ${job.id}`));

// ─── Report Queue Processor ───────────────────────────────────────────────────
reportQueue.process(async (job) => {
  const { type, data } = job.data;
  logger.info(`Processing report job: ${type} (${job.id})`);

  switch (type) {
    case 'reportCard':
      return await generateReportCardPDF(data);
    case 'feeInvoice':
      return await generateInvoicePDF(data);
    case 'attendanceReport':
      return await generateAttendanceReport(data);
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
});

reportQueue.on('completed', (job, result) => logger.info(`Report job completed: ${job.id}, file: ${result?.path}`));
reportQueue.on('failed', (job, err) => logger.error(`Report job failed: ${job.id} — ${err.message}`));

// ─── SMS Queue Processor ──────────────────────────────────────────────────────
smsQueue.process(async (job) => {
  const smsService = require('../services/sms.service');
  const { to, message } = job.data;
  logger.info(`Processing SMS to ${to}`);
  await smsService.send(to, message);
});

smsQueue.on('completed', (job) => logger.info(`SMS job completed: ${job.id}`));
smsQueue.on('failed', (job, err) => logger.error(`SMS job failed: ${job.id} — ${err.message}`));

// ─── Notification Queue Processor ────────────────────────────────────────────
notificationQueue.process(10, async (job) => { // concurrency 10
  const notificationService = require('../services/notification.service');
  const { notifications } = job.data;
  await notificationService.createBulk(notifications);
});

// ─── PDF Generators ───────────────────────────────────────────────────────────
async function generateReportCardPDF(data) {
  const PDFDocument = require('pdfkit');
  const path = require('path');
  const fs = require('fs');

  const { student, exam, subjects, summary } = data;
  const outputPath = path.join(process.cwd(), 'uploads', `report-card-${student._id}-${exam._id}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#0066FF').text('SCHOOL REPORT CARD', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#888888').text(`${exam.name} — ${exam.academicYear}`, { align: 'center' });
    doc.moveDown(1);

    // Horizontal rule
    doc.strokeColor('#1A1A2E').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Student info
    doc.fontSize(10).fillColor('#000000');
    const infoY = doc.y;
    doc.text(`Student: ${student.name || 'N/A'}`, 50, infoY);
    doc.text(`Class: ${student.class || 'N/A'}`, 300, infoY);
    doc.text(`Roll No: ${student.rollNumber || 'N/A'}`, 50, infoY + 16);
    doc.text(`Admission: ${student.admissionNumber || 'N/A'}`, 300, infoY + 16);
    doc.moveDown(2);

    // Marks table header
    const tableTop = doc.y;
    const cols = { subject: 50, theory: 220, practical: 310, total: 380, percent: 440, grade: 500 };
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.rect(50, tableTop, 495, 20).fill('#0066FF');
    doc.text('Subject', cols.subject, tableTop + 6);
    doc.text('Theory', cols.theory, tableTop + 6);
    doc.text('Practical', cols.practical, tableTop + 6);
    doc.text('Total', cols.total, tableTop + 6);
    doc.text('%', cols.percent, tableTop + 6);
    doc.text('Grade', cols.grade, tableTop + 6);

    // Marks rows
    let rowY = tableTop + 20;
    subjects.forEach((s, i) => {
      const bg = i % 2 === 0 ? '#F8F8F8' : '#FFFFFF';
      doc.rect(50, rowY, 495, 18).fill(bg);
      doc.fontSize(9).font('Helvetica').fillColor('#000000');
      doc.text(s.subject?.name || 'Unknown', cols.subject, rowY + 5, { width: 160 });
      doc.text(s.theory ? `${s.theory.obtained}/${s.theory.max}` : '—', cols.theory, rowY + 5);
      doc.text(s.practical ? `${s.practical.obtained}/${s.practical.max}` : '—', cols.practical, rowY + 5);
      doc.text(s.isAbsent ? 'ABS' : `${s.totalObtained}/${s.totalMax}`, cols.total, rowY + 5);
      doc.text(s.isAbsent ? '—' : `${s.percentage}%`, cols.percent, rowY + 5);
      doc.fillColor(s.percentage >= 60 ? '#10B981' : '#EF4444');
      doc.text(s.isAbsent ? '—' : s.grade, cols.grade, rowY + 5);
      rowY += 18;
    });

    // Summary box
    doc.moveDown(1);
    rowY += 10;
    doc.rect(50, rowY, 495, 60).stroke('#0066FF');
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0066FF').text('Summary', 65, rowY + 10);
    doc.fontSize(10).fillColor('#000000');
    doc.text(`Overall Percentage: ${summary.overallPercentage}%`, 65, rowY + 28);
    doc.text(`CGPA: ${summary.gpa}`, 220, rowY + 28);
    doc.text(`Overall Grade: ${summary.overallGrade}`, 350, rowY + 28);
    doc.fillColor(summary.overallPercentage >= 35 ? '#10B981' : '#EF4444');
    doc.fontSize(14).font('Helvetica-Bold').text(summary.overallPercentage >= 35 ? 'PASS' : 'FAIL', 460, rowY + 22);

    doc.end();
    stream.on('finish', () => resolve({ path: outputPath, filename: `report-card-${student.admissionNumber}.pdf` }));
    stream.on('error', reject);
  });
}

async function generateInvoicePDF(data) {
  const PDFDocument = require('pdfkit');
  const path = require('path');
  const fs = require('fs');
  const { invoice, student, school } = data;

  const outputPath = path.join(process.cwd(), 'uploads', `invoice-${invoice.invoiceNumber}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#0066FF').text(school?.name || 'SchoolMS', { align: 'center' });
    doc.fontSize(18).fillColor('#000000').text('FEE INVOICE', { align: 'center' });
    doc.moveDown(0.5);

    // Invoice meta
    doc.fontSize(10).fillColor('#888888');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, doc.y - 12);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 400);
    doc.moveDown(1);

    // Student info
    doc.fillColor('#000000').fontSize(10);
    doc.text(`Bill To:`, 50);
    doc.font('Helvetica-Bold').text(`${student?.firstName} ${student?.lastName}`, 50);
    doc.font('Helvetica').text(student?.email || '', 50);
    doc.moveDown(1);

    // Items table
    const tableY = doc.y;
    doc.rect(50, tableY, 495, 20).fill('#0066FF');
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
    doc.text('Description', 60, tableY + 6);
    doc.text('Amount', 350, tableY + 6);
    doc.text('Discount', 420, tableY + 6);
    doc.text('Total', 490, tableY + 6);

    let rowY = tableY + 20;
    (invoice.items || []).forEach((item, i) => {
      doc.rect(50, rowY, 495, 18).fill(i % 2 === 0 ? '#F8F8F8' : '#FFFFFF');
      doc.fillColor('#000000').font('Helvetica').fontSize(9);
      doc.text(item.name, 60, rowY + 5, { width: 280 });
      doc.text(`$${item.amount}`, 350, rowY + 5);
      doc.text(`$${item.discount || 0}`, 420, rowY + 5);
      doc.text(`$${item.finalAmount}`, 490, rowY + 5);
      rowY += 18;
    });

    // Totals
    rowY += 10;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
    doc.text(`Subtotal: $${invoice.subtotal}`, 350, rowY);
    if (invoice.discount > 0) { rowY += 16; doc.text(`Discount: -$${invoice.discount}`, 350, rowY); }
    if (invoice.lateFee > 0) { rowY += 16; doc.fillColor('#EF4444').text(`Late Fee: +$${invoice.lateFee}`, 350, rowY); }
    rowY += 16;
    doc.fontSize(14).fillColor('#0066FF').text(`Total: $${invoice.totalAmount}`, 350, rowY);
    rowY += 18;
    doc.fontSize(10).fillColor('#10B981').text(`Paid: $${invoice.paidAmount}`, 350, rowY);
    if (invoice.balanceDue > 0) {
      rowY += 16;
      doc.fillColor('#EF4444').text(`Balance Due: $${invoice.balanceDue}`, 350, rowY);
    }

    doc.end();
    stream.on('finish', () => resolve({ path: outputPath, filename: `invoice-${invoice.invoiceNumber}.pdf` }));
    stream.on('error', reject);
  });
}

async function generateAttendanceReport(data) {
  // Simplified - returns path of CSV report
  const path = require('path');
  const fs = require('fs');
  const { records, className, month, year } = data;

  const outputPath = path.join(process.cwd(), 'uploads', `attendance-${className}-${month}-${year}.csv`);
  const headers = 'Roll No,Student Name,Total Days,Present,Absent,Late,Percentage\n';
  const rows = records.map(r =>
    `${r.rollNumber},"${r.name}",${r.total},${r.present},${r.absent},${r.late},${r.percentage}%`
  ).join('\n');

  fs.writeFileSync(outputPath, headers + rows);
  return { path: outputPath, filename: `attendance-${className}-${month}-${year}.csv` };
}

// ─── Queue Helper Functions ───────────────────────────────────────────────────
const jobs = {
  // Email
  async sendEmail(type, data, opts = {}) {
    return emailQueue.add({ type, data }, opts);
  },

  // Bulk fee reminders
  async scheduleFeeReminders(invoices, users) {
    const jobs = invoices.map((inv, i) =>
      emailQueue.add({ type: 'feeReminder', data: { invoice: inv, user: users[i] } }, {
        delay: i * 2000 // stagger 2s apart
      })
    );
    return Promise.all(jobs);
  },

  // Generate report card PDF in background
  async generateReportCard(reportData) {
    return reportQueue.add({ type: 'reportCard', data: reportData }, { priority: 1 });
  },

  // Generate invoice PDF
  async generateInvoicePDF(invoiceData) {
    return reportQueue.add({ type: 'feeInvoice', data: invoiceData }, { priority: 2 });
  },

  // Send SMS
  async sendSMS(to, message) {
    return smsQueue.add({ to, message });
  },

  // Bulk notifications
  async sendBulkNotifications(notifications) {
    return notificationQueue.add({ notifications }, { priority: 3 });
  },

  // Queue status
  async getStats() {
    const [emailCounts, reportCounts, smsCounts] = await Promise.all([
      emailQueue.getJobCounts(),
      reportQueue.getJobCounts(),
      smsQueue.getJobCounts()
    ]);
    return { email: emailCounts, reports: reportCounts, sms: smsCounts };
  }
};

module.exports = { emailQueue, reportQueue, smsQueue, notificationQueue, jobs };
