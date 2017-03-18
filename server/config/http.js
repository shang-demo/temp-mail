const bodyparser = require('koa-bodyparser');
const koaStatic = require('koa-static');
const path = require('path');
const views = require('koa-views');
const cors = require('kcors');

module.exports.http = {
  middlewares: [
    function requestLog() {
      return async(ctx, next) => {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        logger.trace(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
        if (mKoa.config.log.body) {
          // eslint-disable-next-line no-underscore-dangle
          if (ctx.body._readableState) {
            logger.trace('body send buffer');
          }
          else {
            logger.trace('body: ', ctx.body);
          }
        }
      };
    },
    function froentEnd() {
      return koaStatic(mKoa.config.paths.public || path.join(__dirname, '../../client'));
    },
    function indexViews() {
      return views(path.join(__dirname, '../views'), {
        extension: 'html',
      });
    },
    cors,
    bodyparser,
  ],
};
