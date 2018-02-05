const _ = require('lodash');
const router = require('koa-router')();

function lift() {
  _.forEach((this.config.http || {}).middlewares || [], (middleware) => {
    if (_.isFunction(middleware)) {
      this.app.use(middleware());
      return;
    }

    if (_.isArray(middleware)) {
      let middlewareArr = _.map(middleware, (arg) => {
        if (_.isFunction(arg)) {
          return arg();
        }
        return arg;
      });

      this.app.use(middlewareArr);
    }
  });

  _.forEach(this.config.routes, (action, key) => {
    let method;
    let pattern;
    let index = key.indexOf(' ');
    let allMethods = ['all', 'get', 'post', 'put', 'delete', 'patch'];

    if (index > -1) {
      let keyParts = [key.slice(0, index), key.slice(index + 1)];
      method = (keyParts[0] || '').toLowerCase();
      pattern = keyParts[1];
    }
    else {
      method = 'all';
      pattern = key;
    }

    if (!(_.includes(allMethods, method))) {
      throw new Error(`invalid route method: ${method}`);
    }

    if (_.isFunction(action)) {
      router[method](...[pattern].concat(action));
    }
    else {
      throw new Error(`invalid route key: ${key}`);
    }
  });

  this.app.use(router.routes());
  this.app.use(router.allowedMethods());
}


module.exports = lift;

