'use strict';

const _ = require(`lodash`);

function boolify(booleanalike) {
  if (typeof booleanalike === `boolean`) {
    return booleanalike;
  }

  return booleanalike === `true`;
}

function getColumnName(field) {
  return field.indexOf(`.`) > -1
    ? field.split(`.`).pop()
    : field;
}

function boolAlike(value) {
  return (value === `true` || value === `false`) || typeof value === `boolean`;
}

function getModelName(field) {
  return field.indexOf(`.`) > -1
    ? field.split(`.`).shift()
    : field;
}

function dfs(node, stack, visited) {
  if (!node) {
    return visited;
  }

  visited.push(node);

  if (_.isArray(node.include) && node.include.length > 0) {
    _.each(node.include, include => stack.push(include));
  }

  return dfs(stack.pop(), stack, visited);
}

function searchify(column) {
  return column.indexOf(`.`) > -1
    ? `$${column}$`
    : column;
}

function getModelAndColumn(column) {
  if (column.indexOf(`.`) > -1) {
    return column.split(`.`);
  }

  return [``, column];
}

function getDialectFromModel(model) {
  const sequelize = model.QueryInterface.sequelize;

  return sequelize.options.dialect;
}

module.exports = {
  boolify,
  getColumnName,
  searchify,
  dfs,
  getModelName,
  boolAlike,
  getModelAndColumn,
  getDialectFromModel,
};
