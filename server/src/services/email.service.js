/**
 * email.service.js
 *
 * FIX: Wrapped transporter creation in try/catch. If SMTP env vars are missing
 * or misconfigured, email sending logs a warning and returns gracefully instead
 * of throwing and crashing the process.
 */

const logger = require('../utils/logger');

let emailEnabled = false;
let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;

  try {
    const nodemailer = require('nodemailer');

    if (process.env.SENDGRID_API_KEY) {
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
      });
      emailEnabled = true;
      logger.info('📧 Email: using SendGrid');
      return transporter;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      emailEnabled = true;
      logger.info(`📧 Email: using SMTP (${process.env.SMTP_HOST})`);
      return transporter;
    }

    // Dev fallback: Ethereal (catch-all inbox, no credentials needed)
    if (process.env.NODE_ENV === 'development') {
      nodemailer.createTestAccount().then((account) => {
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: { user: account.user, pass: account.pass }
        });
        emailEnabled = true;
        logger.info(`📧 Email: using Ethereal test account (${account.user})`);
      }).catch(() => {
        logger.warn('⚠️  Email disabled — no SMTP config and Ethereal unavailable');
      });
      return null;
    }

    logger.warn('⚠️  Email disabled — set SMTP_HOST/USER/PASS or SENDGRID_API_KEY to enable');
    return null;
  } catch (err) {
    logger.warn(`⚠️  Email init failed: ${err.message} — email features disabled`);
    return null;
  }
};

// Kick off init at module load
initTransporter();

const emailTemplate = (title, content, ctaText, ctaUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0D0D1A; color: #F1F1EE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #111827; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0066FF20, #111827); padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .header h1 { margin: 0; font-size: 24px; color: #F1F1EE; }
    .header span { color: #0066FF; }
    .body { padding: 32px; }
    .body p { line-height: 1.7; color: #888888; margin: 0 0 16px; }
    .cta { display: inline-block; background: #0066FF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; }
    .footer p { color: #555555; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>School<span>MS</span></h1></div>
    <div class="body">
      <h2 style="color:#F1F1EE;margin:0 0 16px;">${title}</h2>
      ${content}
      ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaText}</a>` : ''}
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} SchoolMS. This is an automated email.</p></div>
  </div>
</body>
</html>`;

const emailService = {
  /**
   * Core send method — logs and swallows errors instead of throwing.
   */
  async send({ to, subject, html, text }) {
    if (!emailEnabled || !transporter) {
      logger.warn(`📧 Email skipped (disabled) — would have sent to ${to}: "${subject}"`);
      return null;
    }
    try {
      const info = await transporter.sendMail({
        from: `"SchoolMS" <${process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@schoolms.com'}>`,
        to, subject, html, text
      });
      logger.info(`📧 Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      // FIX: Log and return null instead of rethrowing — email failures must not break the request
      logger.error(`📧 Email failed to ${to}: ${err.message}`);
      return null;
    }
  },

  async sendVerificationEmail(user, token) {
    const url = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
    return this.send({
      to: user.email,
      subject: 'Verify your SchoolMS account',
      html: emailTemplate(
        'Verify Your Email',
        `<p>Hi ${user.firstName},</p><p>Please verify your email address to activate your SchoolMS account. This link expires in 24 hours.</p>`,
        'Verify Email Address', url
      )
    });
  },

  async sendPasswordResetEmail(user, token) {
    const url = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
    return this.send({
      to: user.email,
      subject: 'Reset your SchoolMS password',
      html: emailTemplate(
        'Password Reset Request',
        `<p>Hi ${user.firstName},</p><p>We received a request to reset your password. Click below to set a new one. This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p>`,
        'Reset Password', url
      )
    });
  },

  async sendFeeReminder(user, invoice) {
    return this.send({
      to: user.email,
      subject: `Fee Payment Reminder - Invoice #${invoice.invoiceNumber}`,
      html: emailTemplate(
        'Fee Payment Due',
        `<p>Hi ${user.firstName},</p><p>Your fee payment of <strong style="color:#F1F1EE">$${invoice.totalAmount}</strong> is due on <strong style="color:#F1F1EE">${new Date(invoice.dueDate).toDateString()}</strong>.</p><p>Invoice #: ${invoice.invoiceNumber}</p>`,
        'Pay Now', `${process.env.CLIENT_URL}/dashboard/invoices`
      )
    });
  },

  async sendWelcomeEmail(user, tempPassword) {
    return this.send({
      to: user.email,
      subject: 'Welcome to SchoolMS',
      html: emailTemplate(
        `Welcome, ${user.firstName}!`,
        `<p>Your account has been created on SchoolMS.</p>
         <p><strong style="color:#F1F1EE">Email:</strong> ${user.email}</p>
         <p><strong style="color:#F1F1EE">Temporary Password:</strong> <code style="background:#1A1A2E;padding:2px 8px;border-radius:4px;">${tempPassword}</code></p>
         <p>Please log in and change your password immediately.</p>`,
        'Login to SchoolMS', `${process.env.CLIENT_URL}/auth/login`
      )
    });
  },

  async sendAttendanceAlert(parent, student, date, status) {
    return this.send({
      to: parent.email,
      subject: `Attendance Alert - ${student.firstName} ${student.lastName}`,
      html: emailTemplate(
        'Attendance Alert',
        `<p>Dear ${parent.firstName},</p><p><strong style="color:#F1F1EE">${student.firstName} ${student.lastName}</strong> was marked <strong style="color:${status === 'absent' ? '#EF4444' : '#F59E0B'}">${status.toUpperCase()}</strong> on ${new Date(date).toDateString()}.</p>`,
        'View Attendance', `${process.env.CLIENT_URL}/dashboard/attendance`
      )
    });
  }
};

module.exports = emailService;
