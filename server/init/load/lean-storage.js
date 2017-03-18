const _ = require('lodash');
const path = require('path');
const rp = require('request-promise');
const filePathOneLayer = require('../utilities/file-path-one-layer');

const dbList = {};

// rp.debug = true;

function createConnection(config) {
  let appKey = config.appKey;
  let appId = config.appId;
  if (!appKey) {
    throw new Error('no appKey found');
  }

  logger.info('appKey: ', appKey, 'appId: ', appId, 'masterKey: ', config.masterKey);


  let qs = {
    fetchWhenSave: true,
  };

  if (config.fetchWhenSave === false) {
    qs = null;
  }

  let request = rp.defaults({
    baseUrl: 'https://leancloud.cn:443',
    json: true,
    timeout: 10 * 1000,
    headers: {
      'X-LC-Id': appId,
      'X-LC-Key': appKey,
    },
    qs,
  });

  let masterRequest;
  if (config.masterKey) {
    masterRequest = rp.defaults({
      baseUrl: 'https://leancloud.cn:443',
      json: true,
      headers: {
        'X-LC-Id': appId,
        'X-LC-Key': `${config.masterKey},master`,
      },
    });
  }

  return {
    request,
    model: getModel(request, masterRequest),
  };
}

function getDb(connectionName, connections) {
  if (dbList[connectionName]) {
    return dbList[connectionName];
  }

  if (!connections[connectionName]) {
    throw new Error(`no ${connectionName} found`);
  }


  dbList[connectionName] = createConnection(connections[connectionName]);
  return dbList[connectionName];
}

function initModel(modelName, model, connections) {
  model.options = _.assign({
    connection: 'defaultMongo',
  }, model.options);


  let db = getDb(model.options.connection, connections);

  return {
    db,
    modelName,
    model: db.model(modelName),
    schema: null,
  };
}

