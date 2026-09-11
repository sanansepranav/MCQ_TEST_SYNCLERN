# 🧪 Digital Microsys

> **Online Test Management System** — A full-stack web application for conducting, managing, and evaluating online examinations with built-in anti-cheat proctoring, real-time timer, auto-grading, and professional PDF report generation.

🚀 **[Live Demo](https://digital-microsys.vercel.app/)**

---

## ✨ Features

### 👨‍💼 Admin Module
- **Dashboard** — Overview stats: total tests, students, results, recent activity
- **Test Management** — Create, edit, publish, and delete tests with configurable settings
- **Question Upload** — Add questions manually or bulk upload via CSV
- **Answer Key** — Upload and manage answer keys per test
- **Student Management** — View all students, enable/disable accounts, view individual results
- **Results & Analytics** — View results by test, ranked table with pass/fail stats
- **PDF Export** — Export individual or bulk results as professional PDF reports

### 🎓 Student Module
- **Dashboard** — View available (live/upcoming) tests, stats, and recent results
- **Take Test** — Fullscreen test interface with question palette, timer, and navigation
- **Anti-Cheat Proctoring** — Fullscreen enforcement, tab switch detection, keyboard shortcut blocking
- **Auto-Grading** — Instant grading with support for negative marking
- **Result Detail** — Score breakdown, answer comparison table, PDF download
- **My Results** — History of all attempted tests with scores

### 🔒 Security Features
- JWT-based authentication with auto-expiry
- Role-based access control (admin/student)
- Answer keys never exposed to student API responses
- Brute-force protection with rate limiting (15 login attempts / 15 min)
- Helmet.js security headers
- Input validation on all endpoints
- CORS origin whitelisting

### 📄 PDF Reports (pdfkit)
- **Single Result PDF (3 pages):**
  - Page 1: Student details + result summary + pass/fail badge
  - Page 2: Answer sheet comparison with color-coded rows (green/red/amber)
  - Page 3: Security report with violation log (if applicable)
- **Bulk Results PDF (landscape):**
  - Test statistics (highest, lowest, average, pass/fail counts)
  - Ranked results table for all students

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT, bcrypt.js |
| **PDF Generation** | pdfkit (server-side) |
| **File Upload** | Multer, Papa Parse (CSV) |
| **Email** | Nodemailer |
| **Security** | Helmet, express-rate-limit, CORS |

---

## 📁 Project Structure

```
digital-microsys/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ResultSummary.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   ├── useTimer.js
│   │   │   └── useProctor.js
│   │   ├── pages/
│   │   │   ├── admin/         # Admin pages
│   │   │   └── student/       # Student pages
│   │   ├── services/
│   │   │   └── api.js         # Axios instance
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json            # Vercel deployment config
│   ├── .env.production        # Production env template
│   └── vite.config.js
│
├── server/                    # Node.js backend
│   ├── config/
│   │   ├── db.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resultController.js
│   │   ├── studentTestController.js
│   │   ├── testController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── AnswerKey.js
│   │   ├── Question.js
│   │   ├── Result.js
│   │   ├── Test.js
│   │   ├── User.js
│   │   └── Violation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── testRoutes.js
│   │   └── userRoutes.js
│   ├── seeds/
│   │   └── seed.js
│   ├── utils/
│   │   ├── email.js
│   │   ├── evaluateAnswers.js
│   │   └── token.js
│   ├── render.yaml             # Render deployment config
│   ├── .env.example
│   └── server.js
│
└── README.md

```

---

## 📸 Screenshots

### 🏠 Landing Page
![Digital Microsys Landing Page](docs/screenshots/01-landing-page.png)

### 🔐 Authentication
![Login](docs/screenshots/02-login.png)

### 👨‍💼 Admin Dashboard
![Admin Dashboard](docs/screenshots/03-admin-dashboard.png)

### 📝 Online MCQ Assessment
![MCQ Test](docs/screenshots/04-mcq-test.png)

### 💻 Coding Assessment
![Coding Assessment](docs/screenshots/05-coding-assessment.png)

### 📊 Results & Evaluation
![Results](docs/screenshots/06-results.png)

---

## 🚀 Installation & Setup (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/jaishmomin/digital-microsys.git
cd digital-microsys
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Configure Environment

```bash
# In /server directory
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/digital_microsys
JWT_SECRET=your_secure_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@digitalmicrosys.com
ADMIN_PASSWORD=Admin@12345
```

### 4. Seed Admin Account
```bash
cd server
npm run seed
```

### 5. Run Development Servers

**Backend** (Terminal 1):
```bash
cd server
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd client
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login (admin or student) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |

### Tests (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tests` | Create test |
| GET | `/api/tests` | Get all tests |
| GET | `/api/tests/:id` | Get test by ID |
| PUT | `/api/tests/:id` | Update test |
| DELETE | `/api/tests/:id` | Delete test |
| POST | `/api/tests/:id/questions` | Add questions |
| POST | `/api/tests/:id/questions/csv` | Upload CSV questions |
| POST | `/api/tests/:id/answerkey` | Upload answer key |
| GET | `/api/tests/:id/answerkey` | Get answer key |

### Results (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/results` | All results (paginated) |
| GET | `/api/results/test/:testId` | Results for a test |
| GET | `/api/results/:id` | Single result detail |
| GET | `/api/results/:id/export-pdf` | Download result PDF |
| GET | `/api/results/test/:testId/export-pdf` | Download all results PDF |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/tests` | Available tests |
| GET | `/api/student/tests/:id/start` | Get questions for attempt |
| POST | `/api/student/tests/:id/submit` | Submit test |
| GET | `/api/student/results` | My results |
| GET | `/api/student/results/:id` | Result detail |
| GET | `/api/student/results/:id/pdf` | Download result PDF |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status |

---

## 🌐 Deployment Guide

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with **readWrite** permissions
3. Whitelist all IPs: `0.0.0.0/0` (for Render)
4. Get connection string:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/digital-microsys?retryWrites=true&w=majority
   ```

### Backend → Render.com
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, select `/server` as root directory
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variables (from `.env.example`)
6. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your GitHub repo, select `/client` as root directory
3. Set:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://digital-microsys-api.onrender.com`)

---

## 🔑 Default Credentials (Testing)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@digitalmicrosys.com | Admin@12345 |

> ⚠️ **Change the admin password after first login!**
> Admin accounts cannot be created through public registration. Use `npm run seed`.

---

## 📊 CSV Format (Question Upload)

```csv
questionNo,questionText,optionA,optionB,optionC,optionD,marks
1,What is 2+2?,3,4,5,6,1
2,Capital of India?,Mumbai,Delhi,Chennai,Kolkata,1
3,Largest planet?,Earth,Mars,Jupiter,Saturn,2
```

---

## 🛡 Anti-Cheat System

| Feature | Behavior |
|---------|----------|
| Fullscreen | Requests fullscreen on test start; violation + auto-submit on exit |
| Tab Switch | `visibilitychange` event → violation + auto-submit |
| Window Blur | `blur` event → violation + auto-submit |
| Keyboard | Blocks F5, Ctrl+R/T/W/N/F/C/A, Alt+F4/Tab |
| Right-Click | Disabled via `contextmenu` prevention |
| Page Close | `beforeunload` warning dialog |
| Clipboard | Copy/paste/text selection disabled |

---

## 📝 License

MIT License — feel free to use, modify, and distribute.
