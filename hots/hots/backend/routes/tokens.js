const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/tokens — all tokens for today (DaaS)
router.get('/', authenticate, async (req, res) => {
  try {
    const { date, doctor_id, status } = req.query;
    let query = `
      SELECT t.*, d.name AS doctor_name, d.specialization,
             dep.name AS department_name
      FROM   tokens t
      JOIN   doctors d     ON t.doctor_id     = d.id
      JOIN   departments dep ON t.department_id = dep.id
      WHERE  t.date = $1
    `;
    const params = [date || new Date().toISOString().split('T')[0]];

    if (doctor_id) { query += ` AND t.doctor_id = $${params.length + 1}`; params.push(doctor_id); }
    if (status)    { query += ` AND t.status = $${params.length + 1}`;    params.push(status); }

    query += ' ORDER BY t.token_number';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/tokens/queue/:doctorId — live queue for a doctor (DaaS)
router.get('/queue/:doctorId', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT t.*, d.name AS doctor_name, dep.name AS department_name
       FROM   tokens t
       JOIN   doctors d     ON t.doctor_id     = d.id
       JOIN   departments dep ON t.department_id = dep.id
       WHERE  t.doctor_id = $1 AND t.date = $2
         AND  t.status IN ('waiting','in-progress')
       ORDER  BY t.token_number`,
      [req.params.doctorId, today]
    );
    res.json({
      doctor_id:   parseInt(req.params.doctorId),
      date:        today,
      queue:       result.rows,
      total_waiting: result.rows.filter(r => r.status === 'waiting').length,
      in_progress:   result.rows.filter(r => r.status === 'in-progress').length
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tokens — book a token (DaaS)
router.post('/', authenticate, authorize('admin', 'receptionist'), async (req, res) => {
  const { patient_name, patient_age, patient_phone, doctor_id } = req.body;
  if (!patient_name || !patient_age || !patient_phone || !doctor_id)
    return res.status(400).json({ error: 'patient_name, patient_age, patient_phone, doctor_id required.' });

  try {
    // Get doctor's department
    const docResult = await pool.query('SELECT * FROM doctors WHERE id = $1', [doctor_id]);
    if (!docResult.rows[0]) return res.status(404).json({ error: 'Doctor not found.' });
    if (!docResult.rows[0].available)
      return res.status(400).json({ error: 'Doctor is not available today.' });

    const today = new Date().toISOString().split('T')[0];

    // Get next token number for this doctor today
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM tokens WHERE doctor_id = $1 AND date = $2',
      [doctor_id, today]
    );
    const tokenNumber = parseInt(countResult.rows[0].count) + 1;

    const result = await pool.query(
      `INSERT INTO tokens
         (token_number, patient_name, patient_age, patient_phone, doctor_id, department_id, booked_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [tokenNumber, patient_name, patient_age, patient_phone,
       doctor_id, docResult.rows[0].department_id, req.user.id]
    );
    res.status(201).json({ ...result.rows[0], doctor_name: docResult.rows[0].name });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/tokens/:id/status — update token status
router.put('/:id/status', authenticate, authorize('admin', 'doctor'), async (req, res) => {
  const { status } = req.body;
  const valid = ['waiting', 'in-progress', 'completed', 'cancelled'];
  if (!valid.includes(status))
    return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` });
  try {
    const result = await pool.query(
      'UPDATE tokens SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Token not found.' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
