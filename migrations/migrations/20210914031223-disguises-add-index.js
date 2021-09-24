'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn('Disguises', 'id', {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false
      }, {
          transaction,
      });

      await queryInterface.addIndex(
        'Disguises',
        {
          fields: ['id'],
          unique: true,
          transaction,
        }
      );

      await queryInterface.addIndex(
        'Disguises',
        {
          fields: ['url'],
          unique: true,
          transaction,
        }
      );

    } catch(e) {
      await transaction.rollback();
      throw e;
    }
  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex('Disguises', 'id');
      await queryInterface.removeIndex('Disguises', 'url');
    } catch(e) {
      await transaction.rollback();
      throw e;
    }
  }
};
