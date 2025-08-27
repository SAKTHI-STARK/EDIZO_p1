const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

// POST /api/bookings - create new booking
router.post('/bookings', auth, async (req, res) => {
  try {
    const { service, date, timeSlot, notes } = req.body;
    if (!service || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'service, date, and timeSlot are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO bookings (user_id, service, date, time_slot, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, service, date, timeSlot, notes || null]
    );

    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    return res.json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/bookings - list bookings for current user
router.get('/bookings', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, service, date, time_slot AS timeSlot, notes, created_at
       FROM bookings WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error('Get bookings error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
