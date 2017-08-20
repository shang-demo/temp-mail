const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const {
  GraphQLBoolean,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
} = require('graphql');

const GraphQLJSON = require('graphql-type-json');

const svc = {
  isMongoError(err) {
    return err.name === 'MongoError';
  },
  isMongoDuplicateKeyError(err) {
    return err.code === 11000 && err.name === 'MongoError';
  },
  defer() {
    let resolve;
    let reject;
    let promise = new Promise((...param) => {
      resolve = param[0];
      reject = param[1];
    });
    return {
      resolve,
      reject,
      promise,
    };
  },
  spawnDefer(option) {
    let deferred = svc.defer();
    if (!option) {
      return deferred.reject(new Error('no option'));
    }

    if (option.platform) {
      // eslint-disable-next-line no-param-reassign
      option.cmd = (process.platform === 'win32' ? (`${option.cmd}.cmd`) : option.cmd);
    }
    let opt = {
      stdio: 'inherit',
    };
    // set ENV
    let env = Object.create(process.env);
    env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
    opt.env = env;

    let proc = spawn(option.cmd, option.arg, opt);
    deferred.promise.proc = proc;
    proc.on('error', (err) => {
      logger.info(err);
    });
    proc.on('exit', (code) => {
      if (code !== 0) {
        return deferred.reject(code);
      }
      return deferred.resolve();
    });
    return deferred.promise;
  },
  spawnAsync(option) {
    if (!option) {
      return Promise.reject(new Error('no option'));
    }

    return new Promise((resolve, reject) => {
      if (option.platform) {
        // eslint-disable-next-line no-param-reassign
        option.cmd = (process.platform === 'win32' ? (`${option.cmd}.cmd`) : option.cmd);
      }
      let opt = { stdio: 'inherit' };
      // set ENV
      let env = Object.create(process.env);
      env.NODE_ENV = option.NODE_ENV || process.env.NODE_ENV;
      opt.env = env;

      let cmd = spawn(option.cmd, option.arg, opt);
      cmd.on('error', (err) => {
        logger.error(err);
      });
      cmd.on('exit', (code) => {
        if (code !== 0) {
          return reject(code);
        }
        return resolve();
      });
    });
  },
  execAsync(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        return resolve(stdout || stderr);
      });
    });
  },
  promiseWhile: Promise.method((condition, action) => {
    if (!condition()) {
      return Promise.resolve(null);
    }
    return action().then(svc.promiseWhile.bind(null, condition, action));
  }),
  escapeRegExp(str, disAbleRegExp) {
    if (!str) {
      return null;
    }

    // eslint-disable-next-line no-param-reassign
    str = str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    if (disAbleRegExp === true) {
      return str;
    }

    return new RegExp(str, 'gi');
  },
  getConditions(ctx, { conditions = {}, projection, options }) {
    let opt = {
      sort: ctx.query.sort || { _id: -1 },
    };

    if (ctx.query.skip || ctx.query.page || ctx.query.limit) {
      opt.limit = parseInt(ctx.query.limit, 10) || 20;

      if (ctx.query.page) {
        opt.skip = opt.limit * (parseInt(ctx.query.page, 10) - 1);
      }
      else if (ctx.query.skip) {
        opt.skip = parseInt(opt.skip, 10);
      }

      opt.skip = opt.skip || 0;
    }

    opt = _.assign(opt, options);

    let query = {};

    let from = ctx.query.from;
    if (from) {
      query.createdAt = {
        $gte: new Date(from),
      };
    }

    let to = ctx.query.to;
    if (to) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(to);
    }

    query = _.assign(query, conditions);
    return {
      conditions: query,
      projection,
      options: opt,
    };
  },
  conditionsQuery(Model, ctx, opt = {}) {
    let { conditions, projection, options } = svc.getConditions(ctx, opt);

    return Promise
      .props({
        total: Model.count(conditions),
        data: Model.find(conditions, projection, options),
      })
      .then((result) => {
        if (opt.filter) {
          result.data = opt.filter(result.data);
        }
        return result;
      });
  },
  conditionsQuerySend(Model, ctx, error, opt = {}) {
    return svc.conditionsQuery(Model, ctx, opt)
      .then((result) => {
        let totalName = opt.totalName || 'x-total';
        ctx.set(totalName, result.total);
        return result.data;
      })
      .then((data) => {
        ctx.body = data;
      })
      .catch((e) => {
        return ctx.wrapError(e, error);
      });
  },
  /**
   * @param attributes
   * @param omit 去除部分属性
   * @param pick 选择部分属性, 同时omit失效
   * @param nonNull 这些属性不为空
   * @param extra     额外属性, 覆盖原有
   * @param _id         objectId
   * @param timestamps createdAt && updatedAt
   * @param plain 默认全部属性按照required来判断, 设置true则为可为空
   */
  buildGraphqlType(attributes, { omit, pick, nonNull, extra, plain,
    _id = true, timestamps = true }) {
    let types = _.reduce(attributes, (result, item, key) => {
      switch (item.type) {
        case String:
          result[key] = {
            type: GraphQLString,
          };
          break;
        case Boolean:
          result[key] = {
            type: GraphQLBoolean,
          };
          break;
        case Number: {
          result[key] = {
            type: GraphQLFloat,
          };
          break;
        }
        case Array:
        case Mixed: {
          result[key] = {
            type: GraphQLJSON,
          };
          break;
        }
        case ObjectId:
        case ObjectID: {
          result[key] = {
            type: GraphQLID,
          };
          break;
        }
        default: {
          logger.warn('not match type: ', item.type);
        }
      }

      if (item.required && !plain) {
        result[key] = {
          type: new GraphQLNonNull(result[key].type),
        };
      }

      return result;
    }, {});

    if (_id) {
      types._id = {
        type: GraphQLString,
      };
    }

    if (timestamps) {
      types.createdAt = {
        type: GraphQLString,
      };
      types.updatedAt = {
        type: GraphQLString,
      };
    }

    if (nonNull && nonNull.length) {
      nonNull.forEach((key) => {
        if (!types[key]) {
          logger.warn(`${key} not found`);
          return null;
        }

        // 本身为 GraphQLNonNull;
        if (/!$/.test(types[key].type.toString())) {
          return null;
        }

        types[key] = {
          type: new GraphQLNonNull(GraphQLJSON),
        };
        return null;
      });
    }

    if (extra) {
      _.assign(types, extra);
    }

    if (pick) {
      return _.pick(types, pick);
    }
    else if (omit) {
      return _.omit(types, pick);
    }

    return types;
  },
};

module.exports = svc;
