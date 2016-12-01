'use strict';

const customer = require(`./customer`);

module.exports = db => ({
  customer: customer(db),
});
