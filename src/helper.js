'use strict';

const _ = require(`lodash`);

function boolify(booleanalike) {
  return booleanalike === `true`;
}

function transformFieldname(field) {
  return field.indexOf(`.`) > -1
    ? field.split(`.`).pop()
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

module.exports = {
  boolify,
  transformFieldname,
  dfs,
};
