'use strict';

const Promise = require(`bluebird`);
const db = require(`./helpers/db`)();
const accountData = require(`./mocks/account_data`);
const customerData = require(`./mocks/customer_data`);

const models = require(`./models`)(db);

before(() =>
  db.sync({ force: true })
    .then(() =>
      Promise.map(accountData, acc => models.account.create(acc))
    )
    .then(() =>
      Promise.map(customerData, cust => models.customer.create(cust))
    )
  );
