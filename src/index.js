const My = require('./init/index');

const lift = new My({ alias: 'mKoa' })
  .use('config')
  .use('logger')
  .use('errors')
  // .use('model')
  .use('service')
  .use('bootstrap')
  .use('graphql-policy')
  .use('graphql-schema')
  .use('graphql-route')
  .use('koa')
  .use('koa-route')
  .on('error', (e) => {
    // eslint-disable-next-line no-console
    console.warn(e);
    process.exit(1);
  })
  .lift();

module.exports = lift;
