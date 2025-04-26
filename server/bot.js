const db = require('./db');
const TelegramBot = require('node-telegram-bot-api');

// Giả sử bạn đã tạo bot và lấy token ở đây
const bot = new TelegramBot('7969413948:AAHVKr9OvRVkHTBSNecWDlEMiDZBn7mNcm4', { polling: true });

bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, "Hello!");
});
// bot.onText(/\/start/, (msg) => {
//   const telegramId = msg.from.id;
//   const name = msg.from.username || msg.from.first_name;

//   // Lưu user như cậu đang làm
//   db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
//     if (err) return console.error(err);
//     if (results.length === 0) {
//       db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name]);
//     }

//     // Gửi nút mở Mini App
//     bot.sendMessage(msg.chat.id, `Chào ${name}! Nhấn vào nút bên dưới để bắt đầu.`, {
//       reply_markup: {
//         inline_keyboard: [[
//           {
//             text: "🚀 Mở ứng dụng",
//             web_app: { url: "https://telegram-miniappp.vercel.app/" } // Đặt link Mini App vào đây
//           }
//         ]]
//       }
//     });
//   });
// });