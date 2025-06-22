const express = require('express');
const router = express.Router();
const db = require('../db');

// Lấy tất cả user
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy user theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Không tìm thấy user' });
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy user bằng telegram_id
router.get('/telegram/:telegramId', async (req, res) => {
  const { telegramId } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Không tìm thấy user' });
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo user mới
router.post('/', async (req, res) => {
  const { name, telegram_id } = req.body;
  try {
    const [result] = await db.query('INSERT INTO users (name, telegram_id) VALUES (?, ?)', [name, telegram_id]);
    res.status(201).json({ id: result.insertId, name, telegram_id });
  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, telegram_id } = req.body;
  try {
    const [result] = await db.query('UPDATE users SET name = ?, telegram_id = ? WHERE id = ?', [name, telegram_id, id]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Cập nhật user thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy user' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xoá user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Xoá user thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy user' });
    }
  } catch (error) {
    console.error('Lỗi khi xoá user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy danh sách user trong một nhóm
router.get('/team/:teamId', async (req, res) => {
  const { teamId } = req.params;
  try {
    const query = `
      SELECT u.id, u.name, u.telegram_id 
      FROM users u
      JOIN team_members tm ON u.id = tm.user_id
      WHERE tm.team_id = ?
    `;
    const [results] = await db.query(query, [teamId]);
    res.json(results);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách user trong nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
