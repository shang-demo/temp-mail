const pino = require('pino');

const logConfig = config.env.log || {};
const isPrettyLog = logConfig.pretty || (process.env.NODE_ENV || 'development').trim() === 'development';

let pretty;
let logger;
if (isPrettyLog) {
  // eslint-disable-next-line global-require
  pino.pretty = require('./pino-pretty');
  pretty = pino.pretty();
  pretty.pipe(process.stdout);
}

logger = pino(undefined, pretty);

logger.level = logConfig.level || 'trace';

module.exports = logger;
