const _ = require(`lodash`);
const { Op } = require('sequelize');

const helper = require(`./helper`);

const possibleNumericTypes = [`INTEGER`, `DECIMAL`, `FLOAT`, `DOUBLE`, `INT`, `TINYINT`, `BIGINT`, `NUMBER`, `REAL`];

const possibleStringTypes = [
  `CHARACTER VARYING`,
  `VARCHAR`,
  `TEXT`,
  `CHAR`,
  `STRING`,
  `TINYTEXT`,
  `MEDIUMTEXT`,
  `LONGTEXT`
];

const isTypeExists = (typesList, item) => {
  return _.filter(typesList, type => item.indexOf(type) > -1).length > 0;
};

const filterColumns = (modelName, config) => {
  return _.filter(config.columns, col => {
    const modelAndColumn = _.takeRight(helper.getModelAndColumn(col.data), 2);

    return modelName === modelAndColumn[0];
  });
};

const createNameMaps = columns => {
  return _.reduce(
    columns,
    (acc, col) =>
      _.merge(acc, {
        [helper.getModelAndColumn(col.data).pop()]: col
      }),
    {}
  );
};

const charSearch = (modelName, modelDesc, config, opt, dialect) => {
  const columns = filterColumns(modelName, config);
  const nameMaps = createNameMaps(columns);

  const matchNames = _(modelDesc)
    .keys()
    .filter(item => {
      const isChar = isTypeExists(possibleStringTypes, modelDesc[item].type);

      return isChar && nameMaps[item] && config.search.value;
    })
    .value();

  let searchOp = opt.caseInsensitive && dialect === 'postgres' ? Op.iLike : Op.like;

  let searchValue = `%${config.search.value}%`;
  if (config.search.regex === `true`) {
    if (['mysql', 'postgres'].includes(dialect) || opt.forceRegex) {
      searchOp = Op.regexp;
      searchValue = config.search.value;
    } else if (opt.replaceRegexp && /\^\(\(\?!?.*\)\.\*\)\$/.test(config.search.value)) {
      // workaround to search for list of exact matches, passed like regex expression, ^((?!debug|info.*)$
      // usefull for column filter, see working example: http://live.datatables.net/kopafape/1/edit
      const searches = config.search.value.match(/\^\(\(\?!?(.*)\)\.\*\)\$/);
      if (searches && searches[1]) {
        searchValue = searches[1].split('|');
        // if there is ! before match strings, we exclude values from results
        searchOp = /\^\(\(\?!{1}.*\)\.\*\)\$/.test(config.search.value) ? Op.notIn : Op.in;
      }
    }
  }

  return _.map(matchNames, name => ({
    [helper.searchify(nameMaps[name].data)]: { [searchOp]: searchValue }
  }));
};

const numericSearch = (modelName, modelDesc, config) => {
  const columns = filterColumns(modelName, config);
  const nameMaps = createNameMaps(columns);

  const matchNames = _(modelDesc)
    .keys()
    .filter(item => {
      const isNumeric = isTypeExists(possibleNumericTypes, modelDesc[item].type);

      return isNumeric && nameMaps[item] && !_.isNaN(Number(config.search.value));
    })
    .value();

  return _.map(matchNames, name => ({
    [helper.searchify(nameMaps[name].data)]: Number(config.search.value)
  }));
};

const booleanSearch = (modelName, modelDesc, config) => {
  const columns = filterColumns(modelName, config);
  const nameMaps = createNameMaps(columns);

  const matchNames = _(modelDesc)
    .keys()
    .filter(item => {
      const isNumeric = possibleNumericTypes.indexOf(modelDesc[item].type) > -1;

      return isNumeric && nameMaps[item] && helper.boolAlike(config.search.value);
    })
    .value();

  return _.map(matchNames, name => ({
    [helper.searchify(nameMaps[name].data)]: helper.boolify(config.search.value)
  }));
};

module.exports = { numericSearch, charSearch, booleanSearch };
