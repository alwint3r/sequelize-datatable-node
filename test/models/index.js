'use strict';

const customer = require(`./customer`);
const account = require(`./account`);

module.exports = db => ({
  customer: customer(db),
  account: account(db),
});
