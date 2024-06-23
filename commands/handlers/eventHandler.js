const antispamModule = require('../commands/antispam');

module.exports = function ({ api, event }) {
  const { senderID, threadID, body } = event;

  if (senderID === api.getCurrentUserID()) return;

  if (!global.config || !global.config.threadData) {
    console.error("global.config or global.config.threadData is undefined.");
    return;
  }

  const threadSetting = global.config.threadData.get(threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (body.startsWith(prefix)) {
    const command = body.slice(prefix.length).trim().toLowerCase();

    switch (command) {
      case 'ping':
        api.sendMessage("Pong!", threadID);
        break;
      case 'antispam':
        antispamModule.toggleAntispam({ api, event });
        break;
      default:
        api.sendMessage("I don't understand that command.", threadID);
        break;
    }
  }
};
