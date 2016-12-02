'use strict';

const Sequelize = require(`sequelize`);
const db = require(`../helpers/db`)();

module.exports = db.define(`customer`, {
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
