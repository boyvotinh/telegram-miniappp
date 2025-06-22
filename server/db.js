const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
  host: "metro.proxy.rlwy.net",
  port: 41160,
  user: "root",
  password: "TjNuKjAMdZxcnGOpZWsoxuleFWrxbpJJ",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = connection;