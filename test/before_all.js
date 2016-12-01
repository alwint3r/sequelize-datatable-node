'use strict';

const Sequelize = require(`sequelize`);
const config = {
  host: `localhost`,
  port: 5432,
  dialect: `postgres`,
};

const db = new Sequelize(`postgres`, `postgres`, null, config);

db.define(`customer`, {
  id: {
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

before(() => db.sync());
