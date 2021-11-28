'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.createTable('Logs', {
        id: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        level: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false
        },
        url: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false
        },
        message: {
          type: Sequelize.DataTypes.STRING,
          allowNull: true
        },
        timestamp: {
          type: Sequelize.DataTypes.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        }
     })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.dropTable('Logs');
  }
};
