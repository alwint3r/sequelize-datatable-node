const _ = require(`lodash`);

const boolify = booleanalike => {
  if (typeof booleanalike === `boolean`) {
    return booleanalike;
  }

  return booleanalike === `true`;
};

const getColumnName = field => {
  return field.indexOf(`.`) > -1 ? field.split(`.`).pop() : field;
};

const boolAlike = value => {
  return value === `true` || value === `false` || typeof value === `boolean`;
};

const getModelName = field => {
  return field.indexOf(`.`) > -1 ? field.split(`.`).shift() : field;
};

const dfs = (node, stack, visited) => {
  if (!node) {
    return visited;
  }

  visited.push(node);

  if (_.isArray(node.include) && node.include.length > 0) {
    _.each(node.include, include => stack.push(include));
  }

  return dfs(stack.pop(), stack, visited);
};

const searchify = column => {
  return column.indexOf(`.`) > -1 ? `$${column}$` : column;
};

const getModelAndColumn = column => {
  if (column.indexOf(`.`) > -1) {
    return column.split(`.`);
  }

  return [``, column];
};

const getDialectFromModel = model => {
  const { sequelize } = model.QueryInterface;

  return sequelize.options.dialect;
};

module.exports = {
  boolify,
  getColumnName,
  searchify,
  dfs,
  getModelName,
  boolAlike,
  getModelAndColumn,
  getDialectFromModel
};