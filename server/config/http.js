const bodyparser = require('koa-bodyparser')();
const koaStatic = require('koa-static');
const path = require('path');
const views = require('koa-views');
const cors = require('kcors');

module.exports.http = {
  middlewares: [
    function anonymous() {
      return async (ctx, next) => {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        logger.trace(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
      };
    },
    function anonymous() {
      return koaStatic(mKoa.config.paths.public || path.join(__dirname, '../../client'));
    },
    function anonymous() {
      return views(path.join(__dirname, '../views'), {
        extension: 'html',
      });
    },
    function anonymous() {
      return cors();
    },
    function anonymous() {
      return bodyparser;
    },
  ],
};
