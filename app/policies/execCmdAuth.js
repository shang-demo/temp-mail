module.exports = (options = {}) => {
  const execCmdKey = options.execCmdKey || config.env.execCmdKey;

  return async(ctx, next) => {
    if ((ctx.query.key || ctx.request.body.key) === execCmdKey) {
      await next();
    }
    else {
      ctx.status = 400;
      ctx.body = new ApplicationError.ExecCmdKeyNotMatch();
    }
  };
};
