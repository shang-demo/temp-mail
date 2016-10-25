function isApplicationError(e) {
  return e instanceof ApplicationError;
}

function wrapError(e, otherError, errStatus) {
  logger.warn(e);

  if (isApplicationError(e)) {
    this.body = e;
    this.status = errStatus || 400;
    return;
  }

  if (otherError) {
    this.body = otherError;
    this.status = otherError.status || 400;
    return;
  }

  this.body = new ApplicationError.UnknownError();
  this.status = 400;
}

module.exports = async(ctx, next) => {
  ctx.isApplicationError = isApplicationError;
  ctx.wrapError = wrapError;
  await next();
};
