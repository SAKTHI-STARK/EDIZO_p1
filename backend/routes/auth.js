const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    console.log("Incoming /register payload raw:", req.body);

    const {
      name,       // some clients send "name"
      fullName,   // some clients send "fullName"
      email,
      phone,
      password,
      doorNumber,
      buildingName,
      street,
      city,
      state,
      pincode,
    } = req.body;

    // Accept either "name" or "fullName"
    const finalFullName = fullName || name;

    // Debugging log
    console.log("Parsed fields:", {
      fullName: finalFullName,
      email, phone, password,
      doorNumber, buildingName, street,
      city, state, pincode
    });

    if (
      !finalFullName ||
      !email ||
      !password ||
      !doorNumber ||
      !street ||
      !city ||
      !state ||
      !pincode
    ) {
      console.log("❌ Missing required fields");
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log("❌ Email already registered:", email);
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (fullName, email, phone, password, doorNumber, buildingName, street, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalFullName, email, phone || null, passwordHash, doorNumber, buildingName || null, street, city, state, pincode]
    );

    console.log("✅ Insert success:", result.insertId);

    const user = { id: result.insertId, fullName: finalFullName, email };
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "testsecret", { expiresIn: '7d' });

    return res.json({ success: true, token, user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      console.log("❌ No user found:", email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userRow = rows[0];
    console.log("✅ Found user row:", userRow);

    const valid = await bcrypt.compare(password, userRow.password);
    console.log("👉 bcrypt result:", valid);

    if (!valid) {
      console.log("❌ Wrong password for:", email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // ✅ Successful login
    const user = { id: userRow.id, fullName: userRow.fullName, email: userRow.email };
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "testsecret",
      { expiresIn: '7d' }
    );

    console.log("✅ Login success for:", email);
    return res.json({ success: true, token, user });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
