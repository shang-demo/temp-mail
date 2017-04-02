const _ = require('lodash');
const util = require('util');

function Errors() {
}

util.inherits(Errors, Error);

function buildErrorType(errorConfig, errorName) {
  function ConcreteCustomError(extra, message) {
    Error.captureStackTrace(this, this.constructor);

    this.name = errorName || this.constructor.name;
    this.message = message || errorConfig.message;

    this.extra = extra;
    this.code = errorConfig.code;
  }

  util.inherits(ConcreteCustomError, Errors);
  return ConcreteCustomError;
}

function lift() {
  _.forEach(this.config.errors, (errorConfig, errorName) => {
    Errors[errorName] = buildErrorType(errorConfig, errorName);
  });

  global.Errors = Errors;
}

module.exports = lift;
