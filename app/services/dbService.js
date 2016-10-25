const mongoose = require('mongoose');

mongoose.Promise = Promise;

function close() {
  mongoose.connection.close(() => {
    logger.info('Mongoose disconnected');
  });
}

function resolveEnvUrl(config) {
  if (config.condition && !process.env[config[config.condition]]) {
    return false;
  }

  let mongodbUri = 'mongodb://';
  if (process.env[config.username]) {
    mongodbUri += process.env[config.username];

    if (process.env[config.password]) {
      mongodbUri += `:${process.env[config.password]}`;
    }
    mongodbUri += '@';
  }

  mongodbUri += `${process.env[config.host] || '127.0.0.1'}:${process.env[config.port] || 27017}/${process.env[config.name] || config.dbName}`;

  return mongodbUri;
}

function getMongodbUri(config = {}) {
  let uri = '';
  switch (config.type) {
    case 'fun': {
      uri = config.fun();
      break;
    }
    case 'env': {
      uri = resolveEnvUrl(config);
      break;
    }
    case 'uri': {
      return config.uri;
    }
    default: {
      break;
    }
  }

  if (uri && uri !== false) {
    return uri;
  }

  return `mongodb://127.0.0.1:27017/${config.dbName}`;
}

let mongodbUri = getMongodbUri(config.env.mongo);

logger.info('connect mongodbUri: ', mongodbUri);

let db = mongoose.connect(mongodbUri);

function define(modelName, opt, config) {
  // eslint-disable-next-line no-param-reassign
  config = _.assign({
    timestamps: true,
    set: {
      toJSON: {
        transform(doc, ret) {
          /* eslint-disable no-underscore-dangle */
          ret.id = ret._id;
        },
      },
    },
  }, config);

  let modelNameSchema = new mongoose.Schema(opt, {
    timestamps: config.timestamps,
  });

  if (config.index) {
    modelNameSchema.index(...config.index);
  }

  if (config.pre && _.isPlainObject(config.pre)) {
    _.forEach(config.pre, (value, key) => {
      modelNameSchema.pre(key, value);
    });
  }

  if (config.post && _.isPlainObject(config.post)) {
    _.forEach(config.post, (value, key) => {
      modelNameSchema.post(key, value);
    });
  }

  if (config.set && _.isPlainObject(config.set)) {
    _.forEach(config.set, (value, key) => {
      modelNameSchema.set(key, value);
    });
  }

  let modelNameModel = db.model(modelName, modelNameSchema);

  return {
    model: modelNameModel,
    schema: modelNameSchema,
  };
}

module.exports = {
  mongoose,
  Types: mongoose.Schema.Types,
  db,
  define,
  closeMongoose: close,
};
