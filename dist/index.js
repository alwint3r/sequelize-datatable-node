const _ = require(`lodash`);
const searchBuilder = require(`./searchBuilder`);
const helper = require(`./helper`);
const Promise = require(`bluebird`);
const { Op } = require('sequelize');

const describe = model => model.describe();

const paginate = config => {
  if (_.isUndefined(config.start) || _.isUndefined(config.length)) {
    return {};
  }

  const start = Number(config.start);
  const length = Number(config.length);

  if (_.isNaN(start) || _.isNaN(length)) {
    return {};
  }

  return {
    offset: start,
    limit: length
  };
};

const search = async (model, config, modelName, opt) => {
  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  const dialect = helper.getDialectFromModel(model);
  const description = await describe(model);

  return _.concat(searchBuilder.charSearch(modelName, description, config, opt, dialect), searchBuilder.numericSearch(modelName, description, config, opt), searchBuilder.booleanSearch(modelName, description, config, opt));
};

const buildSearch = async (model, config, params, opt) => {
  const leaves = helper.dfs(params, [], []);
  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  const result = await Promise.map(leaves, leaf => search(leaf.model || model, config, leaf.as || ``, opt));

  const objects = _.filter(result, res => _.isObject(res) && !_.isArray(res) && !_.isEmpty(res));
  const arrays = _.filter(result, res => _.isArray(res) && !_.isEmpty(res));

  const reducedArrays = _.reduce(arrays, (acc, val) => _.concat(acc, val), []);
  const reducedObject = _.reduce(objects, (acc, val) => _.merge(acc, val), {});

  const operator = opt.operator || Op.or;
  const concatenated = {
    [operator]: _.filter(_.concat(reducedArrays, reducedObject), res => !_.isEmpty(res))
  };

  return concatenated;
};

const buildColumnSearch = async (model, config, params, opt) => {
  const options = opt;
  options.operator = Op.and;
  const columnSearchs = config.columns.filter(column => column.searchable === `true` && column.search.value !== `` && column.data !== ``);
  const result = await Promise.map(columnSearchs, column => {
    const fakeConfig = { columns: [column], search: column.search };
    return buildSearch(model, fakeConfig, params, options);
  });
  return result[0];
};

const buildOrder = (model, config, params) => {
  if (!config.order) {
    return [];
  }

  const order = config.order[0];
  const col = config.columns[order.column].data;
  const leaves = helper.dfs(params, [], []);

  if (col.indexOf(`.`) > -1) {
    const splitted = col.split(`.`);
    const colName = splitted.pop();

    const orders = _.compact(_.map(splitted, modelName => {
      const found = _.filter(leaves, leaf => leaf.as === modelName)[0];

      if (!found) {
        return false;
      }

      return {
        model: found.model,
        as: found.as
      };
    }));

    if (orders.length < 1) {
      return [];
    }

    orders.push(colName);
    orders.push(order.dir.toUpperCase());

    return orders;
  }

  return [helper.getColumnName(col), order.dir.toUpperCase()];
};

const getResult = async (model, config, modelParams, opt) => {
  const params = modelParams;

  const searchResult = await buildSearch(model, config, params, opt);
  const searchColumnResult = await buildColumnSearch(model, config, params, opt);

  const whereCondition = [];
  if (params.where) whereCondition.push(params.where);
  if (searchResult) whereCondition.push(searchResult);
  if (searchColumnResult) whereCondition.push(searchColumnResult);

  params.where = {
    [Op.and]: whereCondition
  };

  const orderResult = await buildOrder(model, config, params);
  if (orderResult.length > 0) {
    params.order = [orderResult];
  }

  _.assign(params, paginate(config));

  const result = await Promise.all([model.count({}), model.findAndCountAll(params)]);

  return {
    draw: Number(config.draw),
    data: _.map(result[1].rows, row => row.toJSON()),
    recordsFiltered: result[1].count,
    recordsTotal: result[0],
    _: config._
  };
};

const dataTable = async (model, config, modelParams, options) => {
  const opt = options || {};
  if (!model || !config) {
    return Promise.reject(new Error(`Model and config should be provided`));
  }

  const finalResult = await getResult(model, config, modelParams || {}, opt);
  return finalResult;
};

module.exports = dataTable;