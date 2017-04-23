const bodyParser = require('koa-bodyparser');
const cors = require('kcors');

module.exports.http = {
  middlewares: [
    function log() {
      return async (ctx, next) => {
        const start = new Date();
        ctx.__logs__ = [];

        await next();

        let ms = new Date() - start;
        ctx.__logs__.unshift(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);

        if (mKoa.config.log.responseBody) {
          ctx.__logs__.push('---');
          // eslint-disable-next-line no-underscore-dangle
          if (ctx.body && ctx.body._readableState) {
            ctx.__logs__.push('response send buffer');
          }
          else {
            ctx.__logs__.push(ctx.body || '');
          }
        }

        logger.trace(...ctx.__logs__);
      };
    },
    cors,
    bodyParser,
    function requestBodyLog() {
      return async (ctx, next) => {
        if (mKoa.config.log.requestBody && ctx.method !== 'GET') {
          ctx.__logs__.push('--');
          ctx.__logs__.push(ctx.request.body || {});
        }

        await next();
      };
    }
  ],
};
