const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
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

    // Check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      `INSERT INTO users 
        (fullName, email, phone, password, doorNumber, buildingName, street, city, state, pincode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        phone,
        hashedPassword,
        doorNumber,
        buildingName,
        street,
        city,
        state,
        pincode,
      ]
    );

    const userId = result.insertId;

    // Fetch inserted user (without password)
    const [rows] = await db.query(
      `SELECT id, fullName, email, phone, doorNumber, buildingName, street, city, state, pincode 
       FROM users WHERE id = ?`,
      [userId]
    );

    const user = rows[0];

    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    // Remove password before sending user object
    delete user.password;

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 PASSWORD RESET TOKEN GENERATION
const generateResetToken = () => {
  return Math.random().toString(36).substr(2, 9); // You could enhance this to make it more secure
};

// 🔹 FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // Step 1: Check if the email exists in the database
  const [user] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  
  if (user.length === 0) {
    // If the email does not exist, send a failure response
    return res.status(404).json({ success: false, message: 'Email not found' });
  }

  // Step 2: Generate a reset token if the email exists
  const resetToken = generateResetToken();

  // Step 3: Save reset token in the database with an expiration time (e.g., 1 hour)
  const expiration = new Date(Date.now() + 60 * 60 * 1000); // Token expires in 1 hour

  await db.query("UPDATE users SET resetToken = ?, resetTokenExpiration = ? WHERE email = ?", [
    resetToken,
    expiration,
    email
  ]);
  
  console.log(`Generated reset token for ${email}: ${resetToken}`);
  
  // Step 4: Send success response (typically you'd send an email with the token)
  return res.json({
    success: true,
    message: 'Password reset token generated',
    resetToken, // You might not want to send the token in production, only for testing
  });
});

// 🔹 RESET PASSWORD (to handle token and password update)
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  // Check if token exists and is valid
  const [user] = await db.query("SELECT * FROM users WHERE email = ? AND resetToken = ? AND resetTokenExpiration > ?", [email, token, new Date()]);
  
  if (user.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password and clear reset token fields
  await db.query("UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiration = NULL WHERE email = ?", [
    hashedPassword,
    email,
  ]);

  res.json({ success: true, message: 'Password successfully reset' });
});

module.exports = router;
