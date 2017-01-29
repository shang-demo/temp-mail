
const path = require('path');
const filePathOneLayer = require('../utilities/file-path-one-layer');


function lift() {
  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */

  let services = this.services = {};

  return filePathOneLayer(path.join(this.projectPath, 'services'))
    .map((serviceFile) => {
      services[serviceFile.basename] = require(serviceFile.path);
      return undefined;
    })
    .then(() => _.merge(global, services));
}

module.exports = lift;
