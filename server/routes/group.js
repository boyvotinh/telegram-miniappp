const express = require('express');
const router = express.Router();
const db = require('../db');

// API để rời nhóm
router.post('/leave-group', async (req, res) => {
  const userId = req.user.id; // Giả sử đã có middleware xác thực người dùng

  try {
    // Kiểm tra xem người dùng có phải là admin không
    const [adminCheck] = await db.query(
      `SELECT t.created_by 
       FROM teams t 
       JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = ?`,
      [userId]
    );

    if (adminCheck && adminCheck.created_by === userId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn là admin của nhóm, không thể rời nhóm. Vui lòng chuyển quyền admin cho người khác trước.'
      });
    }

    // Xóa thành viên khỏi team_members
    await db.query(
      'DELETE FROM team_members WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Đã rời nhóm thành công'
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi rời nhóm'
    });
  }
});

module.exports = router; 