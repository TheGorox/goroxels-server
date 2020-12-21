const Sequelize = require('sequelize').Sequelize;

const logger = require('../logger')('DB', 'info');

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_ISLOCAL === '0' ? 'postgres' : 'sqlite',
    storage: __dirname + '/database.sqlite',
    dialectOptions: {
        charset: 'UNICODE'
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