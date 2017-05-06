const bodyParser = require('koa-bodyparser');
const cors = require('kcors');

module.exports.http = {
  middlewares: [
    function log() {
      return async (ctx, next) => {
        const start = new Date();
        let logs = [];

        await next();

        let ms = new Date() - start;
        logs.push(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);

        if (mKoa.config.log.responseBody) {
          logs.push('---');
          // eslint-disable-next-line no-underscore-dangle
          if (ctx.body && ctx.body._readableState) {
            logs.push('response send buffer');
          }
          else {
            logs.push(ctx.body || '');
          }
        }

        logger.trace(...logs);
      };
    },
    cors,
    bodyParser,
    function requestBodyLog() {
      if (!mKoa.config.log.requestBody) {
        return async (ctx, next) => {
          await next();
        };
      }

      return async (ctx, next) => {
        if (['POST', 'UPDATE', 'GET'].indexOf(ctx.method) === -1) {
          await next();
          return;
        }

        let logs = [`${ctx.method} ${ctx.url} -- query:`, ctx.request.query || {}];
        if (ctx.method === 'POST' || ctx.method === 'UPDATE') {
          logs.push('--- body:');
          logs.push(ctx.request.body || {});
        }
        logger.trace(...logs);

        await next();
      };
    },
  ],
};
