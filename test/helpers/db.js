'use strict';

const Sequelize = require(`sequelize`);
const config = {
  host: `localhost`,
  port: 5432,
  dialect: `postgres`,
};

let db;

module.exports = () => {
  if (!db) {
    db = new Sequelize(`postgres`, `postgres`, null, config);
  }

  return db;
};
