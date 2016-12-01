'use strict';

const _ = require(`lodash`);

function boolify(booleanalike) {
  return booleanalike === `true`;
}

function stringSearch(modelDesc, config) {
  const fields = _(modelDesc)
    .keys()
    .filter((item) => {
      const field = modelDesc[item];
      const isCharField = (
        field.type.indexOf(`CHARACTER`) > -1 ||
        field.type.indexOf(`VARCHAR`) > -1
      );

      const matchColumn = _.filter(
        config.columns,
        column => column.data === item && boolify(column.searchable) && !!column.data
      );

      return isCharField && matchColumn.length > 0;
    })
    .value();

  return _.map(fields, field => ({
    [field]: { $like: `%${config.search.value}%` },
  }));
}

function numberSearch(modelDesc, config) {
  const possibleNumericTypes = [`INTEGER`, `DECIMAL`, `FLOAT`, `DOUBLE`];
  const fields = _(modelDesc)
    .keys()
    .filter((item) => {
      const isNumeric = possibleNumericTypes.indexOf(modelDesc[item].type) > -1;
      const matchColumn = _.filter(
        config.columns,
        column => column.data === item
          && boolify(column.searchable)
          && !_.isNaN(Number(config.search.value))
      );

      return isNumeric && matchColumn.length > 0;
    })
    .value();

  return _.map(fields, field => ({
    [field]: Number(config.search.value),
  }));
}

module.exports = {
  string: stringSearch,
  number: numberSearch,
};
