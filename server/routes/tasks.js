const express = require('express');
const router = express.Router();
const db = require('../db');
router.post('/assign', (req, res) => {
  const { title, description, deadline, assigned_to, team_id } = req.body;
      const insertSql = `
        INSERT INTO tasks (title, description, deadline, assigned_to, team_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertSql, [title, description, deadline, assigned_to, team_id], (err3, result) => {
        if (err3) {
          console.error('Lỗi tạo nhiệm vụ:', err3);
          return res.status(500).json({ error: 'Lỗi khi tạo nhiệm vụ' });
        }

        res.status(201).json({ message: 'Đã tạo nhiệm vụ', taskId: result.insertId });
      });
    });
// Cập nhật nhiệm vụ
router.put('/update/:taskId', (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, deadline, assigned_to } = req.body;
    // 2. Cập nhật nhiệm vụ
    const updateSql = `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, deadline = ?, assigned_to = ?
      WHERE id = ?
    `;
    db.query(updateSql, [title, description, status, deadline, assigned_to, taskId], (err2, result) => {
      if (err2) {
        return res.status(500).json({ error: 'Lỗi khi cập nhật nhiệm vụ' });
      }

      res.json({ message: 'Nhiệm vụ đã được cập nhật' });
    });
  });

// Xoá nhiệm vụ
router.delete('/delete/:taskId', (req, res) => {
  const taskId = req.params.taskId;  // Sửa lại dòng này

  const deleteSql = 'DELETE FROM tasks WHERE id = ?';
  db.query(deleteSql, [taskId], (err2, result) => {
    if (err2) {
      return res.status(500).json({ error: 'Lỗi khi xoá nhiệm vụ' });
    }
    res.json({ message: 'Nhiệm vụ đã được xoá' });
  });
});


router.get('/my-tasks', (req, res) => {
  const { team_id, user_id, status, deadline_from, deadline_to } = req.query;

  // 1. Kiểm tra xem user có thuộc nhóm không
  const checkMemberSql = 'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(checkMemberSql, [team_id, user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ message: 'Bạn không thuộc nhóm này' });
    }

    // 2. Tạo truy vấn để lấy nhiệm vụ của chính user
    let taskSql = 'SELECT * FROM tasks WHERE team_id = ? AND assigned_to = ?';
    const values = [team_id, user_id];

    if (status) {
      taskSql += ' AND status = ?';
      values.push(status);
    }

    if (deadline_from) {
      taskSql += ' AND deadline >= ?';
      values.push(deadline_from);
    }

    if (deadline_to) {
      taskSql += ' AND deadline <= ?';
      values.push(deadline_to);
    }

    db.query(taskSql, values, (err2, taskResults) => {
      if (err2) {
        return res.status(500).json({ error: 'Lỗi khi lấy nhiệm vụ' });
      }

      res.json({ tasks: taskResults });
    });
  });
});
// xem nhiệm vụ
router.get('/user/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT tasks.*, teams.name AS groupName
    FROM tasks
    LEFT JOIN teams ON tasks.team_id = teams.id
    WHERE assigned_to = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy nhiệm vụ của user:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }

    res.json(results);
  });
});


module.exports = router;