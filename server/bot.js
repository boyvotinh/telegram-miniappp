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
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

  db.query(
    'SELECT * FROM tasks WHERE assigned_to = ? AND AND DATE(deadline) = ?',
    [telegramId, todayDate],
    (err, results) => {
      if (err) {
        console.error(err);
        return bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi truy xuất thông tin nhiệm vụ.');
      }

      if (results.length === 0) {
        return bot.sendMessage(chatId, '❗ Hôm nay bạn không có nhiệm vụ nào.');
      }

      let message = `📅 *Danh sách nhiệm vụ hôm nay (${todayDate})*\n\n`;

      results.forEach((task, index) => {
        message += `*${index + 1}. ${task.title}*\n`;
        message += `- Mô tả: ${task.description}\n`;
        message += `- Hạn chót: ${task.deadline}\n`;
        message += `- Trạng thái: ${task.status}\n\n`;
      });

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
  );

}
