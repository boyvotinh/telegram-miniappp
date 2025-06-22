const express = require('express');
const router = express.Router();
const db = require('../db');

// Thêm người dùng mới
router.post('/', async (req, res) => {
  const { telegram_id, name, avatar_url } = req.body;
  if (!telegram_id || !name) {
    return res.status(400).json({ error: "Thiếu telegram_id hoặc name" });
  }
  const sql = `INSERT INTO users (telegram_id, name, avatar_url) VALUES (?, ?, ?)`;
  try {
    const [result] = await db.query(sql, [telegram_id, name, avatar_url]);
    res.status(200).json({ message: "User đã được thêm", userId: result.insertId });
  } catch (error) {
    console.error("Lỗi thêm user:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// Lấy danh sách tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.status(200).json(results);
  } catch (err) {
    console.error("Lỗi lấy danh sách users:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// xem nv
router.get('/me', async (req, res) => {
  const { telegram_id } = req.query;
  if (!telegram_id) {
    return res.status(400).json({ error: 'Thiếu telegram_id' });
  }
  const sql = `SELECT * FROM users WHERE telegram_id = ? LIMIT 1`;
  try {
    const [results] = await db.query(sql, [telegram_id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error("Lỗi truy vấn user:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// API để rời nhóm
router.delete('/leave-group', async (req, res) => {
  const { groupId, telegram_id } = req.body;
  if (!groupId || !telegram_id) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin groupId hoặc telegram_id' });
  }

  try {
    // Lấy user_id từ telegram_id
    const [users] = await db.query('SELECT id FROM users WHERE telegram_id = ?', [telegram_id]);
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    const userId = users[0].id;

    // Kiểm tra xem người dùng có trong nhóm không
    const [members] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [groupId, userId]);
    if (!members || members.length === 0) {
      return res.status(404).json({ success: false, message: 'Bạn không phải là thành viên của nhóm này' });
    }

    // Kiểm tra xem người dùng có phải là admin không
    const [admins] = await db.query(`SELECT t.created_by FROM teams t JOIN team_members tm ON t.id = tm.team_id WHERE tm.team_id = ? AND tm.user_id = ?`, [groupId, userId]);
    if (admins && admins.length > 0 && admins[0].created_by === userId) {
      return res.status(400).json({ success: false, message: 'Bạn là admin của nhóm, không thể rời nhóm. Vui lòng chuyển quyền admin cho người khác trước.' });
    }

    // Xóa tất cả task của người dùng trong nhóm
    const [taskResult] = await db.query('DELETE FROM tasks WHERE team_id = ? AND assigned_to = ?', [groupId, userId]);

    // Xóa thành viên khỏi team_members
    await db.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [groupId, userId]);

    res.json({ success: true, message: 'Đã rời nhóm thành công', deletedTasks: taskResult.affectedRows });

  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi rời nhóm' });
  }
});

module.exports = router;
