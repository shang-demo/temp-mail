module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  plugins: [],
  globals: {
    _: false,
    config: false,
    Errors: false,
    ExecuteCmdService: false,
    HookService: false,
    logger: false,
    MailSendService: false,
    mKoa: false,
    Promise: false,
    Webhook: false,
    UtilService: false,
  },
  rules: {
    'brace-style': ['error', 'stroustrup'],
    'no-use-before-define': ['error', {
      functions: false,
    }],
    'no-param-reassign': ['error', {
      props: false,
    }],
    'no-underscore-dangle': ['error', {
      'allow': ['_id', '_scan']
    }],
    'prefer-const': ['off'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'ignore',
    }],
  },
};