const logger = require('../utils/logger');

let twilioClient = null;

const getClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

const smsService = {
  async send(to, message) {
    const client = getClient();
    if (!client) {
      logger.warn(`SMS skipped (Twilio not configured): ${to}`);
      return null;
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      logger.info(`SMS sent to ${to}: ${result.sid}`);
      return result;
    } catch (err) {
      logger.error(`SMS failed to ${to}: ${err.message}`);
      throw err;
    }
  },

  async sendAttendanceAlert(phone, studentName, status, date) {
    const message = `SchoolMS Alert: ${studentName} was marked ${status.toUpperCase()} on ${new Date(date).toDateString()}. Reply STOP to unsubscribe.`;
    return this.send(phone, message);
  },

  async sendFeeReminder(phone, invoiceNumber, amount, dueDate) {
    const message = `SchoolMS: Fee reminder. Invoice #${invoiceNumber} for $${amount} is due on ${new Date(dueDate).toDateString()}. Pay now at your school portal.`;
    return this.send(phone, message);
  },

  async sendResultNotification(phone, studentName, examName, gpa) {
    const message = `SchoolMS: Results for ${studentName} in ${examName} are now available. CGPA: ${gpa}. Login to view full report card.`;
    return this.send(phone, message);
  },

  async sendOTP(phone, otp) {
    const message = `SchoolMS: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`;
    return this.send(phone, message);
  }
};

module.exports = smsService;
