# SAKHI – Women’s Health Companion

> A holistic, empathetic, and stigma-free digital health companion for menstrual tracking, cycle-phase wellness, nutrition guidance, mood logging, myth-busting education, and AI-assisted support.

---

## 1. Overview & Problem Statement

Women's health—specifically menstrual and hormonal wellness—is often hindered by social stigma, fragmented information, and digital tools that either present overly rigid calendar math or intimidating medical terminology.

**SAKHI** addresses these gaps through an integrated, user-centric web platform:
- **Unified Health Journey:** Connects menstrual cycle tracking, symptom monitoring, mood trends, and tailored nutrition into one coherent daily experience.
- **Explainable & Adaptive Logic:** Uses transparent rules and adaptive history weighting to predict cycles, ovulation windows, and hormonal phases without black-box confusion.
- **Stigma-Free Education:** Dispels common misconceptions through an interactive **Myths vs Facts** knowledge base (browseable cards + interactive quiz).
- **Empathetic Chatbot:** Offers compassionate, phase-aware guidance backed by safety guardrails and optional AI fallback.
- **Safety First:** Clear, consistent non-diagnostic boundaries ensuring users receive supportive wellness recommendations while encouraging professional medical consultation when needed.

---

## 2. Tech Stack

| Layer | Technologies |
|---|---|
| **Monorepo** | NPM Workspaces (`apps/*`), Concurrently |
| **Frontend** | React 19, Vite 8, React Router 7, Framer Motion, GSAP, Chart.js, Vanilla CSS tokens |
| **Backend** | Node.js, Express 4, `pg` (PostgreSQL Client), JWT, bcrypt, Winston/Custom Logger |
| **Database** | PostgreSQL (compatible with local Postgres, Neon.tech, Supabase, Render, Railway, AWS RDS) |
| **APIs & Integrations** | USDA FoodData Central API (Nutrition enrichment), Google Gemini API (Optional chatbot fallback) |
| **Testing** | Vitest & React Testing Library (Frontend), Jest & Supertest (Backend) |

---

## 3. Project Architecture & Directory Structure

```text
Sakhi/
├── apps/
│   ├── backend/                          # Express REST API & Database Models
│   │   ├── sql/
│   │   │   └── schema.sql                # PostgreSQL DDL tables & indexes
│   │   ├── src/
│   │   │   ├── ai/                       # Prediction calculation engine
│   │   │   ├── config/                   # PostgreSQL connection pool (supports DATABASE_URL)
│   │   │   ├── integrations/             # USDA FoodData Central API integration
│   │   │   ├── modules/
│   │   │   │   ├── auth/                 # Signup, login, password reset
│   │   │   │   ├── chatbot/              # Intent classification, local responses, Gemini fallback
│   │   │   │   ├── cycle/                # Cycle logging, intervals, adaptive prediction
│   │   │   │   ├── daily-logs/           # Daily mood and symptom quick logs
│   │   │   │   ├── mood/                 # Mood tracking and phase analysis
│   │   │   │   ├── myths/                # Educational myths, categories, and quiz data
│   │   │   │   ├── nutrition/            # Phase and symptom nutrition recommendations
│   │   │   │   ├── prediction/           # Prediction endpoints
│   │   │   │   └── symptoms/             # Symptom logging and suggestion engine
│   │   │   ├── shared/                   # Auth & metrics middleware, structured logger
│   │   │   ├── app.js                    # Express application entry
│   │   │   └── server.js                 # HTTP listener (port 5000)
│   │   ├── tests/                        # Integration and unit test suites
│   │   ├── API_EXAMPLES.md               # Backend API reference with sample payloads
│   │   └── package.json
│   │
│   └── frontend/                         # React 19 + Vite SPA
│       ├── public/                       # Static public assets
│       ├── src/
│       │   ├── features/
│       │   │   ├── auth/                 # Login, Signup, ForgotPassword
│       │   │   ├── chatbot/              # SAKHI Companion chat interface & tests
│       │   │   ├── cycle/                # CycleTracker & interactive CycleCalendar
│       │   │   ├── dashboard/            # Overview hub (phase banner, cycle summary, quick actions)
│       │   │   ├── education/            # Modularized Education feature
│       │   │   │   ├── components/       # EducationToolbar, EducationCards, MythCard, EducationQuiz
│       │   │   │   ├── data/             # Reference myths & quiz constants
│       │   │   │   ├── hooks/            # useEducation state & filtering hook
│       │   │   │   ├── Education.jsx     # Orchestrator page component
│       │   │   │   ├── Education.test.jsx
│       │   │   │   └── index.js          # Feature barrel export
│       │   │   ├── mood/                 # MoodTracker & moodContext
│       │   │   ├── nutrition/            # Nutrition recommendations & engine
│       │   │   └── symptoms/             # Symptom tracker & suggestion display
│       │   ├── shared/                   # PageFrame, AnimatedBackdrop, API client, auth utils
│       │   ├── App.jsx                   # Route hierarchy and navigation shell
│       │   ├── index.css                 # Emergent design tokens, typography, glassmorphism
│       │   └── main.jsx                  # React DOM mount point
│       ├── package.json
│       └── vite.config.js
│
├── package.json                          # Monorepo scripts (dev, test, build)
├── PROJECT_DOCUMENTATION.md              # In-depth architectural & algorithmic documentation
├── USER_MANUAL.md                        # End-user operational guide
└── README.md                             # Project manual (this document)
```

