const express = require('express');
const router = express.Router();
const db = require('../db');

// Thêm người dùng mới
router.post('/', (req, res) => {
  const { telegram_id, name, avatar_url } = req.body;

  if (!telegram_id || !name) {
    return res.status(400).json({ error: "Thiếu telegram_id hoặc name" });
  }

  const sql = `INSERT INTO users (telegram_id, name, avatar_url) VALUES (?, ?, ?)`;

  db.query(sql, [telegram_id, name, avatar_url], (err, result) => {
    if (err) {
      console.error("Lỗi thêm user:", err);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }

    res.status(200).json({ message: "User đã được thêm", userId: result.insertId });
  });
});
// Lấy danh sách tất cả người dùng
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error("Lỗi lấy danh sách users:", err);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
