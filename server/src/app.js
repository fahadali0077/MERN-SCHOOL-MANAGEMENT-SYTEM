require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/database');
const connectRedis = require('./config/redis');
const { initSocket } = require('./sockets');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth.routes');
const schoolRoutes       = require('./routes/school.routes');
const studentRoutes      = require('./routes/student.routes');
const teacherRoutes      = require('./routes/teacher.routes');
const classRoutes        = require('./routes/class.routes');
const attendanceRoutes   = require('./routes/attendance.routes');
const marksRoutes        = require('./routes/marks.routes');
const feeRoutes          = require('./routes/fee.routes');
const noticeRoutes       = require('./routes/notice.routes');
const dashboardRoutes    = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const assignmentRoutes   = require('./routes/assignment.routes');
const messageRoutes      = require('./routes/message.routes');
const superAdminRoutes   = require('./routes/superadmin.routes');

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// Connect to databases
connectDB();
connectRedis();

// Initialize Socket.io
initSocket(server);

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(mongoSanitize());
app.use(compression());

// FIX: Always include localhost AND production URL (old code used `||` which dropped
// localhost when CLIENT_URL was set, blocking local dev after setting production env vars)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server calls (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── Parsing middleware ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve local uploads in development only
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static('uploads'));
}

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// ─── Rate limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: (req) => process.env.NODE_ENV === 'development'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
  skip: (req) => process.env.NODE_ENV === 'development'
});

app.use('/api/', globalLimiter);
app.use('/api/v1/auth', authLimiter);

// ─── Swagger API docs ─────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background: #0D0D1A; } .swagger-ui .info .title { color: #0066FF; }',
  customSiteTitle: 'SchoolMS API Docs',
}));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SchoolMS API is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/metrics', async (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    uptime: `${Math.floor(process.uptime())}s`,
    pid: process.pid,
    nodeVersion: process.version,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/schools`,       schoolRoutes);
app.use(`${API}/students`,      studentRoutes);
app.use(`${API}/teachers`,      teacherRoutes);
app.use(`${API}/classes`,       classRoutes);
app.use(`${API}/attendance`,    attendanceRoutes);
app.use(`${API}/marks`,         marksRoutes);
app.use(`${API}/fees`,          feeRoutes);
app.use(`${API}/notices`,       noticeRoutes);
app.use(`${API}/dashboard`,     dashboardRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/assignments`,   assignmentRoutes);
app.use(`${API}/messages`,      messageRoutes);
app.use(`${API}/superadmin`,    superAdminRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5000', 10);

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 SchoolMS API — port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`📚 API Docs → http://localhost:${PORT}/api/docs`);
  logger.info(`❤️  Health → http://localhost:${PORT}/health`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    require('mongoose').disconnect().then(() => {
      logger.info('MongoDB disconnected');
      process.exit(0);
    });
  });
  setTimeout(() => {
    logger.error('Forced shutdown after 10s timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

module.exports = { app, server };
