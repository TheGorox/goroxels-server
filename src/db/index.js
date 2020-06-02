const Sequelize = require('sequelize').Sequelize;

const logger = require('../logger')('DB', 'info');

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
        charset: 'UNICODE'
    },
    pool: {
        max: 15,
        min: 2,
        acquire: 10000,
        idle: 10000
    },
    logging: (info) => process.env.DB_LOG ? logger.info(info) : false
});

module.exports = sequelize