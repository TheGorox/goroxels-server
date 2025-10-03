const Sequelize = require('sequelize');

const sequelize = require('../index');
const { User } = require('./User');

const Template = sequelize.define('template', {
    name: {
        primaryKey: true,
        type: Sequelize.STRING(32),
        allowNull: false
    },
    file: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    thumb: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    public: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    origWidth: {
        type: Sequelize.INTEGER,
        allowNull: true,
    }
});

Template.belongsTo(User);
User.hasMany(Template);

module.exports = Template;