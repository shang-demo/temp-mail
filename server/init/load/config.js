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
    },
  };

  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  return filePathOneLayer(configPath)
    .each((file) => {
      return _.merge(this.config, require(file.path));
    })
    .then(() => {
      let envPath = path.join(this.config.paths.envConfig, this.environment);
      _.merge(this.config, require(envPath));
    })
    .then(() => {
      return this;
    });
}

module.exports = lift;
