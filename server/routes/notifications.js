const express = require('express');
const router = express.Router();
const db = require('../db');
router.post('/', (req, res) => {
  const { task_id, user_id, message } = req.body;
  const sql = `
    INSERT INTO notifications (task_id, user_id, message)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [task_id, user_id, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notification created', notificationId: result.insertId });
  });
});

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT n.*, t.title AS task_title
    FROM notifications n
    LEFT JOIN tasks t ON n.task_id = t.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