---

## 4. Quick Start & Setup

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Supabase** project with PostgreSQL enabled

### 1) Clone the Repository & Install Dependencies

From the repository root:
```bash
npm install
```

### 2) Add Managed PostgreSQL

1. Create a project at [Supabase](https://supabase.com).
2. Open **Project Settings → Database → Connection string → URI → Connection pooling** and copy the **Session pooler** URI. Replace the password placeholder and keep `sslmode=require`.
3. Open the Supabase **SQL Editor**, paste `apps/backend/sql/schema.sql`, and run it once.
4. Keep the connection string private and add it to `apps/backend/.env` or your backend host as `DATABASE_URL`.

### 3) Configure Deployment Environment Variables

Add the following variables to the backend hosting provider (refer to `apps/backend/.env.example`):

```env
PORT=5000
CORS_ORIGIN=https://your-frontend.example.com

# --- Cloud Database Option (Recommended) ---
DATABASE_URL=postgresql://postgres.project-ref:password@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require

DATABASE_SSL=true
DB_POOL_MAX=5

# Authentication
JWT_SECRET=sakhi_development_secret_key_12345

# Optional Third-Party Integrations
USDA_API_KEY=DEMO_KEY
GEMINI_API_KEY=
LOG_LEVEL=info
```

### 4) Deploy and Connect the Applications

1. Deploy `apps/backend` to your backend hosting provider and set `PUBLIC_API_URL` to its public URL.
2. Set `CORS_ORIGIN` to the public frontend URL in the backend deployment environment.
3. Deploy `apps/frontend` to a static hosting provider with `VITE_API_BASE_URL=https://your-backend.example.com/api`.
4. Verify the backend health endpoint:
```bash
curl https://your-backend.example.com/api/health
```

---

## 5. Running Tests & Building

### Run All Tests
```bash
# Frontend test suite (Vitest)
npm run test:run --workspace=apps/frontend

# Backend test suite (Jest + Supertest)
npm run test --workspace=apps/backend
```

### Build for Production
```bash
npm run build
```

---

## 6. Core Features Walkthrough

### 🩸 Cycle Tracking & Adaptive Prediction
- Input last period start, period duration, or multiple past cycle dates.
- Predicts next period date, ovulation day, fertile window, and current cycle day.
- Computes variation and confidence indicators (High / Medium / Low / Approximate).
- Interactive month calendar highlighting phases (Menstrual, Follicular, Ovulation, Luteal).

### 🥗 Phase-Aware Nutrition
- Recommends macro and micro nutrients aligned with the current hormonal phase.
- Allows filtering and personalized suggestions by current symptoms and dietary needs.
- Live integration with USDA FoodData Central for caloric and nutrient insights.

### 🧘 Mood & Symptom Checkers
- Log daily energy, mood, stress, and physical discomforts (cramps, fatigue, headaches).
- Visual trends and contextual guidance for symptom alleviation.
- Passes active context to the companion chatbot for seamless assistance.

### 📚 Education (Myths vs Facts)
- **Cards Mode:** Filterable topic cards featuring category tags, common misconceptions, scientific "Sage Fact" callouts, verified medical source citations, and helpfulness voting.
- **Quiz Mode:** Interactive question-and-answer format ("Myth ❌" vs "Fact ✅") with instant explanations and score tracking.

### 💬 SAKHI Companion Chatbot
- Empathetic natural language chat tailored to female health and hormonal phases.
- Fast local rule engine with intent detection, backed by safety-first guardrails and optional Gemini AI fallback.

---

## 7. Safety & Medical Disclaimer

> **Important:** SAKHI is an educational and lifestyle tracking platform designed to support awareness and personal wellness. **It does not provide medical advice, clinical diagnoses, or treatment plans.** In the event of severe pain, abnormal bleeding, or medical emergencies, users should promptly consult a licensed healthcare professional.

---

## 8. Documentation References

- **[PROJECT_DOCUMENTATION.md](file:///e:/GIT%20PROJECTS/Sakhi/PROJECT_DOCUMENTATION.md):** Comprehensive engineering architecture, mathematical cycle models, security protocols, and system design.
- **[USER_MANUAL.md](file:///e:/GIT%20PROJECTS/Sakhi/USER_MANUAL.md):** User instructions and UI navigation guide.
- **[apps/backend/API_EXAMPLES.md](file:///e:/GIT%20PROJECTS/Sakhi/apps/backend/API_EXAMPLES.md):** Endpoint specifications, request bodies, and sample responses.
