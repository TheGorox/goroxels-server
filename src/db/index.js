const logger = require('log4js').getLogger('DB');
logger.level = 'info';

const {
    Pool
} = require('pg');

let pool;

module.exports = {
    init: (host, port, user, pass) => {
        if (pool) return logger.warn('Init should be run once!');

        pool = new Pool({
            host,
            port,
            user,
            password: pass,
            database: 'goroxels'
        });
        pool.connect()
            .then(() => logger.info('Database has been connected'))
            .catch((err) => {
                logger.fatal('Error connecting database: ' + err);
            });
    },

    query: (query, params, callback) => {
        if (!pool) throw new Error('Pool was not initialized!');

        pool.query(query, params, callback);
    }
}