'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Disguises', {
      id: {
        type: Sequelize.DataTypes.UUID
      },
      address: {
        type: Sequelize.DataTypes.STRING
      },
      url: {
        type: Sequelize.DataTypes.STRING
      },
      name: {
        type: Sequelize.DataTypes.STRING
      },
      generation: {
        type: Sequelize.DataTypes.INTEGER
      },
      expiration: {
        type: Sequelize.DataTypes.INTEGER
      },
      preset: {
        type: Sequelize.DataTypes.INTEGER
      },
      permissions: {
        type: Sequelize.DataTypes.JSON
      },
      version: {
        type: Sequelize.DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Disguises');
  }
};