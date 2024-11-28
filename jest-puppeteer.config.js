const path = require('path');

module.exports = {
  launch: {
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      `--disable-extensions-except=${path.resolve(__dirname)}`,
      `--load-extension=${path.resolve(__dirname)}`
    ]
  },
  browserContext: 'default'
};
