
const publicConfig = require('../data/config.json');

const config = {
    port: 80,
    MAX_CLIENTS_PER_IP: {
        GUEST: 3,
        USER: 4,
        TRUSTED: 5,
        MOD: 10,
        ADMIN: 30
    },
    // can be changed via admin.html
    captchaEnabled: false,
    // delay for placing after joining the canvas
    // why? to help modders operatively
    // ban massive proxy attack(joke) or annoying
    // griefers who can change their ip
    afterJoinDelay: 0,
    generateUsernamesFromFile: false,
    generateUsernamesFilePath: __dirname + '/../tests/sanitizedNames.txt',

    public: publicConfig,
}

config.auth = {
    discord: {
        use: !!process.env.AUTH_DC_CLIENT_ID,

        id: process.env.AUTH_DC_CLIENT_ID,
        secret: process.env.AUTH_DC_CLIENT_SECRET
    },
    google: {
        use: !!process.env.AUTH_GG_CLIENT_ID,

        id: process.env.AUTH_GG_CLIENT_ID,
        secret: process.env.AUTH_GG_CLIENT_SECRET
    },
    vkontakte: {
        use: !!process.env.AUTH_VK_CLIENT_ID,

        id: process.env.AUTH_VK_CLIENT_ID,
        secret: process.env.AUTH_VK_CLIENT_SECRET
    },
}

module.exports = config