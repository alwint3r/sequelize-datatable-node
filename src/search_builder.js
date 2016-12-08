'use strict';

const _ = require(`lodash`);

const helper = require(`./helper`);

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
        column => helper.transformFieldname(column.data) === item
          && helper.boolify(column.searchable) && !!column.data
      );

      return isCharField && matchColumn.length > 0;
    })
    .value();

  return _.map(fields, field => ({
    [helper.transformFieldname(field)]: { $like: `%${config.search.value}%` },
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
        column => helper.transformFieldname(column.data) === item
          && helper.boolify(column.searchable)
          && !_.isNaN(Number(config.search.value))
      );

      return isNumeric && matchColumn.length > 0;
    })
    .value();

  return _.map(fields, field => ({
    [helper.transformFieldname(field)]: Number(config.search.value),
  }));
}

module.exports = {
  string: stringSearch,
  number: numberSearch,
};
