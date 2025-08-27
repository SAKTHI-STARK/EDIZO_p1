const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// GET profile
router.get("/profile", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE profile
router.put("/profile", auth, async (req, res) => {
  const { name, phone, doorNumber, buildingName, street, city, state, pincode } = req.body;

  try {
    await db.query(
      `UPDATE users 
       SET fullName=?, phone=?, doorNumber=?, buildingName=?, street=?, city=?, state=?, pincode=? 
       WHERE id=?`,
      [name, phone, doorNumber, buildingName, street, city, state, pincode, req.user.id]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
