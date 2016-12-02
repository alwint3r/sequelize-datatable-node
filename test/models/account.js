'use strict';

const Sequelize = require(`sequelize`);
const db = require(`../helpers/db`)();

module.exports = db.define(`account`, {
  email: {
    type: Sequelize.STRING,
    primaryKey: true,
  },

  password: {
    type: Sequelize.STRING,
  },

  active: {
    type: Sequelize.BOOLEAN,
  },
}, {
  timestamps: false,
  tableName: `account`,
});
