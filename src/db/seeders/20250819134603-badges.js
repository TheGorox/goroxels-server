'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const badges = [
      { name: 'ny24' },
      { name: 'star' },
      { name: 'pepe', height: 16 },
      { name: 'umum' },
      { name: 'pony' },
      { name: 'yoba' },
      { name: 'z' },
      { name: 'jimbo' },
      { name: 'scream' },
    ];

    const existingBadges = await queryInterface.sequelize.query(
      'SELECT name FROM badges WHERE name IN (:names)',
      {
        type: queryInterface.sequelize.QueryTypes.SELECT,
        replacements: { names: badges.map(b => b.name) },
      }
    );

    const existingNames = existingBadges.map(b => b.name);
    const newBadges = badges.filter(badge => !existingNames.includes(badge.name));

    if (newBadges.length > 0) {
      await queryInterface.bulkInsert('badges', newBadges);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('badges', {
      name: ['ny24', 'star', 'pepe', 'umum', 'pony', 'yoba', 'z', 'jimbo', 'scream']
    });
  }
};