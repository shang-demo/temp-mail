const cors = require('kcors');
const router = require('koa-router')();
const execCmdAuth = require('../policies/execCmdAuth');

const executeCmdController = require('../controllers/executeCmdController.js');
const tokenAuth = require('../policies/tokenAuth.js');
const webhookController = require('../controllers/webhookController');
const wrapError = require('../policies/wrapError.js');

router
  .use(cors())
  .use(wrapError)
  .get('view index html', /^\/(?!api)/, async(ctx) => {
    await ctx.render('index.html');
  })
  .all('/api/:version(v\\d+)/cmds', execCmdAuth())
  .get('/api/:version(v\\d+)/cmds', executeCmdController.help)
  .post('/api/:version(v\\d+)/cmds', tokenAuth(), executeCmdController.execCmds)
  .post('/api/:version(v\\d+)/auto-deploy', (ctx) => {
    ctx.body = 'ok';

    executeCmdController
      .tryAutoDeploy(ctx.request.body)
      .then((data) => {
        logger.info(data);
      })
      .catch((e) => {
        logger.info(e);
      });
  })
  .get('/api/v1/webhook-event', webhookController.queryEvent)
  .get('/api/v1/webhook', webhookController.query)
  .get('/api/v1/webhook/:id', webhookController.get)
  .post('/api/v1/webhook', webhookController.create)
  .put('/api/v1/webhook/:id', webhookController.update)
  .delete('/api/v1/webhook/:id', webhookController.destroy)
;


module.exports = router;
