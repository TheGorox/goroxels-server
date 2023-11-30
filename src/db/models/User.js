const Sequelize = require('sequelize');

const sequelize = require('../index');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: Sequelize.STRING(32),
        allowNull: false
    },

    role: {
        type: Sequelize.ENUM('BANNED', 'USER', 'TRUSTED', 'MOD', 'ADMIN'),
        allowNull: false,
        defaultValue: 'USER'
    },

    badges: {
        type: Sequelize.STRING(255)
    },

    email: {
        type: Sequelize.STRING,
        allowNull: true
    },

    discordId: {
        type: Sequelize.CHAR(18),
        allowNull: true
    },

    vkId: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    fbId: {
        type: Sequelize.CHAR(18),
        allowNull: true
    },

    lastIp: {
        type: Sequelize.STRING(45),
        allowNull: true
    },

    lastCC: {
        type: Sequelize.CHAR(2),
        allowNull: true
    }
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate',
});

User.sync();

module.exports = User