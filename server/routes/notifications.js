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

    await bot.telegram.sendMessage(userId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
  }
}

// Hàm kiểm tra nhiệm vụ sắp đến hạn
async function checkUpcomingTasks() {
  try {
    // Lấy tất cả nhiệm vụ chưa hoàn thành và sắp đến hạn trong 24h tới
    const [tasks] = await db.query(`
      SELECT t.*, u.telegram_id 
      FROM tasks t
      JOIN users u ON t.assigned_to = u.id
      WHERE t.status != 'completed'
      AND t.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
    `);

    for (const task of tasks) {
      if (task.telegram_id) {
        await sendTaskNotification(task.telegram_id, task);
      }
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra nhiệm vụ:', error);
  }
}

// Chạy kiểm tra mỗi giờ
cron.schedule('0 * * * *', () => {
  checkUpcomingTasks();
});

// Chạy kiểm tra ngay khi khởi động server
checkUpcomingTasks();

module.exports = {
  sendTaskNotification,
  checkUpcomingTasks
};