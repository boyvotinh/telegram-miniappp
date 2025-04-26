const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const TOKEN = '7969413948:AAHVKr9OvRVkHTBSNecWDlEMiDZBn7mNcm4';
const bot = new TelegramBot(TOKEN);

// Đặt webhook URL
bot.setWebHook('https://telegram-miniappp.onrender.com/bot' + TOKEN);

app.post('/bot' + TOKEN, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  const telegramId = msg.from.id;
  const name = msg.from.username || msg.from.first_name;

  db.query('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, results) => {
    if (err) return console.error(err);

    if (results.length === 0) {
      db.query('INSERT INTO users (telegram_id, name) VALUES (?, ?)', [telegramId, name], (insertErr) => {
        if (insertErr) return console.error(insertErr);
        sendWebAppButton(msg.chat.id, name);
      });
    } else {
      sendWebAppButton(msg.chat.id, name);
    }
  });
});

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

const PORT = 29651;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
