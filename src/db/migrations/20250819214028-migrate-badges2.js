'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверяем существование столбца badges в таблице users перед удалением
    const tableDescription = await queryInterface.describeTable('users');
    if (tableDescription.badges) {
      await queryInterface.removeColumn('users', 'badges');
    }
    
    // Создаем таблицу badges, если она еще не существует
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('badges')) {
      await queryInterface.createTable('badges', {
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
        width: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        height: {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      });
    }
    
    // Создаем таблицу связи UserBadges, если она еще не существует
    if (!tables.includes('UserBadges')) {
      await queryInterface.createTable('UserBadges', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        badgeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'badges',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
      
      // Добавляем уникальный индекс для предотвращения дублирования связей
      await queryInterface.addIndex('UserBadges', ['userId', 'badgeId'], {
        unique: true,
        name: 'user_badge_unique'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Восстанавливаем старый столбец, если его нет
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.badges) {
      await queryInterface.addColumn('users', 'badges', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
    
    // Удаляем таблицы только если они существуют
    const tables = await queryInterface.showAllTables();
    
    if (tables.includes('UserBadges')) {
      await queryInterface.dropTable('UserBadges');
    }
    
    if (tables.includes('badges')) {
      await queryInterface.dropTable('badges');
    }
  }
};