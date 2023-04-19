const Sequelize = require('sequelize');

const sequelize = require('../index');

const ChatMessages = sequelize.define('chatMessage', {
    channelName: {
        type: Sequelize.CHAR(30),
        allowNull: false,
        primaryKey: true
    },

    messagesJson: {
        type: Sequelize.TEXT('medium'),
        allowNull: false
    },
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate',
});

ChatMessages.sync();

module.exports = ChatMessages