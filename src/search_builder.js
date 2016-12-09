'use strict';

const _ = require(`lodash`);
const helper = require(`./helper`);

const possibleNumericTypes = [`INTEGER`, `DECIMAL`, `FLOAT`, `DOUBLE`];
const possibleStringTypes = [`CHARACTER VARYING`, `VARCHAR`];

function filterColumns(modelName, config) {
  return _.filter(config.columns, (col) => {
    const modelAndColumn = _.takeRight(helper.getModelAndColumn(col.data), 2);

    return modelName === modelAndColumn[0];
  });
}

function createNameMaps(columns) {
  return _.reduce(columns, (acc, col) => _.merge(acc, {
    [helper.getModelAndColumn(col.data).pop()]: col,
  }), {});
}

function charSearch(modelName, modelDesc, config, opt) {
  const columns = filterColumns(modelName, config);
  const nameMaps = createNameMaps(columns);

  const matchNames = _(modelDesc)
    .keys()
    .filter((item) => {
      const isChar = possibleStringTypes.indexOf(modelDesc[item].type) > -1;

      return isChar && nameMaps[item] && config.search.value;
    })
    .value();

  const likeOp = opt.caseInsensitive ? `$ilike` : `$like`;

  return _.map(matchNames, name => ({
    [helper.searchify(nameMaps[name].data)]: { [likeOp]: `%${config.search.value}%` },
  }));
}

function numericSearch(modelName, modelDesc, config) {
  const columns = filterColumns(modelName, config);
  const nameMaps = createNameMaps(columns);

  const matchNames = _(modelDesc)
    .keys()
    .filter((item) => {
      const isNumeric = possibleNumericTypes.indexOf(modelDesc[item].type) > -1;

      return isNumeric && nameMaps[item] && !_.isNaN(Number(config.search.value));
    })
    .value();

  return _.map(matchNames, name => ({
    [helper.searchify(nameMaps[name].data)]: Number(config.search.value),
  }));
}

function booleanSearch(modelName, modelDesc, config) {
  const columns = filterColumns(modelName, config);
  const nameMaps = createNameMaps(columns);

  const matchNames = _(modelDesc)
    .keys()
    .filter((item) => {
      const isNumeric = possibleNumericTypes.indexOf(modelDesc[item].type) > -1;

      return isNumeric && nameMaps[item] && helper.boolAlike(config.search.value);
    })
    .value();

  return _.map(matchNames, name => ({
    [helper.searchify(nameMaps[name].data)]: helper.boolify(config.search.value),
  }));
}

module.exports = {
  numericSearch,
  charSearch,
  booleanSearch,
};
