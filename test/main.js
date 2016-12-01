'use strict';

const expect = require(`chai`).expect;
const datatable = require(`../`);
const db = require(`./helpers/db`)();
const models = require(`./models`)(db);
const mockRequest = require(`./mocks/request.json`);

const storedData = [
  {
    no: 1,
    name: `winter`,
    address: `Bandung`,
    phone: `08123456789`,
    email: `alwin.ridd@gmail.com`,
  },
  {
    no: 2,
    name: `Jane`,
    address: `Jakarta`,
    phone: `08987654321`,
    email: `jane@janedoe.com`,
  },
];

describe(`datatable(model, config, params)`, function top() {
  this.timeout(10000);

  describe(`Without search`, () => {
    it(`Should output as expected`, () => {
      const expected = storedData;

      return datatable(models.customer, mockRequest, {})
        .then((result) => {
          expect(result.data).to.deep.equal(expected);

          return true;
        });
    });
  });
});
