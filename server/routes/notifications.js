const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const db = require('../db');
const { bot } = require('../bot');

// Hàm gửi thông báo cho user
async function sendTaskNotification(userId, task) {
  try {
    const message = `
🔔 *Nhắc nhở nhiệm vụ sắp đến hạn*

📋 *${task.title}*
📝 ${task.description}
⏰ Hạn chót: ${new Date(task.deadline).toLocaleString('vi-VN')}
    `;

    await bot.sendMessage(userId, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    
    console.log(`Đã gửi thông báo nhiệm vụ cho user ${userId}`);
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
  }
}

// Hàm gửi thông báo tổng hợp nhiệm vụ trong ngày
async function sendDailyTaskSummary(userId, tasks) {
  try {
    let message = `📅 *Tổng hợp nhiệm vụ ngày ${new Date().toLocaleDateString('vi-VN')}*\n\n`;

    // Nhóm nhiệm vụ theo trạng thái
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    // Thêm nhiệm vụ đang thực hiện
    if (pendingTasks.length > 0) {
      message += `⏳ *Nhiệm vụ đang thực hiện:*\n\n`;
      pendingTasks.forEach((task, index) => {
        const deadline = new Date(task.deadline);
        const isOverdue = deadline < new Date();
        
        message += `*${index + 1}. ${task.title}*\n`;
        message += `- Mô tả: ${task.description || 'Không có mô tả'}\n`;
        message += `- Hạn chót: ${deadline.toLocaleString('vi-VN')} ${isOverdue ? '⚠️ (Đã qua hạn)' : ''}\n\n`;
      });
    }

    // Thêm nhiệm vụ đã hoàn thành
    if (completedTasks.length > 0) {
      message += `✅ *Nhiệm vụ đã hoàn thành:*\n\n`;
      completedTasks.forEach((task, index) => {
        const deadline = new Date(task.deadline);
        message += `*${index + 1}. ${task.title}*\n`;
        message += `- Mô tả: ${task.description || 'Không có mô tả'}\n`;
        message += `- Hạn chót: ${deadline.toLocaleString('vi-VN')}\n\n`;
      });
    }

    if (pendingTasks.length === 0 && completedTasks.length === 0) {
      message += `Bạn không có nhiệm vụ nào trong ngày hôm nay.`;
    }

    await bot.sendMessage(userId, message, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    
    console.log(`Đã gửi tổng hợp nhiệm vụ cho user ${userId}`);
  } catch (error) {
    console.error('Lỗi khi gửi tổng hợp nhiệm vụ:', error);
  }
}

// Hàm kiểm tra và gửi thông báo nhiệm vụ trong ngày
async function checkDailyTasks() {
  try {
    console.log('Đang kiểm tra nhiệm vụ trong ngày...');
    
    // Lấy tất cả nhiệm vụ của ngày hôm nay
    const [tasks] = await db.query(`
      SELECT t.*, u.telegram_id 
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE DATE(t.deadline) = CURDATE()
      OR (t.status != 'completed' AND t.deadline < CURDATE())
    `);

    console.log(`Tìm thấy ${tasks.length} nhiệm vụ trong ngày`);

    // Nhóm nhiệm vụ theo user
    const userTasks = {};
    tasks.forEach(task => {
      if (task.telegram_id) {
        if (!userTasks[task.telegram_id]) {
          userTasks[task.telegram_id] = [];
        }
        userTasks[task.telegram_id].push(task);
      }
    });

    // Gửi thông báo cho từng user
    for (const [userId, userTaskList] of Object.entries(userTasks)) {
      await sendDailyTaskSummary(userId, userTaskList);
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra nhiệm vụ:', error);
  }
}

// API endpoint để kiểm tra thủ công
router.post('/check-tasks', async (req, res) => {
  try {
    await checkDailyTasks();
    res.json({ message: 'Đã kiểm tra nhiệm vụ' });
  } catch (error) {
    console.error('Lỗi khi kiểm tra nhiệm vụ:', error);
    res.status(500).json({ error: 'Không thể kiểm tra nhiệm vụ' });
  }
});

// Chạy kiểm tra mỗi ngày lúc 8:00 sáng
cron.schedule('0 8 * * *', () => {
  console.log('Chạy cron job kiểm tra nhiệm vụ hàng ngày...');
  checkDailyTasks();
});

// Chạy kiểm tra ngay khi khởi động server
console.log('Khởi động service thông báo nhiệm vụ...');
checkDailyTasks();

module.exports = router;