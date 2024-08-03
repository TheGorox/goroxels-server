const Sequelize = require('sequelize');

const sequelize = require('../index');

const Song = sequelize.define('song', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },

    title: {
        type: Sequelize.CHAR(64),
        allowNull: false
    },

    sampleRate: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },

    bitrate: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },

    duration: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },

    hash: { // sha256
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
    }
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate',
});

Song.sync()

module.exports = Song