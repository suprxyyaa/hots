const router = require('express').Router();
const pool   = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/analytics — DaaS analytics endpoint
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Tokens per department today
    const byDept = await pool.query(
      `SELECT dep.name, COUNT(t.id) AS total,
              COUNT(t.id) FILTER (WHERE t.status = 'completed')  AS completed,
              COUNT(t.id) FILTER (WHERE t.status = 'waiting')    AS waiting,
              COUNT(t.id) FILTER (WHERE t.status = 'cancelled')  AS cancelled
       FROM   tokens t
       JOIN   departments dep ON t.department_id = dep.id
       WHERE  t.date = $1
       GROUP  BY dep.id, dep.name
       ORDER  BY total DESC`,
      [today]
    );

    // 2. Busiest doctors today
    const byDoctor = await pool.query(
      `SELECT d.name AS doctor_name, d.specialization,
              COUNT(t.id) AS total_tokens,
              COUNT(t.id) FILTER (WHERE t.status = 'completed') AS completed
       FROM   tokens t
       JOIN   doctors d ON t.doctor_id = d.id
       WHERE  t.date = $1
       GROUP  BY d.id, d.name, d.specialization
       ORDER  BY total_tokens DESC
       LIMIT  5`,
      [today]
    );

    // 3. Overall today summary
    const summary = await pool.query(
      `SELECT
         COUNT(*)                                             AS total_today,
         COUNT(*) FILTER (WHERE status = 'completed')        AS completed,
         COUNT(*) FILTER (WHERE status = 'waiting')          AS waiting,
         COUNT(*) FILTER (WHERE status = 'in-progress')      AS in_progress,
         COUNT(*) FILTER (WHERE status = 'cancelled')        AS cancelled
       FROM tokens WHERE date = $1`,
      [today]
    );

    // 4. Last 7 days trend
    const trend = await pool.query(
      `SELECT date, COUNT(*) AS total
       FROM   tokens
       WHERE  date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP  BY date
       ORDER  BY date`
    );

    res.json({
      date:            today,
      summary:         summary.rows[0],
      by_department:   byDept.rows,
      busiest_doctors: byDoctor.rows,
      weekly_trend:    trend.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
