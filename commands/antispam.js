const config = require('/home/runner/testproject1/config.json'); // Load the config file

let antispamEnabled = true;

const num = 8;
const timee = 120;

module.exports.config = {
  name: "antispam",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "VulnSec Legion",
  description: `Toggle automatic kicking of users if they spam ${num} times/${timee}s on or off`,
  usePrefix: true,
  commandCategory: "System",
  usages: "",
  cooldowns: 5,
};

module.exports.toggleAntispam = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;

  // Check if senderID matches the allowedUID from config.json
  if (senderID !== config.allowedUID) {
    return api.sendMessage(`❌ You do not have permission to use this command.`, threadID, messageID);
  }

  antispamEnabled = !antispamEnabled;

  if (antispamEnabled) {
    return api.sendMessage(`✅ Antispam has been turned on. Automatically kick users if they spam ${num} times/${timee}s`, threadID, messageID);
  } else {
    return api.sendMessage(`✅ Antispam has been turned off.`, threadID, messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!antispamEnabled) return;

  const { senderID, threadID, body } = event;

  if (!global.client.antispam) global.client.antispam = {};
  if (!global.client.antispam[senderID]) {
    global.client.antispam[senderID] = {
      timeStart: Date.now(),
      messages: [],
    };
  }

  const threadSetting = global.data.threadData.get(threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  if (!body || body.indexOf(prefix) === 0) return;

  const currentTime = Date.now();
  global.client.antispam[senderID].messages.push({ body, time: currentTime });

  global.client.antispam[senderID].messages = global.client.antispam[senderID].messages.filter(
    (msg) => currentTime - msg.time <= timee * 1000
  );

  if (global.client.antispam[senderID].messages.length >= num) {
    const messageCount = global.client.antispam[senderID].messages.reduce((count, msg) => {
      count[msg.body] = (count[msg.body] || 0) + 1;
      return count;
    }, {});

    const isSpam = Object.values(messageCount).some((count) => count >= num);

    if (isSpam) {
      try {
        const datathread = (await Threads.getData(threadID)).threadInfo;
        const namethread = datathread.threadName;

        const moment = require("moment-timezone");
        const timeDate = moment.tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");

        let dataUser = await Users.getData(senderID) || {};
        let data = dataUser.data || {};

        if (data && data.banned === true) return;

        api.removeUserFromGroup(senderID, threadID, async (err) => {
          if (err) {
            console.error(`Failed to remove user ${senderID} from thread ${threadID}:`, err);
          } else {
            data.banned = true;
            data.reason = `spam bot ${num} times/${timee}s` || null;
            data.dateAdded = timeDate;

            await Users.setData(senderID, { data });
            global.data.userBanned.set(senderID, { reason: data.reason, dateAdded: data.dateAdded });

            global.client.antispam[senderID] = {
              timeStart: Date.now(),
              messages: [],
            };

            api.sendMessage(
              `${senderID}\n⚡️Name: ${dataUser.name}\n⚡️Reason: spam bot ${num} times/${timee}s\n\n✔️User has been removed from the group`,
              threadID,
              () => {
                // Send notifications to admins
                for (let adminID of config.adminBotIds) {
                  api.sendMessage(
                    `⚡️Spam offenders ${num} times/${timee}s\n⚡️Name: ${dataUser.name}\n⚡️ID: ${senderID}\n⚡️ID Box: ${threadID}\n⚡️NameBox: ${namethread}\n⚡️Time: ${timeDate}`,
                    adminID
                  );
                }
              }
            );
          }
        });
      } catch (err) {
        console.error(`Failed to process spam for user ${senderID} in thread ${threadID}:`, err);
      }
    }
  }
};
