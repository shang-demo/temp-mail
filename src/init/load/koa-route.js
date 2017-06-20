const _ = require('lodash');
const http = require('http');
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
      return;
    }

    let actionParts = action.split('.');
    let controllerName = actionParts[0];
    let controller = this.controllers[controllerName];

    if (!controller) {
      throw new Error(`undefined controller: ${controllerName}`);
    }

    let actionMethodName = actionParts[1];
    let actionMethod = controller[actionMethodName].bind(controller);

    if (!actionMethod) {
      throw new Error(`undefined action method: ${action}`);
    }

    let policies = (this.controllerActionPolicies && this.controllerActionPolicies[`${controllerName}.${actionMethodName}`]) || [];

    router[method](...[pattern].concat(policies).concat(actionMethod));
  });

  this.app.use(router.routes());
  this.app.use(router.allowedMethods());

  const port = this.config.port;
  const host = this.config.host;
  // eslint-disable-next-line no-multi-assign
  const server = this.server = http.createServer(this.app.callback());

  server.listen(port, host);
  server.on('error', onError);
  server.on('listening', () => {
    onListening();
    this.emit('listening');
  });

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    let bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
      case 'EACCES':
        bind += ' requires elevated privileges';
        logger.error(bind);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        bind += ' is already in use';
        logger.error(bind);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  function onListening() {
    const addr = server.address();
    let bind = '';
    if (typeof addr === 'string') {
      bind = `'pipe ${addr}`;
    }
    else {
      if (addr.address === '::') {
        bind += `${addr.family} `;
        addr.address = '127.0.0.1';
      }

      bind += `http://${addr.address}:${addr.port}`;
    }

    logger.debug(`Listening on: ${bind}`);
  }
}


module.exports = lift;

