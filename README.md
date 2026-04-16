# SchoolMS — Full-Stack School Management System

A multi-tenant school management platform supporting superAdmin, schoolAdmin, teacher, student, and parent roles.

**Tech Stack:** React 18 + TypeScript + Vite + Redux Toolkit · Node.js + Express 4 + MongoDB + Redis + Socket.io

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Clone and install
git clone <your-repo>
cd MERN-SCHOOL-MANAGEMENT-SYSTEM

# 2. Backend
cd server
cp .env.example .env          # fill in your values
npm install
npm run dev                   # starts on :5000

# 3. Frontend (separate terminal)
cd client
cp .env.example .env.local    # leave VITE_API_URL empty for local dev
npm install
npm run dev                   # starts on :5173

# 4. Seed test data
cd server
npm run seed                  # creates all test accounts (--fresh to reset)
```

**Test accounts (after seeding):**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@schoolms.com | Admin@1234 |
| School Admin | admin@demo.com | demo1234 |
| Teacher | (see seed output) | Password@1 |
| Student | (see seed output) | Password@1 |

---

## 🚀 Production Deployment

### Step 1 — MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create a free cluster** (M0 tier)
2. **Database Access** → Add user → set username/password
3. **Network Access** → Add `0.0.0.0/0` (allow all — Render IPs change)
4. **Connect** → Driver → copy the connection string
5. Replace `<password>` with your DB user password
6. Append `/schoolms` before `?retryWrites` to name your database

```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/schoolms?retryWrites=true&w=majority
```

---

### Step 2 — Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) → **Create Database**
2. Region: choose closest to your Render server (US East / Oregon)
3. Click your database → **Connect** → copy the **`rediss://`** URL (TLS)

```
rediss://default:AXxx...@useful-moose-12345.upstash.io:6379
```

> ⚠️ The URL **must** start with `rediss://` (double s) for TLS. Plain `redis://` will fail on Upstash.

---

### Step 3 — Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) → free tier is sufficient
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**

---

### Step 4 — Deploy Backend to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/app.js`
   - **Environment:** Node
