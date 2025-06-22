const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // thư mục lưu file
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// API để nộp bài
router.post('/', async (req, res) => {
  const { task_id, user_id, submission_text, submission_file } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO submissions (task_id, user_id, submission_text, submission_file) VALUES (?, ?, ?, ?)',
      [task_id, user_id, submission_text, submission_file]
    );

    // Cập nhật trạng thái task thành 'submitted'
    await db.query('UPDATE tasks SET status = ? WHERE id = ?', ['submitted', task_id]);

    res.status(201).json({ message: 'Đã nộp bài', submissionId: result.insertId });
  } catch (error) {
    console.error('Lỗi khi nộp bài:', error);
    res.status(500).json({ error: 'Lỗi khi nộp bài' });
  }
});

module.exports = router;
