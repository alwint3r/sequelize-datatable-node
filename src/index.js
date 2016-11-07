'use strict';

const _ = require(`lodash`);

function Datatable(model, config, modelParams) {
  if (!model || !config) {
    throw new Error(`You must provide the model and datatable config`);
  }

  this.model = model;
  this.config = config;
  this.params = modelParams || {};
}

Datatable.prototype.orderBy = function orderBy(config) {
  if (!config.order) {
    return [];
  }

  const order = config.order[0];

  return [
    this.config.columns[order.column].data,
    order.dir.toUpperCase(),
  ];
};

Datatable.prototype.paginate = function paginate(config) {
  if (!_.isUndefined(config.start) && !_.isUndefined(config.length)) {
    return {
      offset: Number(config.start),
      limit: Number(config.length),
    };
  }

  return {};
};

Datatable.prototype.search = function search(model, config) {
  if (_.isUndefined(config.search) || !config.search.value) {
    return Promise.resolve({});
  }

  return model.describe().then((description) => {
    const stringField = _(description)
      .keys()
      .filter((item) => {
        const field = description[item];
        const isCharField = (
          field.type.indexOf(`CHARACTER`) > -1 ||
          field.type.indexOf(`VARCHAR`) > -1
        );

        const matchColumn = _.filter(config.columns,
          col => col.data === item && col.searchable && !!col.data);

        return isCharField && matchColumn;
      })
      .value();

    const possibleNumericTypes = [`INTEGER`, `DECIMAL`, `FLOAT`, `DOUBLE`];

    const numberField = _(config.columns)
      .map(col => col.data)
      .difference(stringField)
      .filter(col => possibleNumericTypes.indexOf(description[col]).type >= 0)
      .value();

    const numberSearch = _.map(numberField, key => ({
      [key]: Number(config.search.value),
    }));

    const stringSearch = _.map(stringField, key => ({
      [key]: { $like: `%${config.search.value}%` },
    }));

    return {
      $or: _.concat(numberSearch, stringSearch),
    };
  });
};

Datatable.prototype.mergeParams = function mergeParams(model, config, params) {
  return this.search(model, config)
    .then((search) => {
      let searchParams = {};
      if (params.where) {
        searchParams = {
          where: {
            $and: [
              params.where,
              search,
            ],
          },
        };
      } else {
        searchParams = {
          where: search,
        };
      }

      const orderParams = { order: [this.orderBy(config)] };
      const paginateParams = this.paginate(config);

      return _.merge(params, searchParams, orderParams, paginateParams);
    });
};

Datatable.prototype.getResult = function getResult() {
  return this.mergeParams(this.model, this.config, this.params)
    .then(params =>
      Promise.all([
        this.model.count({}),
        this.model.findAndCountAll(params),
      ]))
    .then((result) => {
      const response = {
        draw: Number(this.config.draw),
        data: result[1].rows,
        recordsFiltered: result[1].count,
        recordsTotal: result[0],
      };

      return response;
    });
};

module.exports = Datatable;
