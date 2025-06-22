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

// API nộp bài
router.post('/submit', upload.single('file'), async (req, res) => {
  const { task_id, user_id } = req.body;
  const file_path = req.file ? req.file.path : null;

  if (!file_path) {
    return res.status(400).json({ error: 'Chưa có file đính kèm' });
  }

  const sql = 'INSERT INTO submissions (task_id, user_id, file_path) VALUES (?, ?, ?)';
  try {
    await db.query(sql, [task_id, user_id, file_path]);
    res.status(200).json({ message: 'Đã nộp nhiệm vụ thành công!' });
  } catch (err) {
    console.error('Lỗi nộp bài:', err);
    res.status(500).json({ error: 'Lỗi khi lưu bài nộp' });
  }
});

module.exports = router;
