const path = require('path');
const filePathOneLayer = require('../utilities/file-path-one-layer');


function lift() {
  // eslint-disable-next-line no-multi-assign
  let controllers = this.controllers = {};

  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  return filePathOneLayer(path.join(this.projectPath, 'controllers'))
    .map((controllerFile) => {
      controllers[controllerFile.basename] = require(controllerFile.path);
      return undefined;
    });
}

module.exports = lift;
