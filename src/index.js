'use strict';

const _ = require(`lodash`);
const Sequelize = require(`sequelize`);
const searchBuilder = require(`./search_builder`);
const helper = require(`./helper`);
const Promise = require(`bluebird`);

function orderBy(config, desc) {
  if (!config.order) {
    return [];
  }

  const order = config.order[0];

  if (!order) {
    return [];
  }

  const col = config.columns[order.column].data;
  const colExists = _.filter(_.keys(desc), name => name === helper.transformFieldname(col));

  if (colExists.length < 1) {
    return [];
  }

  return [
    Sequelize.col(helper.transformFieldname(col)),
    order.dir.toUpperCase(),
  ];
}

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

function search(model, config) {
  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  return describe(model).then(description => ({
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
    .then(searchParams =>
      describe(model).then(desc => ({
        search: searchParams,
        order: orderBy(config, desc),
      })))
    .then((result) => {
      const searchParams = result.search;
      const order = result.order;

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

      const params = modelParams;

      if (order.length > 0) {
        params.order = [order];
      }

      params.where = _.merge(params.where, newSearchParams.where);

      return params;
    });
}

function getResult(model, config, modelParams) {
  const duplicateParams = modelParams;
  const attributeParams = { attributes: buildAttributes(config) };

  const leaves = helper.dfs(duplicateParams, [], []);

  return Promise.each(leaves, leaf =>
      mergeParams(leaf.model || model, config, leaf)
    )
    .then(() => _.assign(duplicateParams, paginate(config), attributeParams))
    // .then(params => {
    //   console.log('Final params', params);

    //   return params;
    // })
    .then(() =>
      Promise.all([
        model.count({}),
        model.findAndCountAll(duplicateParams),
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
