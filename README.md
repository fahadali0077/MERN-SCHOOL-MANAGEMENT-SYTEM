# SchoolMS — Production-Grade School Management SaaS

A full-stack multi-school SaaS platform built with the MERN stack. Manages students, attendance, exams, fees, assignments, and real-time communication across multiple schools and branches.

---

## Tech Stack

**Frontend:** React 18 + Vite · Redux Toolkit + RTK Query · Tailwind CSS · Recharts · Socket.io-client · Framer Motion

**Backend:** Node.js 20 + Express 4 · MongoDB 7 + Mongoose 8 · Redis 7 · Socket.io · Bull queues · JWT (HttpOnly cookies)

**Infrastructure:** Docker + Docker Compose · GitHub Actions CI/CD · PM2 cluster mode · Nginx (client) · Railway/AWS ECS (server) · Vercel (client)

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and install

```bash
git clone https://github.com/your-org/schoolms.git
cd schoolms
npm run install:all
```

### 2. Configure environment

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env — fill in MONGODB_URI, JWT secrets, etc.

# Client
cp client/.env.example client/.env
```

### 3. Start infrastructure

```bash
# Start MongoDB + Redis locally
docker-compose up mongodb redis -d
```

### 4. Seed demo data

```bash
cd server
node src/scripts/seed.js --fresh
```

### 5. Run development servers

```bash
# From root — starts both client (5173) and server (5000)
npm run dev
```

Open `http://localhost:5173`

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🔴 Super Admin | superadmin@schoolms.com | Admin@1234 |
| 🔵 School Admin | admin@demo.com | demo1234 |
| 🟢 Teacher | teacher@demo.com | demo1234 |
| 🟡 Student | student@demo.com | demo1234 |
| 🟣 Parent | parent@demo.com | demo1234 |

---

## Project Structure

```
schoolms/
├── client/                     # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # DashboardLayout, sidebar
│   │   │   ├── dashboard/      # NotificationPanel
│   │   │   └── ui/             # DataTable, Modal, FormComponents, Avatar, etc.
│   │   ├── hooks/              # useAuth, useDebounce, usePagination, useSocket
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/      # AdminDashboard, TeacherDashboard, StudentDashboard, SuperAdminDashboard
│   │   │   ├── students/       # StudentsPage, StudentDetail, AddStudent
│   │   │   ├── admin/          # TeachersPage, ClassesPage
│   │   │   ├── attendance/     # AttendancePage (QR), AttendanceReport
│   │   │   ├── marks/          # ExamsPage, MarksEntry, ReportCard
│   │   │   ├── fees/           # FeesPage, InvoicesPage
│   │   │   ├── notices/        # NoticesPage
│   │   │   ├── assignments/    # AssignmentsPage
│   │   │   ├── messages/       # MessagesPage (real-time chat)
│   │   │   ├── Landing.tsx     # Public landing page
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── store/
│   │   │   ├── api/            # RTK Query base + all endpoint definitions
│   │   │   └── slices/         # authSlice, uiSlice, notificationSlice
│   │   └── styles/             # globals.css — full design system
│   ├── Dockerfile              # Production nginx build
│   ├── Dockerfile.dev          # Development hot-reload
│   └── vite.config.ts
│
├── server/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/             # database.js, redis.js, swagger.js
│   │   ├── controllers/        # auth, student, attendance, marks, fee, dashboard
│   │   ├── jobs/               # Bull queues (email, reports, sms, notifications) + worker.js
│   │   ├── middlewares/        # auth.middleware, errorHandler, upload.middleware
│   │   ├── models/             # User, School, Student, Class, Subject, Attendance,
│   │   │                       # Exam, Marks, FeeStructure, FeeInvoice, Notice,
│   │   │                       # Notification, Assignment, Message
│   │   ├── routes/             # All REST endpoints (14 route files)
│   │   ├── scripts/            # seed.js
│   │   ├── services/           # auth, email, notification, sms
│   │   ├── sockets/            # Socket.io server
│   │   ├── utils/              # apiResponse, logger
│   │   ├── validators/         # express-validator chains for all routes
│   │   └── app.js              # Express app entry
│   ├── Dockerfile
│   └── .env.example
│
├── .github/workflows/ci-cd.yml # GitHub Actions — lint → test → Docker → deploy
├── docker-compose.yml          # MongoDB + Redis + Server + Client
├── ecosystem.config.js         # PM2 cluster + worker config
└── package.json                # Monorepo root
```

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

