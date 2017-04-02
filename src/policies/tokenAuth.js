const jwt = require('jwt-simple');

function getTokenFromHeader(ctx) {
  let bearerHeader = ctx.headers.authorization;
  if (!bearerHeader) {
    return null;
  }

  let bearer = bearerHeader.split(' ');
  return bearer[1];
}

function getTokenFromCookie(ctx) {
  return ctx.cookies.get('token');
}

const tokenAuth = (options = {}) => {
  const superSecret = (options.auth && options.auth.superSecret) || 'SUPER_SECRET';

  return async (ctx, next) => {
    if (ctx.method === 'OPTIONS') {
      ctx.body = '';
      return undefined;
    }

    let token = ctx.request.body.token ||
      ctx.query.token ||
      getTokenFromHeader(ctx) ||
      getTokenFromCookie(ctx);

    if (!token) {
      ctx.wrapError(new Errors.TokenNotFound(), null, 401);
      return undefined;
    }

    try {
      let decoded = jwt.decode(token, superSecret);

      if (!decoded || !decoded.id || !decoded.expiresAt) {
        throw new Errors.TokenNotVerify();
      }

      if (new Date(decoded.expiresAt) <= new Date()) {
        return new Errors.TokenExpires();
      }

      ctx.request.user = decoded;
      ctx.request.userId = decoded && decoded.id;

      await next();
    }
    catch (e) {
      ctx.wrapError(e);
    }
    return undefined;
  };
};

module.exports = tokenAuth(mKoa.config);
