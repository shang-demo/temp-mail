
function bootstrapService() {
  // bootStrap Service
  if (!config.env.bootstrap || !config.env.bootstrap.length) {
    return Promise.resolve();
  }

  return Promise.each(config.env.bootstrap, (name, i) => (Promise.try(() => {
    let service;
    try {
      /* eslint-disable global-require */
      /* eslint-disable import/no-dynamic-require */
      service = require(`../services/${name}`);

      logger.info(`${name} start at ${i}`);
      return service.lift();
    }
    catch (e) {
      logger.warn(e);
      return Promise.reject(e);
    }
  })));
}

module.exports = bootstrapService;
