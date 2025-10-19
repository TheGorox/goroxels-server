const Sequelize = require('sequelize');

const sequelize = require('../index');
const { User } = require('./User');

const Blacklist = sequelize.define('blacklist', {
    ip: {
        type: Sequelize.CHAR(45),
        allowNull: false,
        primaryKey: true
    },
    until: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false
});

Blacklist.belongsTo(User, {
    foreignKey: 'addedBy'
});
Blacklist.sync();

module.exports = Blacklist