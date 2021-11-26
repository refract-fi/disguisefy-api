'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Prices', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      label: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      network: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      isGas: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      priceUSD: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      sourceIdentifier: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      updatedAt: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      updatedAtDisplay: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      symbolDisplay: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      labelDisplay: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      networkDisplay: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Prices');
  }
};
