'use strict';

const Sequelize = require(`sequelize`);
const db = require(`../helpers/db`)();

module.exports = db.define(`card`, {
  cc_no: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer: {
    type: Sequelize.INTEGER,
  },
  cc_masked: {
    type: Sequelize.STRING,
  },
  active: {
    type: Sequelize.BOOLEAN,
  },
}, {
  timestamps: false,
  tableName: `card`,
});
