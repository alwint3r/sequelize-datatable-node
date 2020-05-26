const dialect = process.env.DIALECT || `postgres`;
const enableLogging = process.env.LOGGING === `1`;

const ports = {
  mysql: 3306,
  postgres: 5432
};
const databaseNames = {
  postgres: `postgres`,
  mysql: `sequelizedt`
};

const credentials = {
  mysql: [`root`, ``],
  postgres: [`postgres`, null]
};

module.exports = {
  db_config: {
    dialect,
    host: `localhost`,
    port: ports[dialect],
    logging: enableLogging ? console.log : () => {}
  },
  credentials: credentials[dialect],
  db_name: databaseNames[dialect]
};
