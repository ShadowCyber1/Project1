const login = require('facebook-chat-api');
const fs = require('fs');
const path = require('path');
const antispamModule = require('./commands/antispam'); // Adjust path as necessary

// Load app state from file
const appStatePath = path.join(__dirname, 'appstate.json');
let appState;
try {
  appState = JSON.parse(fs.readFileSync(appStatePath, 'utf8'));
} catch (err) {
  console.error('Error reading appstate.json:', err);
  appState = { cookies: [] };
}

// Initialize global configuration
global.config = {
  threadData: new Map(),
  PREFIX: '.', // Change the prefix to match your command trigger
};

async function startBot() {
  try {
    login({ appState }, (error, api) => {
      if (error) return console.error('Error logging in:', error);

      console.log('Bot started successfully!');

      // Send greeting message to console or specific thread (example: console.log)
      console.log('👾 I am crafted by VulnSec Legion, the vanguard against spamming. ⚠️ I\'m not here to fix your typos or sugarcoat the truth. I\'m the sentinel, the digital watchdog. Spammers, beware.');

      api.listenMqtt((err, event) => {
        if (err) return console.error(err);

        // Ensure thread data is available
        const threadSetting = global.config.threadData.get(event.threadID) || {};
        const prefix = threadSetting.PREFIX || global.config.PREFIX;

        // Check if event has a body and starts with the command prefix
        if (event.body && event.body.startsWith(prefix)) {
          const command = event.body.slice(prefix.length).trim().toLowerCase();

          // Handle commands
          switch (command) {
            case 'ping':
              api.sendMessage("Pong!", event.threadID);
              break;
            case 'antispam':
              antispamModule.toggleAntispam({ api, event }); // Assuming toggleAntispam is the function to toggle antispam
              break;
            default:
              api.sendMessage("👾 I'm crafted by VulnSec Legion, the vanguard against spamming. ⚠️ I'm not here to fix your typos or sugarcoat the truth. I'm the sentinel, the digital watchdog. Spammers, beware.", event.threadID);
              break;
          }
        }
      });
    });
  } catch (err) {
    console.error('Error starting bot:', err);
  }
}

startBot();