5. **Environment Variables** → Add all values from `server/.env.example`:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | *(from Step 1)* |
| `JWT_ACCESS_SECRET` | *(run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)* |
| `JWT_REFRESH_SECRET` | *(different random 64-char hex)* |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `REDIS_URL` | *(from Step 2, starts with rediss://)* |
| `CLIENT_URL` | *(your Vercel URL — set after Step 5)* |
| `CLOUDINARY_CLOUD_NAME` | *(from Step 3)* |
| `CLOUDINARY_API_KEY` | *(from Step 3)* |
| `CLOUDINARY_API_SECRET` | *(from Step 3)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | *(your Gmail)* |
| `SMTP_PASS` | *(16-char Gmail App Password)* |
| `EMAIL_FROM` | `noreply@yourschool.com` |

6. Click **Create Web Service**
7. Wait for deploy → note your URL: `https://schoolms-api.onrender.com`

> **⚠️ Free tier warning:** Render free services spin down after 15 min of inactivity and take ~30s to wake. The first request after idle will be slow. Upgrade to the $7/mo Starter plan to avoid this.

---

### Step 5 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://schoolms-api.onrender.com` *(your Render URL from Step 4)* |

4. Click **Deploy**
5. Note your Vercel URL: `https://your-app.vercel.app`

---

### Step 6 — Connect Frontend URL to Backend (CORS)

1. Go back to your Render service → **Environment**
2. Set `CLIENT_URL` = `https://your-app.vercel.app`
3. Click **Save** — Render will redeploy automatically

---

### Step 7 — Seed the Production Database

After both services are running, seed via your Render shell:

```bash
# In Render dashboard → your service → Shell tab
cd server && npm run seed
```

Or trigger it via a one-time job if you don't have shell access:
temporarily add this to your start command, deploy, then revert:
```
node src/scripts/seed.js && node src/app.js
```

---

### Step 8 — Verify Everything Works

```
# Health check
curl https://schoolms-api.onrender.com/health

# Expected response:
{"success":true,"message":"SchoolMS API is running","environment":"production",...}
```

Then open your Vercel URL and log in with the seeded superAdmin credentials.

---

## 📁 Project Structure

```
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── superadmin/    # SchoolsPage (NEW)
│   │   │   ├── admin/         # TeachersPage, ClassesPage
│   │   │   ├── students/      # StudentsPage, AddStudent, StudentDetail
│   │   │   ├── assignments/   # AssignmentsPage (with student submit)
│   │   │   ├── attendance/    # AttendancePage, AttendanceReport
│   │   │   ├── marks/         # ExamsPage, MarksEntry, ReportCard
│   │   │   ├── fees/          # FeesPage, InvoicesPage
│   │   │   ├── messages/      # MessagesPage (real-time)
│   │   │   ├── notices/       # NoticesPage
│   │   │   ├── dashboard/     # Role dashboards
│   │   │   ├── auth/          # Login, Register, ForgotPassword, Reset
│   │   │   ├── ProfilePage    # Avatar, password change
│   │   │   ├── SettingsPage   # Persisted notification preferences
│   │   │   └── NotFound       # 404 page (NEW)
│   │   ├── store/
│   │   │   ├── api/
│   │   │   │   ├── apiSlice.ts  # RTK Query base (with auto-refresh)
│   │   │   │   └── endpoints.ts # All API hooks
│   │   │   └── slices/
│   │   │       ├── authSlice.ts
│   │   │       ├── notificationSlice.ts
│   │   │       └── uiSlice.ts
│   │   ├── components/
│   │   │   ├── layout/DashboardLayout.tsx
│   │   │   ├── dashboard/NotificationPanel.tsx
│   │   │   └── ui/
│   │   └── hooks/
│   │       └── useSocket.tsx
│   ├── vercel.json            # SPA fallback (NEW)
│   └── .env.example
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── app.js             # Express app + CORS fix
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── redis.js       # Graceful Redis fallback (FIXED)
│   │   ├── controllers/
│   │   │   └── auth.controller.js  # + updatePreferences, deleteAccount (NEW)
│   │   ├── routes/
│   │   │   ├── auth.routes.js      # + PATCH /preferences, DELETE /account
│   │   │   └── superadmin.routes.js # + GET /schools list endpoint
│   │   ├── models/
│   │   ├── middlewares/
│   │   │   └── upload.middleware.js # Cloudinary (REPLACED S3)
│   │   ├── services/
│   │   │   └── email.service.js    # Graceful SMTP fallback (FIXED)
│   │   ├── utils/
│   │   │   └── cloudinary.js       # New upload utility (REPLACED s3.js)
│   │   ├── jobs/
│   │   │   └── index.js        # Bull with graceful no-Redis fallback (FIXED)
│   │   └── scripts/
│   │       └── seed.js
│   ├── package.json           # + cloudinary dep, - aws-sdk
│   └── .env.example
│
├── render.yaml                # Render.com deployment config (NEW)
└── README.md
```

---

## 🐛 Bugs Fixed Summary

### Frontend
| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `App.tsx` | `/dashboard/schools` had no route — sidebar link was broken | Created `SchoolsPage.tsx`, added route |
| 2 | `App.tsx` | `/students/:id/edit` had no route — Edit button linked to 404 | Added route reusing `AddStudent` |
| 3 | `App.tsx` | Catch-all redirected to `/` instead of showing 404 | Created `NotFound.tsx` |
| 4 | `App.tsx` → `AuthInitializer` | `setCredentials` dispatched with `accessToken: ''` from `/auth/me` (which returns no token) — stored token was always empty string | Changed to `dispatch(setUser(user))` |
| 5 | `apiSlice.ts` | Refresh call used implicit GET — backend route is POST | Changed to explicit `{ method: 'POST' }` |
| 6 | `apiSlice.ts` | `api.dispatch({ type: 'auth/setToken' })` — raw string bypasses TypeScript | Changed to `api.dispatch(setToken(accessToken))` |
| 7 | `apiSlice.ts` | `baseUrl` hardcoded to `/api/v1` — broke in production | Added `VITE_API_URL` support |
| 8 | `authSlice.ts` | `setUser()` didn't set `isAuthenticated=true` — session restore marked user as logged-out | Fixed reducer |
| 9 | `TeachersPage.tsx` | Edit button had no onClick, no modal, mutation never called | Added edit modal + `updateTeacher()` call |
| 10 | `AssignmentsPage.tsx` | Student Submit button had no handler | Added `SubmitModal` + `submitAssignment` endpoint |
| 11 | `AttendanceReport.tsx` | Chart data was `Math.random()` — never real | Replaced with real per-student API queries |
| 12 | `SettingsPage.tsx` | `handleSave()` only showed a toast, never POSTed to API | Added `PATCH /auth/preferences` call |
| 13 | `MessagesPage.tsx` | "+" New Conversation button had no onClick | Added `NewConversationModal` |
| 14 | `useSocket.tsx` | Connected to `window.location.origin` — wrong in production (Vercel ≠ Render) | Added `VITE_API_URL` fallback |
| 15 | `globals.css` | No `@media print` styles — ReportCard "Print" button produced unstyled garbage | Added `print.css` |

### Backend
| # | File | Bug | Fix |
|---|------|-----|-----|
| 16 | `app.js` | CORS `\|\|` operator dropped `localhost:5173` when `CLIENT_URL` set | Changed to spread operator `[...existing, CLIENT_URL]` |
| 17 | `config/redis.js` | App crashed on startup if Redis unavailable (no `REDIS_URL`) | Added graceful no-op fallback |
| 18 | `jobs/index.js` | `new Bull(...)` threw synchronously at require-time without Redis | Wrapped in try/catch; exported null-safe stubs |
| 19 | `jobs/index.js` | Required separate `worker.js` process — impossible on Render free tier (1 process) | Moved all processors inline |
| 20 | `utils/s3.js` | AWS SDK dependency — would crash if package not installed | Replaced entirely with `cloudinary.js` |
| 21 | `middlewares/upload.middleware.js` | Used local disk in production — breaks on Render (ephemeral filesystem) | Rewired to Cloudinary |
| 22 | `services/email.service.js` | SMTP errors threw and crashed the HTTP request | Wrapped in try/catch; logs warning and returns `null` |
| 23 | `routes/auth.routes.js` | Missing `PATCH /preferences` and `DELETE /account` (called by SettingsPage) | Added both routes |
| 24 | `routes/superadmin.routes.js` | Missing `GET /superadmin/schools` list (called by SchoolsPage) | Added paginated list endpoint |
| 25 | `controllers/auth.controller.js` | Missing `updatePreferences` and `deleteAccount` methods | Implemented both |
| 26 | `package.json` | Missing `cloudinary` dependency | Added `"cloudinary": "^2.5.1"` |

---

## 🔑 Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default: 5000) | Server port |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | **Yes** | 64+ char random secret for access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | 64+ char random secret for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No (default: 15m) | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No (default: 7d) | Refresh token TTL |
| `REDIS_URL` | No | Upstash `rediss://` URL — app works without it, just no caching |
| `CLIENT_URL` | **Yes (prod)** | Vercel frontend URL for CORS + email links |
| `CLOUDINARY_CLOUD_NAME` | **Yes (prod)** | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **Yes (prod)** | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **Yes (prod)** | Cloudinary API secret |
| `SMTP_HOST` | No | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No (default: 587) | SMTP port |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password / app password |
| `EMAIL_FROM` | No | From address for outgoing emails |
| `SENDGRID_API_KEY` | No | Alternative to SMTP — takes priority if set |

### Frontend (`client/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes (prod)** | Render backend URL, e.g. `https://schoolms-api.onrender.com`. Leave empty in local dev — Vite proxy handles it. |

---

## 📝 Gmail App Password Setup

If using Gmail SMTP:
1. Enable 2-Step Verification on your Google account
2. Go to **myaccount.google.com** → Security → App passwords
3. Generate a password for "Mail" / "Other"
4. Use the 16-character code as `SMTP_PASS`

---

## 🧪 API Documentation

After deploying, visit:
```
https://schoolms-api.onrender.com/api/docs
```

Swagger UI lists all endpoints with request/response schemas.
