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
      return null;
    })
    .then(() => {
      let defaultPolicies = this.config.policies['*'] || [];

      let that = this;
      this.graphql.wrapperPolicy = function wrapperPolicy(fields) {
        _.forEach(fields, (item, key) => {
          if (!item.resolve) {
            return;
          }

          let fieldPolicyNames = that.config.policies[key] || defaultPolicies;
          if (!_.isArray(fieldPolicyNames)) {
            fieldPolicyNames = [fieldPolicyNames];
          }
          if (!fieldPolicyNames.length) {
            return;
          }

          let originResolve = item.resolve.bind(item);

          item.resolve = function wrapperResolve(...args) {
            let prePolicies = [];
            let postPolicies = [];
            let catchPolicies = [];

            _.forEach(fieldPolicyNames, (name) => {
              let action;

              if (_.isString(name)) {
                action = that.policies[name];
              }
              else {
                action = name;
              }

              if (!action) {
                return Promise.reject(new Error(`no police called ${name}`));
              }
              else if (_.isObject(action) && _.isFunction(action.resolve)) {
                if (action.type === 'post') {
                  postPolicies.push(action.resolve);
                }
                else if (action.type === 'catch') {
                  catchPolicies.push(action.resolve);
                }
                else {
                  catchPolicies.push(action.resolve);
                }
              }
              else if (_.isFunction(action)) {
                prePolicies.push(action);
              }
              else {
                return Promise.reject(new Error(`police format not correct for ${name}`));
              }
              return null;
            });

            let p = Promise
              .mapSeries(prePolicies, (policy) => {
                return policy(...args);
              })
              .then(() => {
                return originResolve(...args);
              })
              .then((data) => {
                if (!postPolicies.length) {
                  return data;
                }

                return Promise
                  .reduce(postPolicies, (result, policy) => {
                    return policy([result].concat(args));
                  }, data);
              });

            _.forEach(catchPolicies, (policy) => {
              p = p.catch(policy);
            });

            return p;
          };
        });
      };

      return null;
    });
}

module.exports = lift;
