const pino = require('pino');

// set bluebird and lodash
global.Promise = require('bluebird');
global._ = require('lodash');

// set global ApplicationError
global.ApplicationError = require('./ApplicationError');

// set env
const env = (process.env.NODE_ENV || 'development').trim();
global.config = {};

try {
  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  global.config.env = require(`./env/${env}`);
}
catch (e) {
  throw e;
}

// log
let pretty;
if (env === 'development') {
  pretty = pino.pretty();
  pretty.pipe(process.stdout);
}

global.logger = pino(undefined, pretty);
