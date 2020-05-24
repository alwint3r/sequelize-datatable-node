const { expect } = require(`chai`);
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
      it(`Should output as expected`, async () => {
        const expected = customerData;

        const result = await datatable(models.customer, mockRequest, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce result with correct ordering`, async () => {
        const expected = _.reverse(customerData);
        const request = _.cloneDeep(mockRequest);
        request.order = [
          {
            column: 0,
            dir: `desc`
          }
        ];

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce expected result if where field inside params is given`, async () => {
        const expected = customerData.slice(1);
        const params = {
          where: {
            name: `winter`
          }
        };

        const result = await datatable(models.customer, mockRequest, params);
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce limited result according to request param`, async () => {
        const expected = customerData.slice(0, 1);
        const request = _.cloneDeep(mockRequest);
        request.start = 1;
        request.length = 1;

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });
    });

    describe(`With search`, () => {
      it(`Should produce expected output`, async () => {
        const expected = customerData.slice(0, 1);
        const request = _.cloneDeep(mockRequest);
        request.search = {
          value: `Jane`,
          regex: `false`
        };

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce expected output with numeric search`, async () => {
        const expected = _.reverse(customerData);
        const request = _.cloneDeep(mockRequest);
        request.search = {
          value: 2,
          regex: `false`
        };

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce expected output with numeric search`, async () => {
        const expected = customerData;
        const request = _.cloneDeep(mockRequest);
        request.columns = _.map(request.columns, col => {
          if (col.data === `no`) {
            return col;
          }

          const cloned = _.cloneDeep(col);
          cloned.searchable = `false`;

          return cloned;
        });
        request.search = {
          value: 2,
          regex: `false`
        };

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce expected result if regexp search is given`, async () => {
        const expected = customerData.slice(0, 1);
        const request = _.cloneDeep(mockRequest);
        request.search = {
          value: `^(winter|summer)$`,
          regex: `true`
        };

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`Should produce expected result if regexp search with option replaceRegexp`, async () => {
        const expected = customerData.slice(0, 1);
        const request = _.cloneDeep(mockRequest);
        request.search = {
          value: `^(winter|summer)$`,
          regex: `true`
        };

        const result = await datatable(models.customer, request, { replaceRegexp: true });
        expect(result.data).to.deep.equal(expected);
        return true;
      });
    });

    describe(`Column search`, () => {
      it(`String search`, async () => {
        const expected = customerData.slice(1);
        const request = _.cloneDeep(mockRequest);
        request.columns[1].search = {
          value: `Jane`,
          regex: `false`
        };

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });
      it(`Regex search`, async () => {
        const expected = customerData.slice(1);
        const request = _.cloneDeep(mockRequest);
        request.columns[1].search = {
          value: `^(Jane|summer)$`,
          regex: `true`
        };

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });
      it(`Regex search with option replaceRegexp`, async () => {
        const expected = customerData.slice(1);
        const request = _.cloneDeep(mockRequest);
        request.columns[1].search = {
          value: `^(Jane|summer)$`,
          regex: `true`
        };

        const result = await datatable(models.customer, request, { replaceRegexp: true });
        expect(result.data).to.deep.equal(expected);
        return true;
      });
    });

    describe(`Mixed Global + Column search`, () => {
      it(`String search - expected result 1 row`, async () => {
        const expected = customerData.slice(1);
        const request = _.cloneDeep(mockRequest);
        request.columns[1].search = {
          value: `Jane`,
          regex: `false`
        };
        request.search.value = `089876`;

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`String search - expected no results due global search`, async () => {
        const expected = [];
        const request = _.cloneDeep(mockRequest);
        request.columns[1].search = {
          value: `Jane`,
          regex: `false`
        };
        request.search.value = `99999`;

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });

      it(`String search - expected no results due column search`, async () => {
        const expected = [];
        const request = _.cloneDeep(mockRequest);
        request.columns[1].search = {
          value: `Janexx`,
          regex: `false`
        };
        request.search.value = `089876`;

        const result = await datatable(models.customer, request, {});
        expect(result.data).to.deep.equal(expected);
        return true;
      });
    });

    describe(`Querying table with join`, () => {
      const generallyExpected = [
        _.merge(_.cloneDeep(customerData[0]), {
          Account: _.omit(accountData[0], [`password`])
        }),
        _.merge(_.cloneDeep(customerData[1]), {
          Account: _.omit(accountData[1], [`password`])
        })
      ];

      describe(`Without search`, () => {
        it(`Should produce result as expected`, async () => {
          const params = {
            include: [
              {
                model: models.account,
                as: `Account`,
                attributes: [`email`, `active`]
              }
            ]
          };
          const expected = generallyExpected.slice(0);

          const result = await datatable(models.customer, mockRelationalRequest, params);
          expect(result.data).to.deep.equal(expected);
          return true;
        });

        it(`Should produce output with correct ordering`, async () => {
          const params = {
            include: [
              {
                model: models.account,
                as: `Account`,
                attributes: [`email`, `active`]
              }
            ]
          };

          const expected = _.reverse(generallyExpected.slice(0));
          const request = _.cloneDeep(mockRelationalRequest);
          request.order = [
            {
              column: request.columns.length - 1,
              dir: `asc`
            }
          ];

          const result = await datatable(models.customer, request, params);
          expect(result.data).to.deep.equal(expected);
          return true;
        });

        it(`Should produce expected result if where field inside params is given`, async () => {
          const expected = generallyExpected.slice(0, 1);
          const params = {
            where: {
              '$Account.active$': true
            },
            include: [
              {
                model: models.account,
                as: `Account`,
                attributes: [`email`, `active`]
              }
            ]
          };

          const result = await datatable(models.customer, mockRelationalRequest, params);
          expect(result.data).to.deep.equal(expected);
          return true;
        });
      });
    });
  });
});
