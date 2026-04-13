const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/doctors',     require('./routes/doctors'));
app.use('/api/tokens',      require('./routes/tokens'));
app.use('/api/analytics',   require('./routes/analytics'));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    system:  'HOTS — Hospital OPD Token System',
    status:  'running',
    version: '1.0.0',
    daas_endpoints: [
      'GET  /api/departments',
      'GET  /api/doctors',
      'GET  /api/tokens',
      'GET  /api/tokens/queue/:doctorId',
      'POST /api/tokens',
      'GET  /api/analytics'
    ]
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏥 HOTS Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DaaS APIs   : http://localhost:${PORT}/api/*\n`);

  // ── Keep-alive ping (prevents Render free tier cold starts) ───────────────
  if (process.env.NODE_ENV === 'production') {
    const BACKEND_URL = process.env.RENDER_URL || 'https://hots-backend.onrender.com';
    setInterval(() => {
      fetch(BACKEND_URL)
        .then(() => console.log('🏓 Keep-alive ping sent'))
        .catch(() => {});
    }, 14 * 60 * 1000);
    console.log('   Keep-alive : enabled (pings every 14 min)\n');
  }
});
