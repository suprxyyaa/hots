const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/doctors — DaaS endpoint
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, dep.name AS department_name
       FROM doctors d
       JOIN departments dep ON d.department_id = dep.id
       ORDER BY d.name`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/doctors/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, dep.name AS department_name
       FROM doctors d
       JOIN departments dep ON d.department_id = dep.id
       WHERE d.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Doctor not found.' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/doctors — admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, specialization, department_id } = req.body;
  if (!name || !specialization || !department_id)
    return res.status(400).json({ error: 'name, specialization and department_id required.' });
  try {
    const result = await pool.query(
      'INSERT INTO doctors (name, specialization, department_id) VALUES ($1,$2,$3) RETURNING *',
      [name, specialization, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/doctors/:id — admin only
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, specialization, department_id, available } = req.body;
  try {
    const result = await pool.query(
      `UPDATE doctors SET name=$1, specialization=$2, department_id=$3, available=$4
       WHERE id=$5 RETURNING *`,
      [name, specialization, department_id, available, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Doctor not found.' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/doctors/:id — admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM doctors WHERE id = $1', [req.params.id]);
    res.json({ message: 'Doctor deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