function getModel(request, masterRequest) {
  function resetKey(obj) {
    return _.assign({
      _id: obj.objectId,
    }, _.omit(obj, ['objectId']));
  }

  function _scan(modelName, conditions, options = {}, cursor) {
    if (!masterRequest) {
      return Promise.reject(new Error('no masterKey'));
    }

    options.scan_key = options.sort;
    delete options.sort;

    if (options.skip) {
      logger.warn('scan not support skip');
      delete options.skip;
    }

    options.limit = options.limit || 100;

    return masterRequest({
      uri: `/1.1/scan/classes/${modelName}`,
      qs: _.assign(
        {
          where: JSON.stringify(conditions),
          cursor,
        },
        options
      ),
    });
  }

  function _updateById(modelName, id, doc) {
    delete doc.createdAt;
    delete doc.updatedAt;
    delete doc._id;
    delete doc.objectId;

    return request({
      method: 'PUT',
      uri: `/1.1/classes/${modelName}/${id}`,
      body: doc,
    })
      .catch((e) => {
        return Promise.reject(e);
      });
  }

  function transformOrder(sort) {
    if (_.isObject(sort)) {
      return _.map(sort, (value, key) => {
        if (value === -1) {
          return `-${key}`;
        }
        return key;
      }).join(',');
    }
    else if (_.isString(sort)) {
      return sort;
    }

    throw new Error(`${sort} not support`);
  }

  return (modelName) => {
    return {
      create(doc) {
        return request(
          {
            method: 'POST',
            body: doc,
            uri: `/1.1/classes/${modelName}`,
          })
          .then(resetKey);
      },
      find(conditions, projection = '', options = {}) {
        if (options.sort) {
          options.order = transformOrder(options.sort);
          delete options.sort;
        }

        return request(
          {
            uri: `/1.1/classes/${modelName}`,
            qs: _.assign({
              where: JSON.stringify(conditions),
              keys: projection || undefined,
            }, options),
          })
          .then((data) => {
            return _.map(data.results, resetKey);
          });
      },
      findById(id) {
        return request(
          {
            uri: `/1.1/classes/${modelName}/${id}`,
          })
          .then(resetKey);
      },
      findByIdAndRemove(id) {
        return request({
          method: 'DELETE',
          uri: `/1.1/classes/${modelName}/${id}`,
        })
          .then(() => {
            return ({
              _id: id,
            });
          });
      },
      findOne(conditions, projection, options) {
        // eslint-disable-next-line no-param-reassign
        options = _.assign(options, {
          limit: 1,
        });

        return this.find(conditions, projection, options)
          .then((result) => {
            return result[0];
          });
      },
      count(conditions) {
        return request({
          uri: `/1.1/classes/${modelName}`,
          qs: {
            where: JSON.stringify(conditions),
            count: 1,
            limit: 0,
          },
        })
          .then((result) => {
            return result.count;
          });
      },
      remove(conditions) {
        return this.scan(conditions)
          .then((results) => {
            return ({
              requests: _.map(results, (item) => {
                return ({
                  method: 'DELETE',
                  path: `/1.1/classes/${modelName}/${item._id}`,
                });
              }),
            });
          })
          .then((body) => {
            return request({
              method: 'POST',
              uri: '/1.1/batch',
              body,
            });
          });
      },
      update(conditions, doc, options = {}) {
        // 更新1条
        if (!options.multi) {
          return Promise
            .try(() => {
              if (conditions._id) {
                return conditions._id;
              }
              return this.findOne(conditions)
                .then((data) => {
                  return data && data._id;
                });
            })
            .then((id) => {
              if (!id && options.upsert) {
                return this.create(doc);
              }

              return _updateById(modelName, id, doc);
            });
        }
        // 多条

        return this.scan(conditions)
          .then((results) => {
            if (!results || !results.length) {
              if (options.upsert) {
                return this.create(doc);
              }
              return undefined;
            }

            delete doc.createdAt;
            delete doc.updatedAt;
            delete doc._id;
            delete doc.objectId;

            return {
              requests: _.map(results, (item) => {
                return ({
                  method: 'PUT',
                  path: `/1.1/classes/${modelName}/${item._id}`,
                  body: doc,
                });
              }),
            };
          })
          .then((body) => {
            return request({
              method: 'POST',
              uri: '/1.1/batch',
              body,
            });
          });
      },
      scan(conditions, options, cursor) {
        let result = [];
        return UtilService
          .promiseWhile(
            () => {
              return cursor !== null;
            },
            () => {
              return _scan(modelName, conditions, options, cursor)
                .then((data) => {
                  // eslint-disable-next-line no-param-reassign
                  cursor = data.cursor || null;
                  result.push(...data.results);
                  return undefined;
                });
            }
          )
          .then(() => {
            return _.map(result, resetKey);
          });
      },
      updateArray(arr) {
        return request({
          method: 'POST',
          uri: '/1.1/batch',
          body: {
            requests: _.map(arr, (item) => {
              delete item.doc.createdAt;
              delete item.doc.updatedAt;

              return {
                method: 'PUT',
                path: `/1.1/classes/${modelName}/${item._id}`,
                body: item.doc,
              };
            }),
          },
        });
      },
    };
  };
}

function exposeGlobal(opt) {
  global[opt.modelName] = opt.model;
  global[opt.modelName].getSchema = function getSchema() {
    return opt.schema;
  };
  global[opt.modelName].getDb = function getDB() {
    return opt.db;
  };
}

function lower() {
  return Promise.resolve();
}

function lift() {
  let modelsPath = path.join(this.projectPath, 'models');
  /* eslint-disable global-require */
  /* eslint-disable import/no-dynamic-require */
  return filePathOneLayer(modelsPath)
    .map((file) => {
      return initModel(file.name.replace(/\.js$/i, ''), require(file.path), this.config.connections);
    })
    .map((opt) => {
      this.model[opt.modelName] = opt;
      exposeGlobal(opt);
      return null;
    });
}


module.exports = {
  lift,
  lower,
};
