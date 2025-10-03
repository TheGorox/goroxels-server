module.exports = {
  apps: [{
    name: "goroxels",
    script: './src/index.js',
    restart_delay: 5000,
    env: {
      DB_LOG: 1,
      DB_LOG_PATH: './logs/db.log',

      DB_ISLOCAL: 1,

      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_DATABASE: 'goroxels',
      DB_USER: 'admin',
      DB_PASS: 'chachacha',

      SESSION_SECRET: 'trapsaregays',

      AUTH_FB_CLIENT_ID: '1234567890',
      AUTH_FB_CLIENT_SECRET: "aeaeaeaeaeaeaeaeaeeeeeeee",

      AUTH_DC_CLIENT_ID: '1234567890',
      AUTH_DC_CLIENT_SECRET: "secret is death",

      AUTH_VK_CLIENT_ID: "99xpFuRRygAY3hUNDreDBu2CKS1",
      AUTH_VK_CLIENT_SECRET: "tunaktunaktundadada",

      USE_CF_CONIP: 1,

      USE_PROXYCHECK: 0,

      EXPRESS_LOG_PATH: './logs/express.log',
      ADMIN_LOG_PATH: './logs/admin.log',

      APISOCKET_KEY: 'changeme',

      IP_HASH_SALT: 'changemeeee'

      //SSL_KEY: '/path/to/ssl/key.pem',
      //SSL_CERT: '/path/to/ssl/cert.pem'
    }
  }]
};
