'use strict';

const _ = require(`lodash`);
const searchBuilder = require(`./search_builder`);
const helper = require(`./helper`);
const Promise = require(`bluebird`);

function describe(model) {
  return model.describe();
}

function paginate(config) {
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
    limit: length,
  };
}

function search(model, config, modelName, opt) {
  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  const dialect = helper.getDialectFromModel(model);

  return describe(model).then(description => _.concat(
      searchBuilder.charSearch(modelName, description, config, opt, dialect),
      searchBuilder.numericSearch(modelName, description, config, opt),
      searchBuilder.booleanSearch(modelName, description, config, opt)
    ));
}

function buildSearch(model, config, params, opt) {
  const leaves = helper.dfs(params, [], []);

  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  return Promise.map(leaves, leaf =>
    search(leaf.model || model, config, leaf.as || ``, opt)
  ).then((result) => {
    const objects = _.filter(result, res => _.isObject(res) && !_.isArray(res) && !_.isEmpty(res));
    const arrays = _.filter(result, res => _.isArray(res) && !_.isEmpty(res));

    const reducedArrays = _.reduce(arrays, (acc, val) => _.concat(acc, val), []);
    const reducedObject = _.reduce(objects, (acc, val) => _.merge(acc, val), {});

    const concatenated = {
      $or: _.filter(_.concat(reducedArrays, reducedObject), res => !_.isEmpty(res)),
    };

    return concatenated;
  });
}

function buildOrder(model, config, params) {
  if (!config.order) {
    return [];
  }

  const order = config.order[0];
  const col = config.columns[order.column].data;
  const leaves = helper.dfs(params, [], []);

  if (col.indexOf(`.`) > -1) {
    const splitted = col.split(`.`);
    const colName = splitted.pop();

    const orders = _.compact(_.map(splitted, (modelName) => {
      const found = _.filter(leaves, leaf =>
        leaf.as === modelName
      )[0];

      if (!found) {
        return false;
      }

      return {
        model: found.model,
        as: found.as,
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
}

function getResult(model, config, modelParams, opt) {
  const params = modelParams;

  /* mutate params */
  return buildSearch(model, config, params, opt)
    .then((result) => {
      if (_.isEmpty(result)) {
        return params;
      }

      if (params.where) {
        params.where = {
          $and: [
            params.where,
            result,
          ],
        };
      } else {
        params.where = result;
      }

      return params;
    })
    .then(() => {
      const order = buildOrder(model, config, params);

      return order;
    })
    .then((orderResult) => {
      if (orderResult.length > 0) {
        params.order = [orderResult];
      }

      _.assign(params, paginate(config));

      return params;
    })
    .then(newParams =>
      Promise.all([
        model.count({}),
        model.findAndCountAll(newParams),
      ]))
    .then(result => ({
      draw: Number(config.draw),
      data: _.map(result[1].rows, row => row.toJSON()),
      recordsFiltered: result[1].count,
      recordsTotal: result[0],
      _: config._,
    }));
}

function dataTable(model, config, modelParams, options) {
  const opt = options || {};
  if (!model || !config) {
    return Promise.reject(new Error(`Model and config should be provided`));
  }

  return getResult(model, config, modelParams || {}, opt);
}

module.exports = dataTable;
