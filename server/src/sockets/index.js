const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // JWT Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      socket.schoolId = decoded.schoolId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.userId})`);

    // Join personal room
    socket.join(`user:${socket.userId}`);

    // Join school room
    if (socket.schoolId) socket.join(`school:${socket.schoolId}`);

    // Join role room
    socket.join(`role:${socket.role}`);

    // Handle QR attendance scan
    socket.on('attendance:scan', async (data) => {
      const { qrToken, studentId } = data;
      socket.to(`school:${socket.schoolId}`).emit('attendance:scanned', { qrToken, studentId, timestamp: new Date() });
    });

    // Join class room (for class-specific events)
    socket.on('join:class', (classId) => {
      socket.join(`class:${classId}`);
    });

    socket.on('leave:class', (classId) => {
      socket.leave(`class:${classId}`);
    });

    // Real-time typing for messaging
    socket.on('typing:start', (data) => {
      socket.to(`user:${data.recipientId}`).emit('typing:start', { senderId: socket.userId });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`user:${data.recipientId}`).emit('typing:stop', { senderId: socket.userId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

const getIO = () => io;

// Emit helpers
const emitToUser = (userId, event, data) => io?.to(`user:${userId}`).emit(event, data);
const emitToSchool = (schoolId, event, data) => io?.to(`school:${schoolId}`).emit(event, data);
const emitToRole = (role, event, data) => io?.to(`role:${role}`).emit(event, data);
const emitToClass = (classId, event, data) => io?.to(`class:${classId}`).emit(event, data);

module.exports = { initSocket, getIO, emitToUser, emitToSchool, emitToRole, emitToClass };
