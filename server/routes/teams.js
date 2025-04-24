const express = require('express');
const router = express.Router();
const db = require('../db');
// ✅ Thêm nhóm mới và tự động thêm người tạo vào nhóm
router.post('/create', (req, res) => {
  const { name, created_by } = req.body;
  const sql = 'INSERT INTO teams (name, created_by) VALUES (?, ?)';
  db.query(sql, [name, created_by], (err, result) => {
    if (err) {
      console.error('Lỗi tạo nhóm:', err);
      return res.status(500).json({ error: 'Lỗi khi tạo nhóm' });
    }
    const teamId = result.insertId;
    // ✅ Thêm người tạo vào team_members
    const addCreatorSql = 'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)';
    db.query(addCreatorSql, [teamId, created_by, 'admin'], (err2) => {
      if (err2) {
        console.error('Lỗi thêm người tạo vào nhóm:', err2);
        return res.status(500).json({ error: 'Tạo nhóm nhưng không thể thêm người tạo vào nhóm' });
      }
      res.status(201).json({ message: 'Nhóm đã được tạo và người tạo đã được thêm vào nhóm', teamId });
    });
  });
});
// ✅ Mời user vào nhóm
router.post('/invite', (req, res) => {
  const { team_id, user_id } = req.body;
  const checkSql = 'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(checkSql, [team_id, user_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi khi kiểm tra thành viên nhóm' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'Người dùng đã có trong nhóm' });
    }

    const inviteSql = 'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)';
  db.query(inviteSql, [team_id, user_id, 'user'], (err2) => {
      if (err2) {
        console.error('Lỗi khi thêm user vào nhóm:', err2);
        return res.status(500).json({ error: 'Không thể thêm user vào nhóm' });
      }

      res.status(200).json({ message: 'Đã thêm user vào nhóm' });
    });
  });
});
// ✅ Lấy danh sách nhóm
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM teams';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi lấy nhóm:', err);
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách nhóm' });
    }
    res.status(200).json(results);
  });
});
// ✅ Lấy danh sách thành viên của một nhóm
router.get('/:id/members', (req, res) => {
  const teamId = req.params.id;
  const sql = `
    SELECT u.id, u.name, u.telegram_id, u.avatar_url
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ?
  `;

  db.query(sql, [teamId], (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách thành viên:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách thành viên' });
    }

    res.status(200).json({ teamId, members: results });
  });
});
// Lấy danh sách nhóm mà user đang tham gia
router.get('/by-user/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT teams.*, team_members.role 
    FROM teams
    JOIN team_members ON teams.id = team_members.team_id
    WHERE team_members.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách nhóm của user:', err);
      return res.status(500).json({ error: 'Không thể lấy danh sách nhóm của user' });
    }

    res.status(200).json(results);
  });
});

// xóa thành viên nhóm
router.delete('/remove-member', (req, res) => {
  const { team_id, user_id } = req.body;

  const sql = 'DELETE FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(sql, [team_id, user_id], (err, result) => {
    if (err) {
      console.error('Lỗi khi xóa thành viên khỏi nhóm:', err);
      return res.status(500).json({ error: 'Lỗi khi xóa thành viên' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên trong nhóm' });
    }

    res.status(200).json({ message: 'Đã xóa thành viên khỏi nhóm' });
  });
});

module.exports = router;