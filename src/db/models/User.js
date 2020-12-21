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
        type: Sequelize.ENUM('BANNED', 'USER', 'MOD', 'ADMIN'),
        allowNull: false,
        defaultValue: 'USER'
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

    lastIp: {
        type: Sequelize.STRING(15),
        allowNull: true
    }
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
});

User.sync();

module.exports = User