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
router.delete('/leave-group', (req, res) => {
  console.log('Request body:', req.body);
  const { groupId, telegram_id } = req.body;

  if (!groupId || !telegram_id) {
    console.log('Missing data:', { groupId, telegram_id });
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin groupId hoặc telegram_id'
    });
  }

  // Lấy user_id từ telegram_id
  db.query('SELECT id FROM users WHERE telegram_id = ?', [telegram_id], (err, users) => {
    if (err) {
      console.error('Error finding user:', err);
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi tìm kiếm người dùng'
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const userId = users[0].id;
    console.log('User ID:', userId);

    // Kiểm tra xem người dùng có trong nhóm không
    db.query(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [groupId, userId],
      (err, members) => {
        if (err) {
          console.error('Error checking membership:', err);
          return res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi kiểm tra thành viên'
          });
        }

        if (!members || members.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Bạn không phải là thành viên của nhóm này'
          });
        }

        // Kiểm tra xem người dùng có phải là admin không
        db.query(
          `SELECT t.created_by 
           FROM teams t 
           JOIN team_members tm ON t.id = tm.team_id 
           WHERE tm.team_id = ? AND tm.user_id = ?`,
          [groupId, userId],
          (err, admins) => {
            if (err) {
              console.error('Error checking admin:', err);
              return res.status(500).json({
                success: false,
                message: 'Có lỗi xảy ra khi kiểm tra quyền admin'
              });
            }

            if (admins && admins.length > 0 && admins[0].created_by === userId) {
              return res.status(400).json({
                success: false,
                message: 'Bạn là admin của nhóm, không thể rời nhóm. Vui lòng chuyển quyền admin cho người khác trước.'
              });
            }

            // Xóa thành viên khỏi team_members
            db.query(
              'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
              [groupId, userId],
              (err, result) => {
                if (err) {
                  console.error('Error removing member:', err);
                  return res.status(500).json({
                    success: false,
                    message: 'Có lỗi xảy ra khi xóa thành viên'
                  });
                }

                res.json({
                  success: true,
                  message: 'Đã rời nhóm thành công'
                });
              }
            );
          }
        );
      }
    );
  });
});

module.exports = router;
