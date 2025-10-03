const Sequelize = require('sequelize');

const sequelize = require('../index');
const {User} = require('./User');

const Whitelist = sequelize.define('whitelist', {
    ip: {
        type: Sequelize.CHAR(45),
        allowNull: false,
        primaryKey: true
    }
}, {
    timestamps: true,
    updatedAt: false
});

Whitelist.belongsTo(User, {
    foreignKey: 'addedBy'
});
Whitelist.sync();

module.exports = Whitelist