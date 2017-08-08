function isApplicationError(e) {
  return e instanceof Errors;
}

function wrapError(e) {
  if (isApplicationError(e)) {
    return e;
  }

  return new Errors.UnknownError({
    originErrMsg: e && e.message,
  });
}

module.exports = {
  type: 'catch',
  resolve: wrapError,
};
