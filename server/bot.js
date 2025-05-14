const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('7969413948:AAHVKr9OvRVkHTBSNecWDlEMiDZBn7mNcm4', { polling: true });

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

        // Sau khi insert xong, gửi nút Mini App
        sendWebAppButton(chatId, name);
        sendDailyTaskNotification(chatId, telegramId); // Gửi nhiệm vụ hôm nay
      });
    } else {
      // Nếu đã có user ➔ chỉ cần gửi nút
      sendWebAppButton(chatId, name);
      sendDailyTaskNotification(chatId, telegramId); // Gửi nhiệm vụ hôm nay
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
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)

  db.query('SELECT * FROM tasks WHERE assigned_to = ? AND deadline = ?', [telegramId, todayDate], (err, results) => {
    if (err) {
      console.error(err);
      return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy xuất thông tin nhiệm vụ.');
    }

    if (results.length === 0) {
      return bot.sendMessage(chatId, '❗ Hôm nay bạn không có nhiệm vụ nào.');
    }

    const task = results[0]; // Giả sử chỉ có một nhiệm vụ trong ngày
    const message = `📅 *Nhiệm vụ hôm nay*\n\n*Tiêu đề:* ${task.title}\n*Mô tả:* ${task.description}\n*Hạn chót:* ${task.deadline}\n*Trạng thái:* ${task.status}`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  });
}
