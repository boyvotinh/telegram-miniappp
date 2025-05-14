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
// xem nv
router.get('/me', (req, res) => {
  const telegram_id = req.query.telegram_id;

  if (!telegram_id) {
    return res.status(400).json({ error: 'Thiếu telegram_id' });
  }

  const sql = `SELECT * FROM users WHERE telegram_id = ? LIMIT 1`;

  db.query(sql, [telegram_id], (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn user:", err);
      return res.status(500).json({ error: "Lỗi máy chủ" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.status(200).json(results[0]);
  });
});

// API để rời nhóm
router.post('/leave-group', async (req, res) => {
  const userId = req.user.id; // Giả sử đã có middleware xác thực người dùng

  try {
    // Kiểm tra xem người dùng có phải là admin không
    const [adminCheck] = await db.query(
      `SELECT t.created_by 
       FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = ?`,
      [userId]
    );

    if (adminCheck && adminCheck.created_by === userId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn là admin của nhóm, không thể rời nhóm. Vui lòng chuyển quyền admin cho người khác trước.'
      });
    }

    // Xóa thành viên khỏi team_members
    await db.query(
      'DELETE FROM team_members WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Đã rời nhóm thành công'
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi rời nhóm'
    });
  }
});

module.exports = router;
