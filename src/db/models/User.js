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
        type: Sequelize.ENUM('banned', 'user', 'mocher', 'admin', 'gorox'),
        allowNull: false,
        defaultValue: 'user'
    },

    authorizationType: { // for stats
        type: Sequelize.ENUM('vkontakte', 'facebook', 'discord'),
        allowNull: true
    },

    email: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
});

module.exports = User