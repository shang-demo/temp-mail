function lift() {
  this.config.bootstrap = this.config.bootstrap || [];

  return Promise.each(this.config.bootstrap, (serviceName) => {
    return this.services[serviceName].lift()
      .then((data) => {
        global[serviceName] = this.services[serviceName];
        return data;
      });
  });
}

module.exports = lift;
