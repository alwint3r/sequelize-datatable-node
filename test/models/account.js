'use strict';

const Sequelize = require(`sequelize`);

module.exports = db => db.define(`account`, {
  email: {
    type: Sequelize.STRING,
    primaryKey: true,
  },

  password: {
    type: Sequelize.STRING,
  },
}, {
  timestamps: false,
  tableName: `account`,
});
