'use strict';

const Promise = require(`bluebird`);
const db = require(`./helpers/db`)();
const accountData = require(`./mocks/account_data`);
const customerData = require(`./mocks/customer_data`);
const ccData = require(`./mocks/card_data`);

const models = require(`./models`);

models.customer.belongsTo(models.account, {
  as: `Account`,
  foreignKey: `email`,
  targetKey: `email`,
});

models.account.hasOne(models.customer, {
  as: `Customer`,
  foreignKey: `email`,
  targetKey: `email`,
});

models.card.belongsTo(models.customer, {
  as: `Customer`,
  foreignKey: `customer`,
  targetKey: `no`,
});

models.customer.hasMany(models.card, {
  as: `Card`,
  foreignKey: `customer`,
  targetKey: `no`,
});

before(() =>
  db.sync({ force: true })
  .then(() =>
    Promise.map(accountData, acc => models.account.create(acc))
  )
  .then(() =>
    Promise.map(customerData, cust => models.customer.create(cust))
  )
  .then(() =>
    Promise.map(ccData, c => models.card.create(c))
  )
);
