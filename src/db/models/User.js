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

    email: {
        type: Sequelize.STRING,
        allowNull: true
    },

    discordId: {
        type: Sequelize.STRING,
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
    },

    shadowBanned: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    bannedUntil: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    createdAt: 'creationDate',
    updatedAt: 'updateDate',
});

const Badge = sequelize.define('badge', {
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


    // only if we need to resize this badge, otherwise don't set
    width: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    height: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
}, {
    tableName: 'badges',
    timestamps: false
});

User.belongsToMany(Badge, { through: 'UserBadges' });
Badge.belongsToMany(User, { through: 'UserBadges' });

User.sync();

module.exports = {
    User,
    Badge
}