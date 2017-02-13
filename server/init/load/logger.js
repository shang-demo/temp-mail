const pino = require('pino');

function lift() {
  this.config.log = this.config.log || {};
  this.logger = pino(this.config.log.options);
  this.logger.level = this.config.log.level || 'trace';

  global.logger = this.logger;
}

module.exports = lift;
