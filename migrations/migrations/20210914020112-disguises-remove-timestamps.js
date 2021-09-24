'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Disguises', 'createdAt', { transaction: t }),
        queryInterface.removeColumn('Disguises', 'updatedAt', { transaction: t }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Disguises', 'createdAt', {
          type: Sequelize.DataTypes.DATE
        }, { transaction: t }),
        queryInterface.addColumn('Disguises', 'updatedAt', {
          type: Sequelize.DataTypes.DATE
        }, { transaction: t }),
      ]);
    });
  }
};
