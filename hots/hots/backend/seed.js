/**
 * seed.js — Populate HOTS database with demo data
 * Run: node seed.js
 *
 * Demo accounts:
 *   admin@hots.com         / password123  (Admin)
 *   receptionist@hots.com  / password123  (Receptionist)
 *   doctor@hots.com        / password123  (Dr. Rahul Sharma — Cardiology)
 */
const pool   = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  console.log('🌱 Seeding HOTS database...\n');
  const pw = await bcrypt.hash('password123', 10);

  // ── Wipe ──────────────────────────────────────────────────────────────────
  await pool.query('DELETE FROM tokens');
  await pool.query('DELETE FROM users');
  await pool.query('DELETE FROM doctors');
  await pool.query('DELETE FROM departments');
  await pool.query('ALTER SEQUENCE departments_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE doctors_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE tokens_id_seq RESTART WITH 1');

  // ── Departments ───────────────────────────────────────────────────────────
  const depts = [
    ['Cardiology',    'Heart and cardiovascular system'],
    ['Orthopedics',   'Bones, joints and muscles'],
    ['Neurology',     'Brain and nervous system'],
    ['Pediatrics',    'Children health care'],
    ['General OPD',   'General medicine and check-ups'],
  ];
  const deptIds = [];
  for (const [name, desc] of depts) {
    const r = await pool.query(
      'INSERT INTO departments (name, description) VALUES ($1,$2) RETURNING id',
      [name, desc]
    );
    deptIds.push(r.rows[0].id);
  }

  // ── Doctors ───────────────────────────────────────────────────────────────
  const doctors = [
    ['Dr. Rahul Sharma',   'Cardiologist',        deptIds[0]],
    ['Dr. Priya Nair',     'Orthopedic Surgeon',  deptIds[1]],
    ['Dr. Arjun Mehta',    'Neurologist',         deptIds[2]],
    ['Dr. Sneha Kulkarni', 'Pediatrician',        deptIds[3]],
    ['Dr. Vikram Joshi',   'General Physician',   deptIds[4]],
  ];
  const doctorIds = [];
  for (const [name, spec, deptId] of doctors) {
    const r = await pool.query(
      'INSERT INTO doctors (name, specialization, department_id) VALUES ($1,$2,$3) RETURNING id',
      [name, spec, deptId]
    );
    doctorIds.push(r.rows[0].id);
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)',
    ['Admin User', 'admin@hots.com', pw, 'admin']
  );
  await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)',
    ['Reception Staff', 'receptionist@hots.com', pw, 'receptionist']
  );
  // Doctor login linked to Dr. Rahul Sharma
  await pool.query(
    'INSERT INTO users (name, email, password, role, doctor_id) VALUES ($1,$2,$3,$4,$5)',
    ['Dr. Rahul Sharma', 'doctor@hots.com', pw, 'doctor', doctorIds[0]]
  );

  // ── Sample Tokens for today ───────────────────────────────────────────────
  const receptionistRes = await pool.query("SELECT id FROM users WHERE email='receptionist@hots.com'");
  const receptionistId  = receptionistRes.rows[0].id;
  const today           = new Date().toISOString().split('T')[0];

  const patients = [
    ['Amit Verma',    45, '9876543210', doctorIds[0], deptIds[0], 1, 'completed'],
    ['Sunita Devi',   62, '9876543211', doctorIds[0], deptIds[0], 2, 'in-progress'],
    ['Ravi Kumar',    38, '9876543212', doctorIds[0], deptIds[0], 3, 'waiting'],
    ['Pooja Singh',   29, '9876543213', doctorIds[0], deptIds[0], 4, 'waiting'],
    ['Mohan Das',     55, '9876543214', doctorIds[1], deptIds[1], 1, 'completed'],
    ['Kavya Reddy',   34, '9876543215', doctorIds[1], deptIds[1], 2, 'waiting'],
    ['Arun Patel',    12, '9876543216', doctorIds[3], deptIds[3], 1, 'waiting'],
    ['Nisha Sharma',  8,  '9876543217', doctorIds[3], deptIds[3], 2, 'waiting'],
    ['Suresh Nair',   70, '9876543218', doctorIds[4], deptIds[4], 1, 'completed'],
    ['Lakshmi Iyer',  44, '9876543219', doctorIds[2], deptIds[2], 1, 'waiting'],
  ];

  for (const [name, age, phone, docId, deptId, tokenNum, status] of patients) {
    await pool.query(
      `INSERT INTO tokens
         (token_number, patient_name, patient_age, patient_phone,
          doctor_id, department_id, status, date, booked_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [tokenNum, name, age, phone, docId, deptId, status, today, receptionistId]
    );
  }

  console.log('✅ HOTS Database seeded!\n');
  console.log('─────────────────────────────────────────');
  console.log('  DEMO ACCOUNTS (password: password123)');
  console.log('─────────────────────────────────────────');
  console.log('  🔴 Admin        : admin@hots.com');
  console.log('  🔵 Receptionist : receptionist@hots.com');
  console.log('  🟢 Doctor       : doctor@hots.com  (Dr. Rahul Sharma)');
  console.log('─────────────────────────────────────────\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
