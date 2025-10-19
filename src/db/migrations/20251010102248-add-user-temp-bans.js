'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'bannedUntil', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('blacklists', 'until', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'bannedUntil');
    await queryInterface.removeColumn('blacklists', 'bannedUntil');
  }
};