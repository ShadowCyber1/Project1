const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJson = {
  name: "bot",
  version: "1.0.0",
  main: "index.js",
  dependencies: {
    "facebook-chat-api": "^1.4.0",
    "express": "^4.17.1",
    "moment-timezone": "^0.5.33"
  }
};

const packageJsonPath = path.join(__dirname, 'package.json');

// Create package.json if it doesn't exist
if (!fs.existsSync(packageJsonPath)) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Install necessary packages
exec('npm install', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error installing packages: ${stderr}`);
    return;
  }
  console.log(`Packages installed: ${stdout}`);

  // Start the bot
  exec('node index.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting bot: ${stderr}`);
      return;
    }
    console.log(`Bot started: ${stdout}`);
  });
});
