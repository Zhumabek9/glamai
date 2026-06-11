const fs = require('fs');
const env = fs.readFileSync('.env.prod', 'utf8');
const match = env.match(/TELEGRAM_BOT_TOKEN="?([^"\n\r]+)"?/);
if (match) {
  const token = match[1];
  fetch('https://api.telegram.org/bot' + token + '/setWebhook?url=https://tryglamai.com/api/telegram/webhook')
    .then(r => r.json())
    .then(console.log)
    .catch(console.error);
} else {
  console.log('Token not found');
}