Interactive docs (Swagger UI): `http://localhost:5000/api/docs`

### Response Envelope

All responses follow this format:

```json
{
  "success": true,
  "message": "Students fetched",
  "data": [...],
  "pagination": { "page": 1, "limit": 25, "total": 340, "pages": 14 }
}
```

### Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (sets HttpOnly cookies) |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Logout + blacklist token |
| GET | `/students` | List students (paginated) |
| POST | `/students` | Create student + user account |
| GET | `/attendance` | Get class attendance |
| POST | `/attendance` | Mark attendance |
| POST | `/attendance/qr/generate` | Generate QR session |
| POST | `/attendance/qr/scan` | Student scans QR |
| GET | `/marks/exams` | List exams |
| POST | `/marks` | Enter marks (bulk) |
| GET | `/marks/report-card/:studentId/:examId` | Get report card |
| GET | `/fees` | List invoices |
| POST | `/fees/generate` | Generate class invoices |
| POST | `/fees/:id/payment` | Record payment |
| GET | `/dashboard/admin` | Admin dashboard stats |
| GET | `/superadmin/overview` | Platform-wide analytics |
| GET | `/messages` | List conversations |
| POST | `/messages/:id/messages` | Send message |
| GET | `/assignments` | List assignments |
| POST | `/assignments/:id/submit` | Student submits |
| PATCH | `/assignments/:id/submissions/:studentId/grade` | Grade submission |

### Query Parameters (all list endpoints)

```
?page=1&limit=25&search=john&sortBy=createdAt&order=desc&filter[status]=active
```

---

## Features

### Phase 1 (Complete)
- ✅ Multi-tenant architecture with full school isolation
- ✅ 5-role RBAC (superAdmin → schoolAdmin → teacher → student → parent)
- ✅ JWT auth with refresh token rotation (HttpOnly cookies, never localStorage)
- ✅ Student Information System with document management
- ✅ Period-wise attendance + QR code scanning
- ✅ Exam management with auto GPA/grade calculation
- ✅ Fee structures, invoice generation, payment recording
- ✅ Real-time notifications (Socket.io + in-app inbox)
- ✅ Email alerts (fee reminders, attendance, welcome, password reset)
- ✅ Notice board with audience targeting
- ✅ Assignments with submissions and grading
- ✅ Real-time messaging (direct + group conversations)
- ✅ Printable PDF report cards
- ✅ SuperAdmin platform analytics
- ✅ Redis caching (5-min TTL on dashboards, timetables)
- ✅ Bull async job queues (PDF generation, bulk email, SMS)
- ✅ Dark luxury design system (Clash Display + Satoshi fonts)
- ✅ Public landing page with bento grid + animations

---

## Environment Variables

### Server (`server/.env`)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=https://app.schoolms.com
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@schoolms.com
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1...
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=schoolms-uploads
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Client (`client/.env`)

```env
VITE_API_URL=https://api.schoolms.com
VITE_SOCKET_URL=https://api.schoolms.com
VITE_APP_NAME=SchoolMS
```

---

## Production Deployment

### Docker Compose (full stack)

```bash
docker-compose up -d
```

### Manual (Node.js + PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start server cluster + worker
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Build and serve client
cd client && npm run build
# Serve dist/ with nginx or Vercel
```

### GitHub Actions

Push to `main` → automatically:
1. Runs tests with MongoDB + Redis services
2. Builds Docker image → pushes to GHCR
3. Deploys server to Railway
4. Deploys client to Vercel

Required GitHub secrets: `RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Development

```bash
# Run all tests
npm test

# Seed fresh demo data
cd server && node src/scripts/seed.js --fresh

# Open Swagger docs
open http://localhost:5000/api/docs

# View Bull job queues
# Add bull-board to server for a UI dashboard
```

---

## License

MIT © SchoolMS Team
