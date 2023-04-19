const Sequelize = require('sequelize').Sequelize;

const logger = require('../logger')('DB', 'info');

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? +process.env.DB_PORT : undefined,
    dialect: process.env.DB_ISLOCAL === '0' ? 'mysql' : 'sqlite',
    storage: __dirname + '/database.sqlite',
    dialectOptions: {
        charset: 'utf8',
    },
    pool: {
        max: 15,
        min: 2,
        acquire: 10000,
        idle: 60000
    },
    logging: (info) => process.env.DB_LOG ? logger.info(info) : false
};

const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USER, 
    process.env.DB_PASS, 
    config
);

module.exports = sequelize