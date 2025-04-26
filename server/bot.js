const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');

// Khởi tạo bot
const bot = new TelegramBot('TOKEN_CỦA_BẠN', { polling: true });

// Khi người dùng gửi /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const name = msg.from.username || msg.from.first_name;

  // 1. Lưu user vào database
  db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
    if (err) {
      console.error(err);
      return;
    }

    if (results.length === 0) {
      db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name], (err2) => {
        if (err2) console.error(err2);
      });
    }
  });

  // 2. Gửi nút mở Mini App cho user
  bot.sendMessage(chatId, '🚀 Mở Mini App', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Mở ứng dụng', web_app: { url: 'https://telegram-miniappp.vercel.app' } }]
      ]
    }
  });
});
