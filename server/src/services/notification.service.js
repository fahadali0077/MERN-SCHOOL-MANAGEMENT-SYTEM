const Notification = require('../models/Notification.model');
const { getIO } = require('../sockets');
const { cache } = require('../config/redis');

const notificationService = {
  async create({ schoolId, recipient, sender, title, message, type = 'info', link, channels = {} }) {
    const notification = await Notification.create({
      schoolId, recipient, sender, title, message, type, link,
      channels: { inApp: true, ...channels }
    });

    // Emit real-time notification via Socket.io
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${recipient}`).emit('notification:new', {
          _id: notification._id,
          title,
          message,
          type,
          link,
          createdAt: notification.createdAt
        });
      }
    } catch (err) {
      // Non-critical
    }

    // Invalidate notification cache
    await cache.del(`notifications:${recipient}`);

    return notification;
  },

  async createBulk(notifications) {
    const created = await Notification.insertMany(notifications);
    const io = getIO();
    if (io) {
      for (const notif of created) {
        io.to(`user:${notif.recipient}`).emit('notification:new', notif);
      }
    }
    return created;
  },

  async getForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const cacheKey = `notifications:${userId}:${page}:${unreadOnly}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const filter = { recipient: userId };
    if (unreadOnly) filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    const result = { notifications, total, unreadCount };
    await cache.set(cacheKey, result, 60);
    return result;
  },

  async markRead(notificationId, userId) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() }
    );
    await cache.delPattern(`notifications:${userId}:*`);
  },

  async markAllRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    await cache.delPattern(`notifications:${userId}:*`);
  },

  async sendToClass(schoolId, classId, notification) {
    const Student = require('../models/Student.model');
    const students = await Student.find({ schoolId, classId, status: 'active' }).select('userId parentId');
    
    const notifications = [];
    for (const student of students) {
      if (student.userId) notifications.push({ ...notification, schoolId, recipient: student.userId });
      if (student.parentId) notifications.push({ ...notification, schoolId, recipient: student.parentId });
    }
    return this.createBulk(notifications);
  },

  async sendToRole(schoolId, role, notification) {
    const User = require('../models/User.model');
    const users = await User.find({ schoolId, role, isActive: true }).select('_id');
    const notifications = users.map(u => ({ ...notification, schoolId, recipient: u._id }));
    return this.createBulk(notifications);
  }
};

module.exports = notificationService;
