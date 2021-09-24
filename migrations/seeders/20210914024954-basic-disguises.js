'use strict';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Disguises', [{
      id: uuidv4(),
      address: '0x8BF4574668a9899B21072Dc00B8b524208e55cA4',
      url: 'abc',
      name: 'test',
      generation: 1631582538,
      expiration: 1631584538,
      preset: 0,
      permissions: null,
      version: 1
    }, {
      id: uuidv4(),
      address: '0x8d081539265Ebbc3323aA0e26F755C1580602D47',
      url: 'xyz',
      name: 'test2',
      generation: 1631584538,
      expiration: null,
      preset: 0,
      permissions: null,
      version: 1
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Disguises', null, {});
  }
};
