const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { title, description, status, deadline, assigned_to, team_id, created_by } = req.body;

  // B1: Kiểm tra người tạo có phải admin trong nhóm không
  const checkRoleSql = 'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(checkRoleSql, [team_id, created_by], (err, roleResults) => {
    if (err) {
      console.error('Lỗi kiểm tra quyền:', err);
      return res.status(500).json({ error: 'Lỗi kiểm tra quyền' });
    }

    if (roleResults.length === 0 || roleResults[0].role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được phép tạo nhiệm vụ' });
    }

    // B2: Kiểm tra người được giao có trong nhóm không
    const checkAssignedSql = 'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?';
    db.query(checkAssignedSql, [team_id, assigned_to], (err2, assignedResults) => {
      if (err2) {
        console.error('Lỗi kiểm tra thành viên:', err2);
        return res.status(500).json({ error: 'Lỗi kiểm tra thành viên' });
      }

      if (assignedResults.length === 0) {
        return res.status(400).json({ message: 'Người được giao không thuộc nhóm này' });
      }

      // B3: Tạo nhiệm vụ
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
  });
});
// Cập nhật nhiệm vụ
router.put('/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, deadline, assigned_to, team_id, updated_by } = req.body;

  // 1. Kiểm tra quyền admin
  const checkAdminSql = 'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(checkAdminSql, [team_id, updated_by], (err, roleResults) => {
    if (err || roleResults.length === 0 || roleResults[0].role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền cập nhật nhiệm vụ' });
    }

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
});
// Xoá nhiệm vụ
router.delete('/:id', (req, res) => {
  const taskId = req.params.id;
  const { team_id, deleted_by } = req.body;

  // 1. Kiểm tra quyền admin
  const checkAdminSql = 'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(checkAdminSql, [team_id, deleted_by], (err, roleResults) => {
    if (err || roleResults.length === 0 || roleResults[0].role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền xoá nhiệm vụ' });
    }

    // 2. Xoá nhiệm vụ
    const deleteSql = 'DELETE FROM tasks WHERE id = ?';
    db.query(deleteSql, [taskId], (err2, result) => {
      if (err2) {
        return res.status(500).json({ error: 'Lỗi khi xoá nhiệm vụ' });
      }

      res.json({ message: 'Nhiệm vụ đã được xoá' });
    });
  });
});
// Lọc nhiệm vụ (chỉ cho admin)
router.get('/filter', (req, res) => {
  const { team_id, requested_by, status, assigned_to, deadline_from, deadline_to } = req.query;

  // 1. Kiểm tra quyền admin
  const checkAdminSql = 'SELECT role FROM team_members WHERE team_id = ? AND user_id = ?';
  db.query(checkAdminSql, [team_id, requested_by], (err, roleResults) => {
    if (err || roleResults.length === 0 || roleResults[0].role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới được phép xem nhiệm vụ nhóm' });
    }

    // 2. Tạo truy vấn lọc động
    let filterSql = 'SELECT * FROM tasks WHERE team_id = ?';
    const values = [team_id];

    if (status) {
      filterSql += ' AND status = ?';
      values.push(status);
    }

    if (assigned_to) {
      filterSql += ' AND assigned_to = ?';
      values.push(assigned_to);
    }

    if (deadline_from) {
      filterSql += ' AND deadline >= ?';
      values.push(deadline_from);
    }

    if (deadline_to) {
      filterSql += ' AND deadline <= ?';
      values.push(deadline_to);
    }

    // 3. Thực thi truy vấn
    db.query(filterSql, values, (err2, results) => {
      if (err2) {
        return res.status(500).json({ error: 'Lỗi khi lọc nhiệm vụ' });
      }

      res.json({ tasks: results });
    });
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

module.exports = router;