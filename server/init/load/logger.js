const pino = require('pino');

function lift() {
  this.config.log = this.config.log || {};

  let pretty;
  if (this.config.log.pretty) {
    // eslint-disable-next-line global-require
    pino.pretty = require('../utilities/pino-pretty');
    pretty = pino.pretty();
    pretty.pipe(process.stdout);
  }

  this.logger = pino(undefined, pretty);
  this.logger.level = this.config.log.level || 'trace';

  global.logger = this.logger;
}

module.exports = lift;
