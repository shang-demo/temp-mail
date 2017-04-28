const jwt = require('jwt-simple');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const ctrl = {
  version: '',
  execCmd(ctx) {
    return ExecuteCmdService
      .execCmd(ctx.request.body)
      .then((data) => {
        logger.info('execCmd data:    ', data);
        ctx.body = data;
      })
      .catch((e) => {
        return ctx.wrapError(e);
      });
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
  async deployVersion(ctx) {
    if (!ctrl.version) {
      ctrl.version = await fs
        .readFileAsync(path.join(__dirname, '../config/version.txt'))
        .then((buffer) => {
          return buffer.toString();
        })
        .catch(() => {
          return 'no version';
        });
    }

    ctx.body = {
      env: process.env.NODE_ENV,
      version: ctrl.version,
    };
  },
};

module.exports = ctrl;
