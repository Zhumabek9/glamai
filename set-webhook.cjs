const fs = require('fs');
const env = fs.readFileSync('.env.prod', 'utf8');
const match = env.match(/TELEGRAM_BOT_TOKEN="?([^"\n\r]+)"?/);
if (match) {
  const token = match[1];
  
  // Set webhook
  fetch('https://api.telegram.org/bot' + token + '/setWebhook?url=https://tryglamai.com/api/telegram/webhook')
    .then(r => r.json())
    .then(d => console.log('Webhook set:', d))
    .catch(console.error);

  // Set bot commands
  fetch('https://api.telegram.org/bot' + token + '/setMyCommands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commands: [
        {
          command: "start",
          description: "Start the GlamAI Studio"
        },
        {
          command: "appss_verify",
          description: "Verify the bot on AppSS catalog"
        }
      ]
    })
  })
    .then(r => r.json())
    .then(d => console.log('Bot commands set:', d))
    .catch(console.error);
} else {
  console.log('Token not found');
}
