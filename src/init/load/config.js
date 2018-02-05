const _ = require('lodash');
const filePathOneLayer = require('../utilities/file-path-one-layer');
const pathUtil = require('path');

function lift() {
  let configPath = pathUtil.join(this.projectPath, 'config');

  let that = this;
  this.config = {
    paths: {
      projectPath: this.projectPath,
      config: configPath,
      envConfig: pathUtil.join(configPath, 'env'),
      baseConfigPath: pathUtil.join(configPath, 'env/base'),
    },
    get(path, defaultValue) {
      return _.get(that.config, path, defaultValue);
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
      let envPath = pathUtil.join(this.config.paths.envConfig, this.environment);
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
