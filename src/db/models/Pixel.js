const User = require('./User');
const Sequelize = require('sequelize');

const sequelize = require('../index');

const Pixel = sequelize.define('pixel', {
    x: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: false
    },
    y: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: false
    },
    col: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true
    },
    oldCol: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false
    }
}, {
    timestamps: false
});
Pixel.removeAttribute('id');

User.hasMany(Pixel);
Pixel.belongsTo(User, {primaryKey: true});

Pixel.sync();

module.exports = Pixel