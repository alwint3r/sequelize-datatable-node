'use strict';

// const expect = require(`chai`).expect;
const _ = require(`lodash`);
const models = require(`./models`);
const mockRelationalRequest = require(`./mocks/relational_request.json`);
const datatable = require(`../`);

describe(` > 1 joined table`, function top() {
  this.timeout(10000);

  describe(`With ordering on main table`, () => {
    it(`Should not output any error`, () => {
      const request = _.cloneDeep(mockRelationalRequest);
      request.columns.push({
        data: `Card.cc_masked`,
        name: ``,
        searchable: `true`,
        orderable: `true`,
        search: {
          value: ``,
          regex: `false`,
        },
      });

      const params = {
        include: [
          {
            model: models.account,
            as: `Account`,
            required: true,
          },
          {
            model: models.card,
            as: `Card`,
            required: true,
          },
        ],
      };

      return datatable(models.customer, request, params);
    });
  });
});
