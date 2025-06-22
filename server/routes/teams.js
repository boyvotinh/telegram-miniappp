const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Thêm nhóm mới và tự động thêm người tạo vào nhóm
router.post('/create', async (req, res) => {
  const { name, created_by } = req.body;
  try {
    const [result] = await db.query('INSERT INTO teams (name, created_by) VALUES (?, ?)', [name, created_by]);
    const teamId = result.insertId;
    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [teamId, created_by, 'admin']);
    res.status(201).json({ message: 'Nhóm đã được tạo và người tạo đã được thêm vào nhóm', teamId });
  } catch (err) {
    console.error('Lỗi tạo nhóm:', err);
    res.status(500).json({ error: 'Lỗi khi tạo nhóm' });
  }
});

// ✅ Mời user vào nhóm
router.post('/invite', async (req, res) => {
  const { team_id, telegram_id } = req.body;
  try {
    const [users] = await db.query('SELECT id FROM users WHERE telegram_id = ?', [telegram_id]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Không tìm thấy người dùng với ID Telegram này' });
    }
    const user_id = users[0].id;

    const [members] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [team_id, user_id]);
    if (members.length > 0) {
      return res.status(400).json({ message: 'Người dùng đã có trong nhóm' });
    }

    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [team_id, user_id, 'user']);
    res.status(200).json({ message: 'Đã thêm user vào nhóm' });
  } catch (err) {
    console.error('Lỗi khi thêm user vào nhóm:', err);
    res.status(500).json({ error: 'Không thể thêm user vào nhóm' });
  }
});

// Lấy danh sách thành viên của một nhóm
router.get('/:id/members', async (req, res) => {
  const teamId = req.params.id;
  const sql = `
    SELECT u.id, u.name, u.telegram_id, u.avatar_url
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = ?
  `;
  try {
    const [results] = await db.query(sql, [teamId]);
    res.status(200).json({ teamId, members: results });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách thành viên:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách thành viên' });
  }
});

// Lấy danh sách nhóm mà user đang tham gia
router.get('/by-user/:userId', async (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT teams.*, team_members.role 
    FROM teams
    JOIN team_members ON teams.id = team_members.team_id
    WHERE team_members.user_id = ?
  `;
  try {
    const [results] = await db.query(sql, [userId]);
    res.status(200).json(results);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách nhóm của user:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách nhóm của user' });
  }
});

// Lấy nhiệm vụ của một thành viên trong nhóm
router.get('/by-member/:team_id/:user_id', async (req, res) => {
  const { team_id, user_id } = req.params;
  const sql = `
    SELECT t.*, tm.role as user_role
    FROM tasks t
    JOIN team_members tm ON t.team_id = tm.team_id AND t.assigned_to = tm.user_id
    WHERE t.team_id = ? AND t.assigned_to = ? AND tm.team_id = ?
  `;
  try {
    const [results] = await db.query(sql, [team_id, user_id, team_id]);
    res.status(200).json(results);
  } catch (err) {
    console.error('Lỗi khi lấy nhiệm vụ:', err);
    res.status(500).json({ error: 'Lỗi lấy nhiệm vụ' });
  }
});

// xóa thành viên nhóm
router.delete('/remove-member', async (req, res) => {
  const { team_id, user_id } = req.body;
  try {
    // Xóa tất cả task của thành viên trong nhóm
    const [taskResult] = await db.query('DELETE FROM tasks WHERE team_id = ? AND assigned_to = ?', [team_id, user_id]);
    
    // Xóa thành viên khỏi team_members
    const [result] = await db.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [team_id, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thành viên trong nhóm' });
    }
    
    res.status(200).json({ 
      message: 'Đã xóa thành viên khỏi nhóm',
      deletedTasks: taskResult.affectedRows
    });
  } catch (err) {
    console.error('Lỗi khi xóa thành viên khỏi nhóm:', err);
    res.status(500).json({ error: 'Lỗi khi xóa thành viên' });
  }
});

module.exports = router;