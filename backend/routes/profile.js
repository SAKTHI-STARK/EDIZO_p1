const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { pool } = require('../db');

// GET /api/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name AS fullName, email, phone, door_number AS doorNumber, building_name AS buildingName,
              street, city, state, pincode, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
