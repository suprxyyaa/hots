# 🏥 HOTS — Hospital OPD Token System

> **Cloud Computing Lab Project** | IaaS · PaaS · SaaS · DaaS

---

## 📁 Project Structure

```
hots/
├── schema.sql                    ← Run on Supabase first
├── vercel.json                   ← Vercel build config
│
├── backend/
│   ├── server.js                 ← Express entry point
│   ├── db.js                     ← PostgreSQL connection
│   ├── seed.js                   ← Demo data
│   ├── package.json
│   ├── Procfile                  ← Render deployment
│   ├── .env.example
│   ├── middleware/
│   │   └── auth.js               ← JWT + role guard
│   └── routes/
│       ├── auth.js               ← Login / Register
│       ├── departments.js        ← CRUD departments
│       ├── doctors.js            ← CRUD doctors
│       ├── tokens.js             ← Book & manage tokens (DaaS)
│       └── analytics.js          ← Analytics (DaaS)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js                ← All API calls
        ├── index.css
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── Login.jsx
            ├── AdminDashboard.jsx
            ├── ReceptionistDashboard.jsx
            ├── DoctorDashboard.jsx
            └── Analytics.jsx
```

---

## 👥 Roles

| Role           | What they do                                      |
|----------------|---------------------------------------------------|
| Admin          | Manage departments, doctors, user accounts, analytics |
| Receptionist   | Book tokens for patients, view/cancel tokens     |
| Doctor         | View their OPD queue, call/complete/cancel tokens |

---

## 🗄️ Database Schema

```
departments (id, name, description)
doctors     (id, name, specialization, department_id, available)
users       (id, name, email, password, role, doctor_id)
tokens      (id, token_number, patient_name, patient_age,
             patient_phone, doctor_id, department_id, status, date)
```

---

## 🚀 LOCAL SETUP

### Step 1 — Supabase Database
1. Go to supabase.com → New Project
2. SQL Editor → paste `schema.sql` → Run
3. Copy connection string (URI format)

### Step 2 — Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
node seed.js       # loads demo data
npm run dev        # → http://localhost:5000
```

### Step 3 — Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

### Demo Accounts (password: password123)
| Role           | Email                    |
|----------------|--------------------------|
| 🔴 Admin       | admin@hots.com           |
| 🔵 Receptionist| receptionist@hots.com    |
| 🟢 Doctor      | doctor@hots.com          |

---

## ☁️ DEPLOYMENT

### Backend → Render
1. render.com → New Web Service → Connect GitHub repo
2. Settings:
   ```
   Root Directory : backend
   Build Command  : npm install
   Start Command  : node server.js
   ```
3. Environment Variables:
   ```
   DATABASE_URL  = postgresql://...supabase connection string...
   JWT_SECRET    = your_secret_key
   NODE_ENV      = production
   PORT          = 5000
   FRONTEND_URL  = https://hots.vercel.app
   RENDER_URL    = https://hots-backend.onrender.com
   ```

### Frontend → Vercel
1. vercel.com → New Project → Import repo
2. Leave Root Directory **blank** (vercel.json handles it)
3. Environment Variable:
   ```
   VITE_API_URL = https://hots-backend.onrender.com
   ```
4. Deploy

### Keep-Alive → UptimeRobot
1. uptimerobot.com → Add Monitor
2. HTTP(s) → URL: `https://hots-backend.onrender.com/`
3. Interval: 5 minutes → prevents cold starts

---

## 🌐 DaaS API Endpoints

| Method | Endpoint                      | Access              | Description              |
|--------|-------------------------------|---------------------|--------------------------|
| GET    | /api/departments              | All                 | List departments         |
| GET    | /api/doctors                  | All                 | List doctors             |
| GET    | /api/tokens                   | Admin, Receptionist | Today's tokens           |
| GET    | /api/tokens/queue/:doctorId   | All                 | Live queue for doctor    |
| POST   | /api/tokens                   | Admin, Receptionist | Book a new token         |
| PUT    | /api/tokens/:id/status        | Admin, Doctor       | Update token status      |
| GET    | /api/analytics                | Admin               | Full analytics           |

---

## 🏗️ Cloud Model Mapping

| Model | Service          | How Used                                               |
|-------|------------------|--------------------------------------------------------|
| IaaS  | AWS (under Render/Vercel/Supabase) | Physical compute, networking, storage |
| PaaS  | Render           | Hosts Node.js backend — no server management needed   |
| PaaS  | Supabase         | Managed PostgreSQL — no DB admin needed               |
| SaaS  | hots.vercel.app  | End users access via browser — Admin/Receptionist/Doctor |
| DaaS  | REST APIs        | `/api/tokens`, `/api/queue/:id`, `/api/analytics` deliver structured hospital data |

---

## 🧪 Demo Flow for Viva

1. Login as **Admin** → add a department → add a doctor
2. Login as **Receptionist** → book 3 tokens for different patients
3. Login as **Doctor** → see queue → call first patient → mark complete
4. Login as **Admin** → check 📈 Analytics → see live stats
5. Show API response at `https://hots-backend.onrender.com/api/tokens` → DaaS demo
