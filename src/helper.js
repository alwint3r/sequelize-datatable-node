'use strict';

function boolify(booleanalike) {
  return booleanalike === `true`;
}

function transformFieldname(field) {
  return field.indexOf(`.`) > -1
    ? `$${field}$`
    : field;
}

module.exports = {
  boolify,
  transformFieldname,
};
