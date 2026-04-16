const logger = require('../utils/logger');
const { isRedisAvailable } = require('../config/redis');

// FIX: Bull crashes synchronously at require time if Redis is unavailable.
// We now lazily create queues only when Redis is confirmed available,
// and export null-safe no-op stubs otherwise so callers don't need to guard.

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// ─── Null-safe queue stub ─────────────────────────────────────────────────────
// All Bull queue methods are replaced with no-ops so existing code that calls
// emailQueue.add(...) won't throw when Redis is unavailable.
const nullQueue = {
  add: async (name, data) => {
    logger.warn(`Bull queue disabled — job "${name}" dropped (Redis unavailable)`);
    return null;
  },
  process: () => {},
  pause: async () => {},
  getJobCounts: async () => ({ waiting: 0, active: 0, completed: 0, failed: 0 }),
  on: () => {},
};

let emailQueue = nullQueue;
let reportQueue = nullQueue;
let smsQueue = nullQueue;
let notificationQueue = nullQueue;

// FIX: Initialise Bull queues only if Redis is available.
// Called after connectRedis() resolves in app.js.
const initQueues = () => {
  if (!process.env.REDIS_URL) {
    logger.warn('⚠️  Bull queues disabled — REDIS_URL not set');
    return;
  }

  try {
    const Bull = require('bull');

    emailQueue = new Bull('email', REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    reportQueue = new Bull('reports', REDIS_URL, {
      defaultJobOptions: {
        attempts: 2,
        timeout: 60000,
        removeOnComplete: 50,
        removeOnFail: 20
      }
    });

    smsQueue = new Bull('sms', REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: 100
      }
    });

    notificationQueue = new Bull('notifications', REDIS_URL, {
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: 200
      }
    });

    // ─── Email Queue Processor ────────────────────────────────────────────────
    const emailService = require('../services/email.service');

    emailQueue.process('sendWelcome', async (job) => {
      const { user, tempPassword } = job.data;
      await emailService.sendWelcomeEmail(user, tempPassword);
    });

    emailQueue.process('sendPasswordReset', async (job) => {
      const { user, token } = job.data;
      await emailService.sendPasswordResetEmail(user, token);
    });

    emailQueue.process('sendFeeReminder', async (job) => {
      const { user, invoice } = job.data;
      await emailService.sendFeeReminder(user, invoice);
    });

    emailQueue.process('sendAttendanceAlert', async (job) => {
      const { parent, student, date, status } = job.data;
      await emailService.sendAttendanceAlert(parent, student, date, status);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error(`Email job ${job.id} (${job.name}) failed: ${err.message}`);
    });

    // ─── Notification Queue Processor ────────────────────────────────────────
    const Notification = require('../models/Notification.model');

    notificationQueue.process('create', async (job) => {
      const { userId, type, title, message, data } = job.data;
      await Notification.create({ userId, type, title, message, data });
    });

    notificationQueue.on('failed', (job, err) => {
      logger.error(`Notification job ${job.id} failed: ${err.message}`);
    });

    logger.info('✅ Bull queues initialized');
  } catch (err) {
    logger.warn(`⚠️  Bull queue initialization failed: ${err.message} — jobs will be dropped`);
    emailQueue = nullQueue;
    reportQueue = nullQueue;
    smsQueue = nullQueue;
    notificationQueue = nullQueue;
  }
};

// FIX: Single-process mode — run processors inline in app.js process.
// No separate worker.js process needed (critical for Render free tier single-process constraint).
// Call initQueues() from app.js after connectRedis() resolves.
initQueues();

// ─── Queue stats helper ───────────────────────────────────────────────────────
const getQueueStats = async () => {
  try {
    const queues = { emailQueue, reportQueue, smsQueue, notificationQueue };
    const stats = {};
    for (const [name, q] of Object.entries(queues)) {
      stats[name] = await q.getJobCounts();
    }
    return stats;
  } catch {
    return {};
  }
};

module.exports = {
  emailQueue,
  reportQueue,
  smsQueue,
  notificationQueue,
  jobs: { getStats: getQueueStats }
};
