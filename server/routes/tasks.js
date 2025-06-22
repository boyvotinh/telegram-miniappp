const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/assign', async (req, res) => {
  const { title, description, deadline, assigned_to, team_id } = req.body;
  
  try {
    // Tạo nhiệm vụ mới
    const [result] = await db.query(
      'INSERT INTO tasks (title, description, deadline, assigned_to, team_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, deadline, assigned_to, team_id]
    );

    // Lấy thông tin user được giao nhiệm vụ
    const [users] = await db.query(
      'SELECT telegram_id FROM users WHERE id = ?',
      [assigned_to]
    );

    // Gửi thông báo cho user
    /* if (users.length > 0 && users[0].telegram_id) {
      const task = {
        title,
        description,
        deadline
      };
      await sendTaskNotification(users[0].telegram_id, task);
    } */

    res.status(201).json({ message: 'Đã tạo nhiệm vụ', taskId: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo nhiệm vụ:', error);
    res.status(500).json({ error: 'Lỗi khi tạo nhiệm vụ' });
  }
});

// Cập nhật nhiệm vụ
router.put('/update/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, deadline, assigned_to } = req.body;
  try {
    const updateSql = `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, deadline = ?, assigned_to = ?
      WHERE id = ?
    `;
    await db.query(updateSql, [title, description, status, deadline, assigned_to, taskId]);
    res.json({ message: 'Nhiệm vụ đã được cập nhật' });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhiệm vụ:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật nhiệm vụ' });
  }
});

// Xoá nhiệm vụ
router.delete('/delete/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const deleteSql = 'DELETE FROM tasks WHERE id = ?';
    await db.query(deleteSql, [taskId]);
    res.json({ message: 'Nhiệm vụ đã được xoá' });
  } catch (error) {
    console.error('Lỗi khi xoá nhiệm vụ:', error);
    res.status(500).json({ error: 'Lỗi khi xoá nhiệm vụ' });
  }
});

router.get('/my-tasks', async (req, res) => {
  const { team_id, user_id, status, deadline_from, deadline_to } = req.query;
  try {
    // 1. Kiểm tra xem user có thuộc nhóm không
    const checkMemberSql = 'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?';
    const [results] = await db.query(checkMemberSql, [team_id, user_id]);
    if (results.length === 0) {
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

    const [taskResults] = await db.query(taskSql, values);
    res.json({ tasks: taskResults });
  } catch (error) {
    console.error('Lỗi khi lấy nhiệm vụ:', error);
    res.status(500).json({ error: 'Lỗi khi lấy nhiệm vụ' });
  }
});

// xem nhiệm vụ
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { team_id } = req.query;

  try {
    let query = `
      SELECT tasks.*, teams.name AS groupName
      FROM tasks
      LEFT JOIN teams ON tasks.team_id = teams.id
      WHERE assigned_to = ?
    `;
    const params = [userId];

    // Nếu có team_id, chỉ lấy nhiệm vụ của nhóm đó
    if (team_id) {
      query += ' AND tasks.team_id = ?';
      params.push(team_id);
    }

    const [results] = await db.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Lỗi khi lấy nhiệm vụ của user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;