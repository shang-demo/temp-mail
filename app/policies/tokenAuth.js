const jwt = require('jsonwebtoken');

function getTokenFromHeader(ctx) {
  let bearerHeader = ctx.headers.authorization;
  if (!bearerHeader) {
    return null;
  }

  let bearer = bearerHeader.split(' ');
  return bearer[1];
}

module.exports = (options = {}) => {
  const superSecret = options.superSecret || config.superSecret;

  return async(ctx, next) => {
    if (ctx.method === 'OPTIONS') {
      ctx.body = '';
      return;
    }

    let token = ctx.request.body.token || ctx.query.token || getTokenFromHeader(ctx);

    if (!token) {
      ctx.wrapError(new ApplicationError.TokenNotFound(), null, 401);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        jwt.verify(token, superSecret, (err, decoded) => {
          if (err) {
            logger.warn(err);
            return reject(new ApplicationError.TokenNotVerify());
          }

          ctx.request.user = decoded;
          ctx.request.userId = decoded && decoded.id;

          if (!ctx.request.user || !ctx.request.userId) {
            return reject(new ApplicationError.UserNotFound());
          }

          return resolve();
        });
      });

      await next();
    }
    catch (e) {
      ctx.wrapError(e);
    }
  };
};
