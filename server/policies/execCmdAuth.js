const execCmdAuth = (options = {}) => {
  const execCmdKey = options.execCmdKey || 'key';

  return async (ctx, next) => {
    if ((ctx.query.key || ctx.request.body.key) === execCmdKey) {
      await next();
    }
    else {
      ctx.status = 400;
      ctx.body = new Errors.ExecCmdKeyNotMatch();
    }
  };
};


module.exports = execCmdAuth(mKoa.config);
