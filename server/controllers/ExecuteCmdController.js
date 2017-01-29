const jwt = require('jwt-simple');

const ctrl = {
  execCmd(ctx) {
    return ExecuteCmdService
      .execCmd(ctx.request.body)
      .then((data) => {
        logger.info('execCmd data:    ', data);
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e));
  },
  help(ctx) {
    ctx.body = ExecuteCmdService.helpInfo;
  },
  tryAutoDeploy: ExecuteCmdService.tryAutoDeploy,
  generateToken(ctx) {
    let user = _.assign(ctx.request.body, ctx.request.query);

    let payload = {
      id: user.id,
      expiresAt: (new Date().getTime() + ((mKoa.config.auth.tokenExpiresIn || 7200) * 1000)),
    };

    let token = jwt.encode(payload, mKoa.config.auth.superSecret);

    ctx.cookies.set('token', token, {
      signed: false,
      expires: new Date(payload.expiresAt),
    });
    ctx.body = {
      token,
      expiresIn: mKoa.config.auth.tokenExpiresIn || 7200,
    };
  },
};

module.exports = ctrl;
