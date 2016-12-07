'use strict';

const _ = require(`lodash`);
const Sequelize = require(`sequelize`);
const searchBuilder = require(`./search_builder`);

function orderBy(config) {
  if (!config.order) {
    return [];
  }

  const order = config.order[0];

  if (!order) {
    return [];
  }

  return [
    Sequelize.col(config.columns[order.column].data),
    order.dir.toUpperCase(),
  ];
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

function search(model, config) {
  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  return model.describe().then(description => ({
    $or: _.concat(
      searchBuilder.string(description, config),
      searchBuilder.number(description, config)
    ),
  }));
}

function buildAttributes(config) {
  const columns = config.columns;

  const filtered = _.filter(columns, col => col.data.indexOf(`.`) < 0);

  return _.map(filtered, (col) => {
    if (col.data.indexOf(`.`) > -1) {
      return Sequelize.col(col.data);
    }

    return col.data;
  });
}

function mergeParams(model, config, modelParams) {
  return search(model, config)
    .then((searchParams) => {
      let newSearchParams = {};
      if (modelParams.where) {
        newSearchParams = {
          where: {
            $and: [
              modelParams.where,
              searchParams,
            ],
          }
        };
      } else {
        newSearchParams = {
          where: searchParams,
        };
      }

      const orderParams = orderBy(config).length > 1 ? { order: [orderBy(config)] } : {};
      const paginateParams = paginate(config);
      const attributeParams = { attributes: buildAttributes(config) };
      const merged = _.merge(
        {},
        attributeParams,
        modelParams,
        newSearchParams,
        orderParams,
        paginateParams);

      return merged;
    });
}

function getResult(model, config, modelParams) {
  return mergeParams(model, config, modelParams)
    .then(params =>
      Promise.all([
        model.count({}),
        model.findAndCountAll(params),
      ]))
    .then(result => ({
      draw: Number(config.draw),
      data: _.map(result[1].rows, row => row.toJSON()),
      recordsFiltered: result[1].count,
      recordsTotal: result[0],
      _: config._,
    }));
}

function dataTable(model, config, modelParams) {
  if (!model || !config) {
    return Promise.reject(new Error(`Model and config should be provided`));
  }

  return getResult(model, config, modelParams || {});
}

module.exports = dataTable;
