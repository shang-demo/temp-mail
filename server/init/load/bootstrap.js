
function lift() {
  this.config.bootstrap = this.config.bootstrap || [];

  return Promise.each(this.config.bootstrap, serviceName => this.services[serviceName].lift());
}

module.exports = lift;
