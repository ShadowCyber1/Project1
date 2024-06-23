const express = require('express');
const app = express();
const path = require('path');
const antispamModule = require('../commands/antispam');

app.use(express.json());

app.get('/status', (req, res) => {
  res.json({ status: antispamModule.antispamEnabled ? 'ON' : 'OFF' });
});

app.post('/toggle-antispam', (req, res) => {
  antispamModule.antispamEnabled = !antispamModule.antispamEnabled;
  res.json({ status: antispamModule.antispamEnabled ? 'Antispam is now ON' : 'Antispam is now OFF' });
});

app.use(express.static(path.join(__dirname, 'cover')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
