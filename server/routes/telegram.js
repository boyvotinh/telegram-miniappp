const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Hàm verify initData
function verifyInitData(initData, botToken) {
  const urlSearchParams = new URLSearchParams(initData);
  const params = Object.fromEntries(urlSearchParams.entries());
  
  const hash = params.hash;
  delete params.hash;

  const dataCheckString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return hmac === hash;
}

// API xác minh initData
router.post('/verify-initdata', (req, res) => {
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ error: 'Missing initData' });
  }

  const botToken = "7969413948:AAHVKr9OvRVkHTBSNecWDlEMiDZBn7mNcm4";

  if (!botToken) {
    return res.status(500).json({ error: 'Server missing BOT_TOKEN' });
  }

  const isValid = verifyInitData(initData, botToken);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid initData' });
  }

  const urlSearchParams = new URLSearchParams(initData);
  const params = Object.fromEntries(urlSearchParams.entries());

  const user = JSON.parse(params.user);

  return res.json({ user });
});

module.exports = router;
