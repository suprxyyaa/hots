-- ============================================
-- HOTS — Hospital OPD Token System
-- Database Schema (PostgreSQL / Supabase)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  role         VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'receptionist', 'doctor')),
  doctor_id    INTEGER,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  available     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tokens (
  id             SERIAL PRIMARY KEY,
  token_number   INTEGER NOT NULL,
  patient_name   VARCHAR(100) NOT NULL,
  patient_age    INTEGER NOT NULL CHECK (patient_age > 0),
  patient_phone  VARCHAR(15) NOT NULL,
  doctor_id      INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  department_id  INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  status         VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed', 'cancelled')),
  date           DATE DEFAULT CURRENT_DATE,
  booked_by      INTEGER REFERENCES users(id),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Foreign key: users.doctor_id → doctors.id
ALTER TABLE users
  ADD CONSTRAINT fk_user_doctor
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL;
