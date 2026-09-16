# 🎓 Daily Online MCQ Exam Platform

A modern, fast, and comprehensive web application designed for students in Bangladesh to practice daily MCQs (for BCS, Bank Recruitment, University Admission, and Government Job exams) with real-time test taking, automated grading, instant solutions, and competitive leaderboards.

---

## 🎯 1. Purpose

The primary purpose of the **Daily Online MCQ Exam Platform** is to help competitive examinees and students build a disciplined habit of **practicing daily MCQs** with high precision and speed.

### Why It Was Built:
- **Daily Discipline & Self-Assessment:** Candidates preparing for competitive exams often lack structured, daily practice routines. This platform provides scheduled daily model tests to track daily progress.
- **Overcoming Traditional Paper-Based Exam Constraints:** Physical mock tests are cumbersome to grade, lack immediate feedback, and cannot instantly produce dynamic merit lists or accurate negative marking.
- **In-Depth Knowledge Retention:** Memorizing MCQ answers without knowing the rationale leads to recurring errors. The platform delivers instant, textbook-referenced solutions and explanations for every question.
- **Barrier-Free Access for Students:** Students can participate instantly by simply providing their Name, District, and WhatsApp Number—eliminating tedious account creation while maintaining their personal exam history.

---

## ⚡ 2. Key Features

### 👨‍🎓 Student & Public Experience
- **Real-Time Exam Taking:**
  - Full-screen focused interface free from distractions (header and footer auto-hidden during the test).
  - Accurate second-by-second countdown timer with automated submission when time expires.
  - Interactive **Question Navigator Grid** color-coded for answered (green), bookmarked (amber), and unvisited (slate) questions.
  - Option to flag/bookmark questions for quick review before final submission.
  - **Anti-Cheat Detection:** Tracks tab switching (`visibilitychange`) and page reloads with prompt alerts to ensure examination integrity.
- **Instant Results & Performance Analysis:**
  - Automated calculation with configurable negative marking (e.g., -0.25, -0.50).
  - Detailed scorecard: total score, accuracy percentage, correct answers, incorrect answers, skipped questions, and pass/fail status.
  - Celebration confetti animation upon achieving passing marks.
  - Direct WhatsApp sharing link to share report cards with teachers or study groups.
- **Interactive Solutions & Explanations:**
  - Detailed review of every question highlighting the correct answer (green), the student's chosen answer (red if incorrect), and neutral badges for unattempted questions.
  - Rich textbook-referenced explanations explaining the underlying rules, historical context, or mathematical derivations.
  - Quick filter tabs: *All Questions*, *Correct Only*, *Incorrect Only*, and *Skipped Questions*.
- **Live Leaderboard:**
  - Real-time rankings showcasing top performers with Gold, Silver, and Bronze trophy badges.
  - Tie-breaker calculations based on highest marks and fastest completion time.
- **Student History Portal (`/history`):**
  - Allows examinees to enter their WhatsApp number to review all their past exam submissions, average scores, and re-read solutions at any time.

---

### 🛡️ Admin & Institutional Management Suite
- **Secure Role-Based Authentication:**
  - Role-Based Access Control (RBAC): **Super Admin**, **Admin**, and **Content Editor**.
  - Secure credential validation and session token persistence.
- **Analytics & Executive Dashboard:**
  - Key metrics: active live exams, total unique students, today's submissions, and question bank inventory.
  - Area charts powered by Recharts showing 7-day student participation trends and subject-wise distributions.
- **Exam Management (`/admin/exams`):**
  - Create, schedule, publish, draft, or archive model tests.
  - Configure exam duration, passing percentage, negative marking value, and leaderboard visibility.
  - Pick and choose questions from the central question bank with subject/category filters.
  - One-click copy for direct exam share links.
- **Question Bank (`/admin/questions`):**
  - Manage a repository of questions categorized by Subject (Bangla Literature, Grammar, Math, English, General Knowledge, Science).
  - Add 4 multiple-choice options, designate the correct choice, difficulty level (Easy, Medium, Hard), and add rich explanations.
