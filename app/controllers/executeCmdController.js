const executeCmdService = require('../services/executeCmdService.js');

const ctrl = {
  execCmds(ctx) {
    return executeCmdService
      .execCmds(ctx.request.body)
      .then((data) => {
        logger.info('execCmd data:    ', data);
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e));
  },
  help(ctx) {
    ctx.body = executeCmdService.helpInfo;
  },
  tryAutoDeploy: executeCmdService.tryAutoDeploy,
};

module.exports = ctrl;
