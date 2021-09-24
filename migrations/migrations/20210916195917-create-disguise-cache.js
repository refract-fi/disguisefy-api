'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DisguiseCache', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id: {
        type: Sequelize.INTEGER
      },
      generation: {
        type: Sequelize.INTEGER
      },
      expiration: {
        type: Sequelize.INTEGER
      },
      data: {
        type: Sequelize.JSON
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DisguiseCache');
  }
};