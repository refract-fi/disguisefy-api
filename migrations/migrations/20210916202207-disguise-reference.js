'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('DisguiseCache', 'disguiseId', {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: {
          tableName: 'Disguises',
        },
        key: 'id'
      },
      allowNull: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('DisguiseCache', 'disguiseId');
  }
};
