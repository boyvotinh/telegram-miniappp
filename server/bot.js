const db = require('./db');
bot.onText(/\/start/, (msg) => {
  const telegramId = msg.from.id;
  const name = msg.from.username || msg.from.first_name;
  // Kiểm tra user có tồn tại chưa
  db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
    if (err) return console.error(err);
    if (results.length === 0) {
      // Chưa có => thêm mới
      db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name]);
    }
    bot.sendMessage(msg.chat.id, `Chào ${name}!`);
  });
});
