const log4js = require('log4js');

log4js.configure({
    appenders: {
        DB: {
            type: 'file',
            filename: process.env.DB_LOG_PATH
        },
        console: {
            type: 'console'
        }
    },
    categories: {
        DB: {
            appenders: ['DB'],
            level: 'debug'
        },
        default: {
            appenders: ['console'],
            level: 'info'
        }
    }
});

module.exports = (name, level='info') => {
    const logger = log4js.getLogger(name);
    logger.level = level;

    return logger
}