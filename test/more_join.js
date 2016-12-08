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

      request.order = [{
        column: `${request.columns.length - 1}`,
        dir: `desc`,
      }];

      const params = {
        include: [
          {
            model: models.account,
            as: `Account`,
            required: false,
          },
          {
            model: models.card,
            as: `Card`,
            required: false,
          },
        ],
      };

      return datatable(models.customer, request, params);
    });
  });

  describe(`With search`, () => {
    it(`Should not output error`, () => {
      const request = _.cloneDeep(mockRelationalRequest);
      request.columns.push({
        data: `Account.email`,
        name: ``,
        searchable: `true`,
        orderable: `true`,
        search: {
          value: ``,
          regex: `false`,
        },
      });

      request.search.value = `winter`;

      const params = {
        include: [
          {
            model: models.account,
            as: `Account`,
            required: false,
          },
        ],
      };

      return datatable(models.customer, request, params);
    });
  });
});
