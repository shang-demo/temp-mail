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


  let qs = {
    fetchWhenSave: true,
  };

  if (config.fetchWhenSave === false) {
    qs = null;
  }

  let request = rp.defaults({
    baseUrl: 'https://leancloud.cn:443',
    json: true,
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
          where: conditions,
          cursor,
        },
        options,
      ),
    });
  }

  return modelName => ({
    create(doc) {
      return request(
        {
          method: 'POST',
          body: doc,
          uri: `/1.1/classes/${modelName}`,
        })
          .then(resetKey);
    },
    find(condition, projection = {}, options = {}) {
      options.order = options.sort;
      delete options.sort;
      return request(
        {
          uri: `/1.1/classes/${modelName}`,
          qs: _.assign({
            where: condition,
            keys: projection,
          }, options),
        })
          .then(data => _.map(data.results, resetKey));
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
          .then(() => ({
            _id: id,
          }));
    },
    findOne(conditions, projection, options) {
        // eslint-disable-next-line no-param-reassign
      options = _.assign(options, {
        limit: 1,
      });

      return this.find(conditions, projection, options)
          .then(result => result[0]);
    },
    count(condition) {
      return request({
        uri: `/1.1/classes/${modelName}`,
        qs: {
          where: condition,
          count: 1,
          limit: 0,
        },
      })
          .then(result => result.count);
    },
    remove(conditions) {
      return this.scan(conditions)
          .then(results => ({
            requests: _.map(results, item => ({
              method: 'DELETE',
              path: `/1.1/classes/${modelName}/${item._id}`,
            })),
          }))
          .then(body => request({
            method: 'POST',
            uri: '/1.1/batch',
            body,
          }));
    },
    update(conditions, doc) {
      return this.scan(conditions)
          .then(results => ({
            requests: _.map(results, item => ({
              method: 'PUT',
              path: `/1.1/classes/${modelName}/${item._id}`,
              body: doc,
            })),
          }))
          .then(body => request({
            method: 'POST',
            uri: '/1.1/batch',
            body,
          }));
    },
    scan(conditions, options, cursor) {
      let result = [];
      return UtilService
          .promiseWhile(
            () => cursor !== null,
            () => _scan(modelName, conditions, options, cursor)
              .then((data) => {
                // eslint-disable-next-line no-param-reassign
                cursor = data.cursor || null;
                result.push(...data.results);
                return undefined;
              }),
          )
          .then(() => _.map(result, resetKey));
    },
  });
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
    .map(file => initModel(file.name.replace(/\.js$/i, ''), require(file.path), this.config.connections))
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
