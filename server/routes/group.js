const express = require('express');
const router = express.Router();
const db = require('../db');

// API để tham gia nhóm
router.post('/join', async (req, res) => {
  const { team_id, user_id } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [team_id, user_id]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User đã ở trong nhóm này rồi' });
    }

    await db.query('INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)', [team_id, user_id, 'member']);
    res.status(200).json({ message: 'Đã tham gia nhóm thành công' });
  } catch (error) {
    console.error('Lỗi khi tham gia nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API để rời nhóm
router.post('/leave', async (req, res) => {
  const { team_id, user_id } = req.body;
  try {
    // Không cho admin rời nhóm? (Cân nhắc logic này)
    // Tạm thời cho phép rời nhóm
    await db.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [team_id, user_id]);
    res.status(200).json({ message: 'Đã rời nhóm thành công' });
  } catch (error) {
    console.error('Lỗi khi rời nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router; 