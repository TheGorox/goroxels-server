const config = require('../shared/config.json');

config.port = 80
config.MAX_CLIENTS_PER_IP = 10;
config.captchaEnabled = false;

module.exports = config