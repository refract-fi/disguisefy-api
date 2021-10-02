'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Disguises', 'provider', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('Disguises', 'status', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    });

    await queryInterface.addColumn('Disguises', 'cache', {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    });

    await queryInterface.dropTable('DisguiseCache')
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

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
      },
      disguiseId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'Disguises',
          },
          key: 'id'
        },
        allowNull: false
      }
    });

    await queryInterface.removeColumn('Disguises', 'provider');
    await queryInterface.removeColumn('Disguises', 'status');
    await queryInterface.removeColumn('Disguises', 'cache');
  }
};
