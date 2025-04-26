const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('YOUR_BOT_TOKEN_HERE', { polling: true });

bot.onText(/\/start/, (msg) => {
  const telegramId = msg.from.id;
  const name = msg.from.username || msg.from.first_name;

  db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
    if (err) return console.error(err);

    if (results.length === 0) {
      // Nếu user CHƯA có thì mới insert
      db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name], (insertErr) => {
        if (insertErr) return console.error(insertErr);

        // Sau khi insert xong, gửi nút Mini App
        sendWebAppButton(msg.chat.id, name);
      });
    } else {
      // Nếu đã có user ➔ chỉ cần gửi nút
      sendWebAppButton(msg.chat.id, name);
    }
  });
});

// Hàm gửi nút WebApp
function sendWebAppButton(chatId, name) {
  bot.sendMessage(chatId, `Chào ${name}! 🚀 Nhấn vào nút bên dưới để mở ứng dụng:`, {
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
