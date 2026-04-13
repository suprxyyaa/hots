const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/departments — DaaS endpoint
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/departments — admin only
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name required.' });
  try {
    const result = await pool.query(
      'INSERT INTO departments (name, description) VALUES ($1,$2) RETURNING *',
      [name, description || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/departments/:id — admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM departments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Department deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