- **Student Directory (`/admin/students`):**
  - Track registered examinees by WhatsApp number, district, exams taken, and historical average score.
- **Submissions & One-Click CSV Export (`/admin/submissions`):**
  - View all student attempt logs with exact timestamps and scores.
  - **Export to CSV:** Generates UTF-8 encoded CSV files compatible with Microsoft Excel and Google Sheets without font distortion for Bengali text.
- **Question-Level Analytics (`/admin/analytics`):**
  - Analyzes accuracy rates per question to identify common stumbling blocks and challenging topics.
- **System Settings (`/admin/settings`):**
  - Customize application name, logo, helpline WhatsApp number, contact email, and default exam rules.

---

## 🏗️ 3. How It Works (Architecture & Tech Stack)

The platform follows a modular full-stack architecture built for high performance, reliability, and security:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│  - Tailwind CSS v4 (Royal Blue Palette #1c398e)        │
│  - React Router v7 (Public Routes & Admin Guards)      │
│  - Recharts (Analytics) & Canvas Confetti              │
└───────────────────────────┬────────────────────────────┘
                            │
              REST API / Client Service Layer
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│    Firebase Auth / RBAC     │   │   MongoDB Backend Server    │
│  - Token verification       │   │  - Express.js REST API      │
│  - Role checking            │   │  - Mongoose Schemas         │
│  - Admin route protection   │   │  - Exams, Questions, Logs   │
│  - Offline / Mock Fallback  │   │  - Anti-cheat timestamps    │
└─────────────────────────────┘   └─────────────────────────────┘
```

### 1. Frontend: React 19, Vite & Tailwind CSS
- **React 19 & Vite 6:** Delivers instant page transitions, optimized build bundling, and functional component hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Tailwind CSS v4:** Styled using an authoritative **Royal Blue theme (`#1c398e`)** paired with neutral slates for enhanced readability during long reading sessions.
- **Responsive Layouts:** Desktop-first precision with full mobile touch-target support (cards, radio selections, navigation drawer, and sticky exam timers).
- **Bangla Typography Support:** Pre-configured with Kalpurush, SolaimanLipi, and standard Bengali system fonts with tabular numeral rendering for numbers.

### 2. Authentication & Role-Based Access Control (RBAC)
- **Role-Based Access:** Protects administrative interfaces (`/admin/*`) through `ProtectedAdminRoute` wrappers in `App.jsx`.
- **Roles:**
  - **Super Admin:** Full platform control including system settings, resetting demo data, and managing administrator accounts.
  - **Admin:** Creation and maintenance of exams, questions, student submissions, and CSV exports.
  - **Content Editor:** Question bank authoring and exam formulation.
- **Firebase Auth / JWT Integration:** Supports Firebase Authentication token verification on the client and server side, with client-side session management (`localStorage` fallback) ensuring zero setup friction during development or previews.

### 3. Backend & Database: MongoDB & Express
- **Express.js API (`/server`):**
  - Modular controller-route structure (`/api/exams`, `/api/questions`, `/api/submissions`, `/api/students`, `/api/analytics`).
  - Middleware for JWT/Firebase authentication, input validation, and error handling.
- **MongoDB & Mongoose Schemas:**
  - **Exam Schema:** Title, slug, date, duration, pass percentage, negative marks, question references, shuffle flags, and publish status.
  - **Question Schema:** Subject, category, question text, 4 options (A, B, C, D), correct option ID, marks, difficulty, and educational explanation.
  - **Submission Schema:** Exam ID, student name, WhatsApp number, district, institution, answers array, calculated score, percentage, passed status, start time, and submit time.
  - **Admin Schema:** Name, email, hashed password (bcrypt), role, and active status.
- **Hybrid Storage Client (`src/api/client.js` & `src/data/mockStore.js`):**
  - Provides a self-contained persistence layer using `localStorage` pre-seeded with realistic Bengali questions (BCS, History, Bangla, Math, English).
  - Works seamlessly offline or in sandbox environments, and easily connects to a live MongoDB instance by pointing the API base URL.

---

## 📂 4. Project Directory Structure

```text
├── index.html                    # HTML entry point (Bengali metadata & font imports)
├── metadata.json                 # AI Studio applet specifications
├── package.json                  # Dependencies, Vite build, and scripts
├── public/                       # Favicon, logos, and static assets
│   └── logo.svg
├── src/
│   ├── App.jsx                   # Central router & protected route configurations
│   ├── main.jsx                  # React DOM initialization
│   ├── index.css                 # Tailwind CSS v4 entry & font configurations
│   ├── api/
│   │   └── client.js             # API client with seamless local-first & server fallback
│   ├── components/
│   │   ├── common/               # Navbar, Footer, AdminLayout, Toast, Modal, Dialogs
│   │   └── exam/                 # QuestionCard, OptionItem, ExamTimer, NavigatorGrid
│   ├── context/
│   │   ├── AuthContext.jsx       # Admin authentication & RBAC provider
│   │   └── SettingsContext.jsx   # Global application branding & settings
│   ├── data/
│   │   └── mockStore.js          # Seed questions, model tests, and local persistence store
│   └── pages/
│       ├── public/               # HomePage, AllExamsPage, StudentInfoPage,
│       │                         # ExamPage, ResultPage, SolutionPage,
│       │                         # LeaderboardPage, StudentHistoryPage
│       └── admin/                # AdminDashboard, ExamManagement, QuestionBank,
│                                 # StudentManagement, SubmissionManagement,
│                                 # AnalyticsPage, AdminManagement, SettingsPage
└── server/                       # Node/Express backend with MongoDB Mongoose models
    ├── config/                   # MongoDB connection configuration
    ├── controllers/              # Business logic handlers
    ├── middleware/               # Auth & validation middlewares
    ├── models/                   # Mongoose schemas (Exam, Question, Submission, Admin)
    └── routes/                   # API endpoint routers
```

---

## 🚀 5. Getting Started & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd daily-online-mcq-exam-platform
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/exam_db
JWT_SECRET=your_jwt_secret_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be accessible at: **`http://localhost:3000`**

### 4. Build for Production
```bash
npm run build
```
This generates an optimized static production build in the `dist/` directory.

---

## 🌐 6. Key Application Routes

| Path | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Homepage showcasing live model tests and quick access |
| `/all-exams` | Public | Complete list of published, scheduled, and past exams |
| `/history` | Public | Look up past exam history and scorecards by WhatsApp number |
| `/exam/:slug` | Public | Exam overview, guidelines, and student onboarding form |
| `/exam/:slug/take` | Public | Live timed MCQ testing interface with anti-cheat protection |
| `/result/:id` | Public | Instant results card, percentage, and performance metrics |
| `/solution/:id` | Public | Question-by-question solutions with detailed explanations |
| `/exam/:slug/leaderboard` | Public | Live merit rankings with Gold, Silver, Bronze badges |
| `/admin/login` | Public | Admin login portal |
| `/admin/dashboard` | Admin | Administrative summary, participation metrics, and quick actions |
| `/admin/exams` | Admin | Model test builder, question selector, and link sharing |
| `/admin/questions` | Admin | Question bank manager categorized by subject and difficulty |
| `/admin/students` | Admin | Examinee directory and aggregated performance data |
| `/admin/submissions` | Admin | Full submission logs and UTF-8 encoded CSV export |
| `/admin/analytics` | Admin | Question accuracy and error rate diagnostics |
| `/admin/admins` | Super Admin | Manage administrator accounts and roles |
| `/admin/settings` | Super Admin | Platform branding, helpline details, and default test rules |

---

## 📄 License
This project is licensed under the MIT License - feel free to use and adapt it for educational and institutional examination purposes.
