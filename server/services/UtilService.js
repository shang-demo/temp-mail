const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

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
  getCondition(ctx, { condition = {}, projection, options }) {
    let opt = {
      sort: ctx.query.sort || '-createdAt',
    };

    if (ctx.query.page || ctx.query.limit) {
      let meta = {
        page: parseInt(ctx.query.page, 10) || 1,
        limit: parseInt(ctx.query.limit, 10) || 20,
      };

      opt.skip = meta.limit * (meta.page - 1);
      opt.limit = meta.limit;
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

    query = _.assign(query, condition);
    return {
      condition: query,
      projection,
      options: opt,
    };
  },
  conditionQuery(Model, ctx, opt = {}) {
    let { condition, projection, options } = svc.getCondition(ctx, opt);

    return Promise
      .props({
        total: Model.count(condition),
        data: Model.find(condition, projection, options),
      })
      .then((result) => {
        if (opt.filter) {
          result.data = opt.filter(result.data);
        }
        return result;
      });
  },
  conditionQuerySend(Model, ctx, error, opt) {
    return svc.conditionQuery(Model, ctx, opt)
      .then((result) => {
        let totalName = opt.totalName || 'totalItems';
        ctx.set(totalName, result.total);
        return result.data;
      })
      .then((data) => {
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e, error));
  },
};

module.exports = svc;
