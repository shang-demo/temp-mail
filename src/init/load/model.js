const driver = require('./mongoose');

module.exports = {
  lift() {
    return driver.lift.call(this);
  },
  lower() {
    return driver.lower.call(this);
  },
};
