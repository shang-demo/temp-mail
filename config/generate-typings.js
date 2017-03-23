const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const filePathOneLayer = require('../server/init/utilities/file-path-one-layer');

const serverPath = path.join(__dirname, '../server');
const autoGeneratePath = path.join(__dirname, 'typings/auto-generate.d.ts');

/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

function getControllerDeclare() {
  return filePathOneLayer(path.join(serverPath, 'services'))
    .map((serviceFile) => {
      return `declare let ${serviceFile.basename} = require('${serviceFile.basename}');`;
    })
    .then((arr) => {
      return arr.join('\n');
    });
}


function getServiceDeclare() {
  return filePathOneLayer(path.join(serverPath, 'models'))
    .map((modelFile) => {
      return `declare let ${modelFile.basename} = require('mongoose').Model;`;
    })
    .then((arr) => {
      return arr.join('\n');
    });
}

function getGlobal() {
  return Promise.try(() => {
    return `declare let _ = require('lodash');
declare let Promise = require('bluebird');`;
  });
}

function getMKoa() {
  return Promise.try(() => {
    return `declare let mKoa = {
      config: require('config'),
      environment: {}
    };
`
  });
}

function globalLogger() {
  return Promise.try(() => {
    return `declare let logger = require('pino')();`
  });
}

function init() {
  return Promise
    .all([
      getGlobal(),
      globalLogger(),
      getServiceDeclare(),
      getControllerDeclare(),
      getMKoa(),
    ])
    .then((arr) => {
      return fs.writeFileAsync(autoGeneratePath, arr.join('\n'));
    });
}


module.exports = {
  init: init,
};

