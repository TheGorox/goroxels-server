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
    }
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate'
});

module.exports = User