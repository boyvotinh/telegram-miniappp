const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('7969413948:AAHVKr9OvRVkHTBSNecWDlEMiDZBn7mNcm4', { polling: true });

// Lắng nghe lệnh /start để gửi nút mở MiniApp
bot.onText(/\/start/, async (msg) => {
  const telegramId = msg.from.id;
  const name = msg.from.username || msg.from.first_name;
  const chatId = msg.chat.id;

  // Gửi thông báo chờ
  await bot.sendMessage(chatId, '⏳ Đang xử lý yêu cầu, vui lòng đợi...');

  db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
    if (err) {
      console.error(err);
      return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy cập cơ sở dữ liệu.');
    }

    if (results.length === 0) {
      // Nếu user CHƯA có thì mới insert
      db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name], (insertErr) => {
        if (insertErr) {
          console.error(insertErr);
          return bot.sendMessage(chatId, '❌ Không thể lưu thông tin người dùng.');
        }

        // Sau khi insert xong, gửi nút MiniApp
        sendWebAppButton(chatId, name);
      });
    } else {
      // Nếu đã có user ➔ chỉ cần gửi nút
      sendWebAppButton(chatId, name);
    }
  });
});

// Lắng nghe lệnh /task để gửi thông báo nhiệm vụ
bot.onText(/\/task/, async (msg) => {
  const telegramId = msg.from.id;
  const name = msg.from.username || msg.from.first_name;
  const chatId = msg.chat.id;

  // Gửi thông báo chờ
  await bot.sendMessage(chatId, '⏳ Đang xử lý yêu cầu, vui lòng đợi...');

  db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
    if (err) {
      console.error(err);
      return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy cập cơ sở dữ liệu.');
    }

    if (results.length === 0) {
      // Nếu user CHƯA có thì insert và gửi nút MiniApp
      db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name], (insertErr) => {
        if (insertErr) {
          console.error(insertErr);
          return bot.sendMessage(chatId, '❌ Không thể lưu thông tin người dùng.');
        }

        // Sau khi insert xong, gửi nút MiniApp và nhiệm vụ hôm nay
        sendDailyTaskNotification(chatId, telegramId);
      });
    } else {
      // Nếu đã có user ➔ gửi nút và thông báo nhiệm vụ hôm nay
      sendDailyTaskNotification(chatId, telegramId);
    }
  });
});

// Hàm gửi nút WebApp
function sendWebAppButton(chatId, name) {
  bot.sendMessage(chatId, `👋 Chào ${name}! Nhấn vào nút bên dưới để mở ứng dụng:`, {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "🚀 Mở ứng dụng",
          web_app: { url: "https://telegram-miniappp.vercel.app/" }
        }
      ]]
    }
  });
}
// Hàm gửi thông báo nhiệm vụ hôm nay cho người dùng
async function sendDailyTaskNotification(chatId, telegramId) {
  // Đầu tiên lấy user_id từ telegram_id
  db.query(
    'SELECT id FROM users WHERE telegram_id = ?',
    [telegramId],
    (err, userResults) => {
      if (err) {
        console.error(err);
        return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy xuất thông tin người dùng.');
      }

      if (userResults.length === 0) {
        return bot.sendMessage(chatId, '❗ Không tìm thấy thông tin người dùng.');
      }

      const userId = userResults[0].id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Cập nhật trạng thái các nhiệm vụ qua hạn
      db.query(
        `UPDATE tasks 
         SET status = 'completed' 
         WHERE assigned_to = ? 
         AND deadline < ? 
         AND (status IS NULL OR status != 'completed')`,
        [userId, today],
        (updateErr) => {
          if (updateErr) {
            console.error('Lỗi khi cập nhật trạng thái nhiệm vụ:', updateErr);
          }

          // Lấy 2 nhiệm vụ completed gần nhất
          db.query(
            `SELECT DISTINCT t.* 
             FROM tasks t 
             WHERE t.assigned_to = ? AND t.status = 'completed'
             ORDER BY t.deadline DESC
             LIMIT 2`,
            [userId],
            (err, completedTasks) => {
              if (err) {
                console.error(err);
                return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy xuất thông tin nhiệm vụ.');
              }

              // Lấy 3 nhiệm vụ pending gần nhất
              db.query(
                `SELECT DISTINCT t.* 
                 FROM tasks t 
                 WHERE t.assigned_to = ? AND (t.status IS NULL OR t.status != 'completed')
                 ORDER BY t.deadline ASC
                 LIMIT 3`,
                [userId],
                (err, pendingTasks) => {
                  if (err) {
                    console.error(err);
                    return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy xuất thông tin nhiệm vụ.');
                  }

                  const allTasks = [...completedTasks, ...pendingTasks];
                  
                  if (allTasks.length === 0) {
                    return bot.sendMessage(chatId, '❗ Bạn không có nhiệm vụ nào.');
                  }

                  let message = `📅 *Danh sách nhiệm vụ của bạn*\n\n`;

                  // Hiển thị nhiệm vụ đã hoàn thành
                  if (completedTasks.length > 0) {
                    message += `✅ *Nhiệm vụ đã hoàn thành:*\n\n`;
                    completedTasks.forEach((task, index) => {
                      const deadline = new Date(task.deadline);
                      const deadlineFormatted = deadline.toLocaleDateString('vi-VN');
                      
                      message += `*${index + 1}. ${task.title}*\n`;
                      message += `- Mô tả: ${task.description || 'Không có mô tả'}\n`;
                      message += `- Hạn chót: ${deadlineFormatted}\n\n`;
                    });
                  }

                  // Hiển thị nhiệm vụ đang thực hiện
                  if (pendingTasks.length > 0) {
                    message += `⏳ *Nhiệm vụ đang thực hiện:*\n\n`;
                    pendingTasks.forEach((task, index) => {
                      const deadline = new Date(task.deadline);
                      const deadlineFormatted = deadline.toLocaleDateString('vi-VN');
                      const isOverdue = deadline < today;
                      
                      message += `*${index + 1}. ${task.title}*\n`;
                      message += `- Mô tả: ${task.description || 'Không có mô tả'}\n`;
                      message += `- Hạn chót: ${deadlineFormatted} ${isOverdue ? '⚠️ (Đã qua hạn)' : ''}\n\n`;
                    });
                  }

                  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                }
              );
            }
          );
        }
      );
    }
  );
}
