'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn('Disguises', 'cacheGeneration', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Disguises', 'cacheExpiration', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

     await queryInterface.removeColumn('Disguises', 'cacheGeneration');
     await queryInterface.removeColumn('Disguises', 'cacheExpiration');
  }
};
