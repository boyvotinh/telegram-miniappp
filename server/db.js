const mysql = require('mysql2');
require('dotenv').config();
const connection = mysql.createConnection({
  host: "centerbeam.proxy.rlwy.net",
  port: "29651",
  user: "root",
  password: "xvpXbvYAIWfxRoYWylGbeSZIQKMXXWuI",
  database: "railway",
});
connection.connect((err) => {
  if (err) {
    console.error('❌ Lỗi kết nối MySQL:', err);
    return;
  }
  console.log('✅ Kết nối MySQL thành công!');
});

module.exports = connection;