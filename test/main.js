'use strict';

const expect = require(`chai`).expect;
const _ = require(`lodash`);
const datatable = require(`../`);
const models = require(`./models`);
const mockRequest = require(`./mocks/request.json`);
const mockRelationalRequest = require(`./mocks/relational_request.json`);
const customerData = require(`./mocks/customer_data`);
const accountData = require(`./mocks/account_data`);

describe(`datatable(model, config, params)`, function top() {
  this.timeout(10000);

  describe(`Querying table without join`, () => {
    describe(`Without search`, () => {
      it(`Should output as expected`, () => {
        const expected = customerData;

        return datatable(models.customer, mockRequest, {})
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce result with correct ordering`, () => {
        const expected = _.reverse(customerData);
        const request = _.cloneDeep(mockRequest);
        request.order = [
          {
            column: 0,
            dir: `desc`,
          },
        ];

        return datatable(models.customer, request, {})
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce expected result if where field inside params is given`, () => {
        const expected = customerData.slice(1);
        const params = {
          where: {
            name: `winter`,
          },
        };

        return datatable(models.customer, mockRequest, params)
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce limited result according to request param`, () => {
        const expected = customerData.slice(0, 1);
        const request = _.cloneDeep(mockRequest);
        request.start = 1;
        request.length = 1;

        return datatable(models.customer, request, {})
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });
    });

    describe(`With search`, () => {
      it(`Should produce expected output`, () => {
        const expected = customerData.slice(0, 1);
        const request = _.cloneDeep(mockRequest);
        request.search = {
          value: `Jane`,
          regex: false,
        };

        return datatable(models.customer, request, {})
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce expected output with numeric search`, () => {
        const expected = _.reverse(customerData);
        const request = _.cloneDeep(mockRequest);
        request.search = {
          value: 2,
          regex: false,
        };

        return datatable(models.customer, request, {})
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce expected output with numeric search`, () => {
        const expected = customerData;
        const request = _.cloneDeep(mockRequest);
        request.columns = _.map(request.columns, (col) => {
          if (col.data === `no`) {
            return col;
          }

          const cloned = _.cloneDeep(col);
          cloned.searchable = `false`;

          return cloned;
        });
        request.search = {
          value: 2,
          regex: false,
        };

        return datatable(models.customer, request, {})
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });
    });
  });

  describe(`Querying table with join`, () => {
    const generallyExpected = [
      _.merge(_.cloneDeep(customerData[0]), {
        Account: _.omit(accountData[0], [`password`]),
      }),
      _.merge(_.cloneDeep(customerData[1]), {
        Account: _.omit(accountData[1], [`password`]),
      }),
    ];

    describe(`Without search`, () => {
      it(`Should produce result as expected`, () => {
        const params = {
          include: [
            {
              model: models.account,
              as: `Account`,
              attributes: [`email`, `active`],
            },
          ],
        };
        const expected = generallyExpected.slice(0);

        return datatable(models.customer, mockRelationalRequest, params)
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce output with correct ordering`, () => {
        const params = {
          include: [
            {
              model: models.account,
              as: `Account`,
              attributes: [`email`, `active`],
            },
          ],
        };

        const expected = _.reverse(generallyExpected.slice(0));
        const request = _.cloneDeep(mockRelationalRequest);
        request.order = [
          {
            column: request.columns.length - 1,
            dir: `asc`,
          },
        ];

        return datatable(models.customer, request, params)
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });

      it(`Should produce expected result if where field inside params is given`, () => {
        const expected = generallyExpected.slice(0, 1);
        const params = {
          where: {
            '$Account.active$': true,
          },
          include: [
            {
              model: models.account,
              as: `Account`,
              attributes: [`email`, `active`],
            },
          ],
        };

        return datatable(models.customer, mockRelationalRequest, params)
          .then((result) => {
            expect(result.data).to.deep.equal(expected);

            return true;
          });
      });
    });
  });
});
