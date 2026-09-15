const { pool } = require('../config/db');


// GET current fee
const getPlatformFee = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM platform_settings WHERE setting_key = 'seller_registration_fee' LIMIT 1"
    );
    if (!rows.length) return res.json({ fee: 499 }); // default
    return res.json({ fee: parseFloat(rows[0].setting_value) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch fee" });
  }
};

// UPDATE fee (admin only)
const updatePlatformFee = async (req, res) => {
  const { fee } = req.body;
  if (!fee || isNaN(fee) || fee < 0) {
    return res.status(400).json({ message: "Valid fee amount required" });
  }
  try {
    await pool.execute(
      `INSERT INTO platform_settings (setting_key, setting_value)
       VALUES ('seller_registration_fee', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [String(fee), String(fee)]
    );
    return res.json({ message: "Platform fee updated successfully", fee: parseFloat(fee) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update fee" });
  }
};

module.exports = { getPlatformFee, updatePlatformFee };