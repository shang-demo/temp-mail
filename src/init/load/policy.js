const _ = require('lodash');
const path = require('path');
const filePathOneLayer = require('../utilities/file-path-one-layer');

function lift() {
  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  /* eslint max-len: ["error", 150] */

  // eslint-disable-next-line no-multi-assign
  let policies = this.policies = {};
  // eslint-disable-next-line no-multi-assign
  let policiesPath = this.config.paths.policies = path.join(this.projectPath, 'policies');

  return filePathOneLayer(policiesPath)
    .map((file) => {
      policies[file.basename] = require(file.path);
      return undefined;
    })
    .then(() => {
      this.config.controllerActionPolicies = {};

      let defaultPolicies = this.config.policies['*'] || [];
      _.forEach(this.controllers, (controller, controllerName) => {
        let controllerPolicies = this.config.policies[controllerName] || {};
        let defaultControllerPolicies = controllerPolicies['*'] || defaultPolicies;
        _.forEach(controller, (action, actionName) => {
          if (_.isFunction(action)) {
            this.config.controllerActionPolicies[`${controllerName}.${actionName}`] = controllerPolicies[actionName] || defaultControllerPolicies;
          }
        });
      });

      let unknownPolicies = [];

      this.controllerActionPolicies = _.mapValues(this.config.controllerActionPolicies, (policyNames) => {
        return _.map(policyNames, (policyName) => {
          let policy = this.policies[policyName];
          if (!policy) {
            unknownPolicies.push(policyName);
          }
          return policy;
        });
      });

      if (unknownPolicies.length) {
        return Promise.reject(new Error(`Unknown policy:${unknownPolicies.join(',')}`));
      }

      return Promise.resolve();
    });
}

module.exports = lift;
