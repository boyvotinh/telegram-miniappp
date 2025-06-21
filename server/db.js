const mysql = require('mysql2');
require('dotenv').config();
const connection = mysql.createConnection({
  host: "metro.proxy.rlwy.net",
  port: 41160,
  user: "root",
  password: "TjNuKjAMdZxcnGOpZWsoxuleFWrxbpJJ",
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