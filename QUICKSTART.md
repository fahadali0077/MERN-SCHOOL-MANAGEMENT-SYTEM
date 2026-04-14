# SchoolMS — Quickstart (Windows / Mac / Linux)

## Prerequisites
- **Node.js 20+** → https://nodejs.org (LTS version)
- **MongoDB** → either:
  - Free cloud: https://mongodb.com/atlas (recommended — no install)
  - Or local: https://www.mongodb.com/try/download/community
- **Redis** → either:
  - Local on Windows: https://github.com/tporadowski/redis/releases (download `.msi`)
  - Or skip Redis for now — the app degrades gracefully without it

---

## Step 1 — Install dependencies

Open a terminal in the `sms/` folder:

```bash
# Install root tools (just concurrently)
npm install

# Install server dependencies
npm install --prefix server

# Install client dependencies  
npm install --prefix client
```

> **Why separate installs?** The root `npm install` previously used workspaces which caused the `@radix-ui/react-badge` 404 error. This project now uses `--prefix` which keeps server and client completely isolated.

---

## Step 2 — Configure environment

```bash
# Windows (PowerShell)
Copy-Item server\.env.example server\.env

# Mac/Linux
cp server/.env.example server/.env
```

Open `server/.env` and fill in these required fields:

```env
# Get a free MongoDB Atlas URI at mongodb.com/atlas → Create cluster → Connect
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/sms_db

# Generate two random secrets (run this in Node):
# require('crypto').randomBytes(32).toString('hex')
JWT_ACCESS_SECRET=paste_32_char_random_string_here
JWT_REFRESH_SECRET=paste_different_32_char_string_here

# Leave the rest as defaults for local development
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Generate JWT secrets quickly:**
```bash
node -e "const c=require('crypto'); console.log('ACCESS:',c.randomBytes(32).toString('hex')); console.log('REFRESH:',c.randomBytes(32).toString('hex'));"
```

---

## Step 3 — Seed demo data

```bash
npm run seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| School Admin | admin@demo.com | demo1234 |
| Teacher | teacher@demo.com | demo1234 |
| Student | student@demo.com | demo1234 |
| Parent | parent@demo.com | demo1234 |
| Super Admin | superadmin@schoolms.com | Admin@1234 |

---

## Step 4 — Start development servers

```bash
npm run dev
```

This starts both:
- **Backend API** → http://localhost:5000
- **Frontend** → http://localhost:5173
- **API Docs** → http://localhost:5000/api/docs

> If you see `'concurrently' is not recognized` — run `npm install` in the root first.

To start them separately:
```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

---

## Troubleshooting

### `Cannot connect to MongoDB`
- Check your `MONGODB_URI` in `server/.env`
- For Atlas: whitelist your IP in Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)

### `Redis connection error`
- Redis errors are non-fatal — the app continues without caching
- To install Redis on Windows: download from https://github.com/tporadowski/redis/releases
- Or just ignore — all features work without Redis (slightly slower)

### `nodemon not found`
```bash
npm install --prefix server
```

### `vite not found`
```bash
npm install --prefix client
```

### Port already in use
Change `PORT=5000` in `server/.env` and update `vite.config.ts` proxy target accordingly.

---

## Production build

```bash
# Build client for production
npm run build:client

# The built files are in client/dist/ — deploy to Vercel, Netlify, or any static host
# The server runs with: npm start --prefix server
```
