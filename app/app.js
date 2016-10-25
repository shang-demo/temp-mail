require('./config/globalInit');

const Koa = require('koa');

const app = new Koa();
const bodyparser = require('koa-bodyparser')();
const http = require('http');
const koaStatic = require('koa-static');
const path = require('path');
const views = require('koa-views');

const bootStrap = require('./config/bootstrap');
const router = require('./routes/routes');

async function init() {
  await bootStrap();

  app.use(bodyparser);

  app.use(koaStatic(path.join(__dirname, 'public')));
  app.use(views(path.join(__dirname, 'views'), {
    extension: 'html',
  }));


  // request logger
  app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    logger.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
  });


  app.use(router.routes());
  app.use(router.allowedMethods());

  app.on('error', (err, ctx) => {
    logger.error('server error', err, ctx);
  });

  await tryStart();

  return app;
}

function tryStart() {
  return new Promise((resolve, reject) => {
    const port = config.env.port || 1337;
    const ip = config.env.ip;

    const server = http.createServer(app.callback());
    server.listen(port, ip);

    server.on('error', onError);
    server.on('listening', onListening);

    function onError(error) {
      reject(error);

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

      logger.info(`Listening on: ${bind}`);
      resolve(app);
    }
  });
}

module.exports = init();
