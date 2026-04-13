const router = require('express').Router();
const pool   = require('../db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required.' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user   = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid  = await bcrypt.compare(password, user.password);
    if (!valid)  return res.status(401).json({ error: 'Invalid credentials.' });
    const token  = jwt.sign(
      { id: user.id, email: user.email, role: user.role, doctor_id: user.doctor_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, doctor_id: user.doctor_id }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, doctor_id } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'All fields required.' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, doctor_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role`,
      [name, email, hashed, role, doctor_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered.' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
