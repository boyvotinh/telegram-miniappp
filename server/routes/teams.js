const express = require('express');
const router = express.Router();
const db = require('../db');

// Tạo nhóm mới
router.post('/create', async (req, res) => {
  const { name, created_by } = req.body;
  try {
    const [result] = await db.query('INSERT INTO teams (name, created_by) VALUES (?, ?)', [name, created_by]);
    const teamId = result.insertId;
    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [teamId, created_by, 'admin']);
    res.status(201).json({ message: 'Đã tạo nhóm', teamId });
  } catch (error) {
    console.error('Lỗi khi tạo nhóm:', error);
    res.status(500).json({ error: 'Lỗi khi tạo nhóm' });
  }
});

// Thêm thành viên vào nhóm
router.post('/add-member', async (req, res) => {
  const { team_id, user_id, role } = req.body;
  try {
    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [team_id, user_id, role || 'member']);
    res.status(201).json({ message: 'Đã thêm thành viên' });
  } catch (error) {
    console.error('Lỗi khi thêm thành viên:', error);
    res.status(500).json({ error: 'Lỗi khi thêm thành viên' });
  }
});

// Lấy danh sách thành viên trong nhóm
router.get('/:teamId/members', async (req, res) => {
  const { teamId } = req.params;
  try {
    const [members] = await db.query(`
      SELECT u.id, u.name, tm.role 
      FROM users u 
      JOIN team_members tm ON u.id = tm.user_id 
      WHERE tm.team_id = ?
    `, [teamId]);
    res.json(members);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thành viên:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thành viên' });
  }
});

// Lấy danh sách các nhóm mà một user tham gia
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [teams] = await db.query(`
      SELECT t.id, t.name 
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ?
    `, [userId]);
    res.json(teams);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách nhóm' });
  }
});

// API để lấy thông tin chi tiết của một nhóm
router.get('/:teamId', async (req, res) => {
  const { teamId } = req.params;
  try {
    const [team] = await db.query('SELECT * FROM teams WHERE id = ?', [teamId]);
    if (team.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }
    res.json(team[0]);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhóm:', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin nhóm' });
  }
});

module.exports = router;