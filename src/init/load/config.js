const _ = require('lodash');
const filePathOneLayer = require('../utilities/file-path-one-layer');
const path = require('path');

function lift() {
  let configPath = path.join(this.projectPath, 'config');

  this.config = {
    paths: {
      projectPath: this.projectPath,
      config: configPath,
      envConfig: path.join(configPath, 'env'),
      baseConfigPath: path.join(configPath, 'env/base'),
    },
  };

  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  return filePathOneLayer(configPath)
    .each((file) => {
      try {
        return _.merge(this.config, require(file.path));
      }
      catch (e) {
        return Promise.reject(e);
      }
    })
    .then(() => {
      let envPath = path.join(this.config.paths.envConfig, this.environment);
      try {
        return _.merge(this.config, require(this.config.paths.baseConfigPath), require(envPath));
      }
      catch (e) {
        return Promise.reject(e);
      }
    })
    .then(() => {
      return this;
    });
}

module.exports = lift;
