# StudyPilot AI 🎓✨

A production-ready, full-stack **adaptive AI study companion** — built with React, Tailwind CSS,
Node.js/Express, MySQL, JWT auth, and the Gemini API. Every feature reads and writes real data
through REST APIs backed by a real MySQL database — there is no mock/dummy data layer.

This was built and **smoke-tested end-to-end** (signup → JWT auth → refresh flow → learning
profile → topic progress → revision items → notifications) against a live MySQL instance during
development. See "Verifying your setup" below to do the same.

---

## ✨ Features

- **Auth** — Signup/Login with JWT access + refresh tokens (bcrypt password hashing, refresh
  token rotation table, logout, change password, delete account).
- **Dashboard** — Real-time stats (streak, XP, minutes studied, tasks completed), activity trend
  chart, subject mastery breakdown, quick actions.
- **Learning Profile** — Education level, goals, target role, daily study budget, learning style,
  preferred subjects — this feeds the adaptive engine.
- **Adaptive Learning** — Gemini-generated personalized roadmap (phases, goals, estimated weeks),
  recommended next topics with reasons, and weak/strong topic detection computed from real
  quiz/practice history.
- **Deep Learning Modes** — Learn, Practice, Problem Solving, Interview, and Case Study — five
  distinct Gemini system-prompted conversational modes, each logged as a session.
- **Quiz System** — Gemini-generated multiple-choice quizzes per topic/difficulty, graded
  server-side, attempts stored, and topic mastery scores updated automatically.
- **Progress Analytics** — Quiz score trend, deep-learning-mode usage distribution, and
  subject mastery bar chart — all from Recharts, all from real aggregate SQL queries.
- **Study Planner** — Full CRUD for study plans/tasks with priority, duration, and scheduling.
- **Revision Planner** — Real SM-2 style spaced-repetition scheduling (quality 0–5 grading,
  ease factor, interval growth).
- **Notifications** — Real DB-backed notifications (welcome message, revision-due reminders via
  a daily cron job, read/unread state).
- **Settings** — Profile editing, dark/light theme (persisted per-user), password change, account
  deletion.
- **Design** — Glassmorphism, gradient mesh backgrounds, Framer Motion micro-interactions, Lucide
  icons, dark/light mode, fully responsive.

---

## 🧱 Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 18, Vite, React Router 6, Tailwind CSS, Framer Motion, Recharts, Chart.js (react-chartjs-2), Lucide Icons, Axios, react-hot-toast |
| Backend    | Node.js, Express, MySQL (mysql2), JWT (jsonwebtoken), bcryptjs, express-validator, helmet, express-rate-limit, node-cron |
| AI         | Google Gemini API (`@google/generative-ai`) |
| Database   | MySQL 8 |

---

## 📁 Folder Structure

```
studypilot-ai/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (MySQL pool), gemini.js unused (see services)
│   │   ├── controllers/     # business logic per resource
│   │   ├── db/               # schema.sql, seed_catalog.sql, init.js
│   │   ├── middleware/       # auth.js (JWT guard), errorHandler.js
│   │   ├── routes/           # Express routers
│   │   ├── services/         # gemini.service.js, cron.service.js
│   │   ├── utils/            # jwt.js, asyncHandler.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/               # axios client + one module per resource
    │   ├── components/
    │   │   ├── layout/        # Sidebar, Topbar, AppShell
    │   │   └── ui/            # GlassCard, Modal, ProgressRing, Badge, etc.
    │   ├── context/           # AuthContext, ThemeContext
    │   ├── pages/             # one file per route/screen
    │   ├── routes/            # ProtectedRoute
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- MySQL 8 (running locally or remotely)
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=studypilot_ai

JWT_SECRET=<generate a long random string>
JWT_REFRESH_SECRET=<generate a different long random string>

GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-1.5-flash
```

Create the database schema (and optionally seed a starter curriculum catalog of subjects/topics —
this is reference content like a course catalog, not fake user data):

```bash
npm run db:init -- --seed
```

Start the API:

```bash
npm run dev      # nodemon, auto-restarts
# or
npm start
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api/*` to `http://localhost:5000` (configured
in `vite.config.js`). Open the app, sign up, complete your Learning Profile, then generate your
first AI roadmap from **Adaptive Learning**.

### 4. Production build

```bash
cd frontend && npm run build   # outputs to frontend/dist — serve with any static host / Nginx
cd backend && npm start        # run behind a process manager like pm2, behind Nginx/Caddy as reverse proxy
```

---

## ✅ Verifying your setup

Once both servers are running:

```bash
curl http://localhost:5000/api/health
# {"success":true,"message":"StudyPilot AI API is running."}
```

Then open `http://localhost:5173`, sign up, and:
1. Fill in your **Learning Profile**.
2. Go to **Adaptive Learning** → "Generate roadmap" (requires a valid `GEMINI_API_KEY`).
3. Try a **Deep Learning Mode** conversation.
4. Generate and take a **Quiz** — your topic mastery updates automatically.
5. Check **Progress Analytics** and the **Dashboard** to see real charts populate.
6. Add tasks in **Study Planner** and items in **Revision Planner**.

## 🔐 Security notes
- Passwords are hashed with bcrypt (10 rounds).
- Access tokens are short-lived (default 7d, configurable); refresh tokens are stored hashed
  (SHA-256) in the `refresh_tokens` table and can be revoked on logout.
- All non-auth routes require a valid JWT via `Authorization: Bearer <token>`.
- Rate limiting (`express-rate-limit`) and `helmet` security headers are enabled by default.

## 📝 Notes on data
- No dummy/mock data is used anywhere in the running app. Every list, chart, and stat is queried
  live from MySQL.
- `db/seed_catalog.sql` is an **optional** starter curriculum catalog (subjects + topics), similar
  to a course directory — you can edit, extend, or replace it freely. All user-specific data
  (progress, quizzes, sessions, plans, notifications) is created fresh through the real app APIs
  as you use it.
