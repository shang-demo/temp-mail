let driver;

module.exports = {
  lift() {
    if (mKoa.config.useLeanStorage) {
      logger.debug('useLeanStorage');
      // eslint-disable-next-line global-require
      driver = require('./lean-storage');
    }
    else {
      // eslint-disable-next-line global-require
      driver = require('./mongoose');
    }

    return driver.lift.call(this);
  },
  lower() {
    return driver.lower.call(this);
  },
};
