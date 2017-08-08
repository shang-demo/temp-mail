
module.exports.routes = {

  // leancloud不使用云函数和Hook
  '/1.1/functions/_ops/metadatas': function leancloud(ctx) {
    ctx.status = 404;
  },

  // leancloud heartbeat
  '/__engine/*': function leancloud(ctx) {
    ctx.status = 200;
  },

  '/favicon.ico': function faviconIco(ctx) {
    ctx.status = 404;
  },

  // version
  '/version': async function version(ctx) {
    return ExecuteCmdService.getVersion()
      .then((data) => {
        ctx.body = data;
      })
      .catch((e) => {
        ctx.status = 400;
        ctx.body = e;
      });
  },

  '/': async function graphqlRoutes(...args) {
    return mKoa.graphql.routes(...args);
  },

  '/graphql': async function graphqlRoutes(...args) {
    return mKoa.graphql.routes(...args);
  },

  // 未找到
  '/*': async function viewHtml(ctx) {
    ctx.status = 404;
  },
};
