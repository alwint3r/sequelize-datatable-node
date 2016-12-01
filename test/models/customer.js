'use strict';

const Sequelize = require(`sequelize`);

module.exports = db => db.define(`customer`, {
  no: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  name: {
    type: Sequelize.STRING,
  },

  address: {
    type: Sequelize.STRING,
  },

  phone: {
    type: Sequelize.STRING,
  },

  email: {
    type: Sequelize.STRING,
  }
}, {
  timestamps: false,
  tableName: `customer`,
});
