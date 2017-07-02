'use strict';

const Sequelize = require(`sequelize`);
const config = require(`./db_config`);

let db;

module.exports = () => {
  if (!db) {
    const username = config.credentials[0];
    const password = config.credentials[1];
    const database = config.db_name;
    db = new Sequelize(database, username, password, config.db_config);
  }

  return db;
};
