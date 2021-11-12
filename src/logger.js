const log4js = require('log4js');

const tinyRotateConfig = {
    maxLogSize: 1024 * 1024 * 10, // 10MB
    backups: 1, // let old 10mb logs be
    // compress: true,
    keepFileExt: true
}

log4js.configure({
    appenders: {
        DB: {
            type: process.env.DB_LOG_PATH ? 'file' : 'console',
            filename: process.env.DB_LOG_PATH || './logs/db.log',
            ...tinyRotateConfig
        },
        admin: {
            type: 'file',
            filename: process.env.ADMIN_LOG_PATH || './logs/admin.log',
            ...tinyRotateConfig
        },
        express: {
            type: 'file',
            filename: process.env.EXPRESS_LOG_PATH || './logs/express.log',
            ...tinyRotateConfig
        },
        console: { type: 'console' }
    },
    categories: {
        DB: { appenders: ['DB'], level: 'debug' },
        express: { appenders: ['express'], level: 'info' },
        admin: { appenders: ['admin'], level: 'info' },
        default: { appenders: ['console'], level: 'info' }
    }
});

module.exports = (name, level='info') => {
    const logger = log4js.getLogger(name);
    logger.level = level;

    return logger
}