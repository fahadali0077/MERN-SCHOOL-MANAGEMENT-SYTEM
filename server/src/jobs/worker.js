require('dotenv').config();

const logger = require('../utils/logger');

// Connect to databases
require('../config/database')();
require('../config/redis');

// Import queues (this registers all processors)
const { emailQueue, reportQueue, smsQueue, notificationQueue } = require('./index');

logger.info('🔧 SMS Worker started');
logger.info(`📬 Listening on queues: email, reports, sms, notifications`);

// Graceful shutdown
const shutdown = async () => {
  logger.info('Worker shutting down...');
  await emailQueue.pause(true);
  await reportQueue.pause(true);
  await smsQueue.pause(true);
  await notificationQueue.pause(true);
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.send?.('ready'); // Signal PM2 that we're ready
