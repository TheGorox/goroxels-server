const config = require('../shared/config.json');

config.port = 8000
config.MAX_CLIENTS_PER_IP = 10;
config.captchaEnabled = false;

config.auth = {
    discord: {
        use: !!process.env.AUTH_DC_CLIENT_ID,

        id: process.env.AUTH_DC_CLIENT_ID,
        secret: process.env.AUTH_DC_CLIENT_SECRET
    },
    facebook: {
        use: !!process.env.AUTH_FB_CLIENT_ID,

        id: process.env.AUTH_FB_CLIENT_ID,
        secret: process.env.AUTH_FB_CLIENT_SECRET
    },
    vkontakte: {
        use: !!process.env.AUTH_VK_CLIENT_ID,

        id: process.env.AUTH_VK_CLIENT_ID,
        secret: process.env.AUTH_VK_CLIENT_SECRET
    },
}
config.generateUsernamesFromFile = false;
config.generateUsernamesFilePath = __dirname + '/../tests/sanitizedNames.txt'

module.exports = config