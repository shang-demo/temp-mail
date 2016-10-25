module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  plugins: [],
  globals: {
    _: false,
    ApplicationError: false,
    config: false,
    logger: false,
    Promise: false,
  },
  rules: {
    'brace-style': ['error', 'stroustrup'],
    'no-use-before-define': ['error', {
      functions: false,
    }],
    'no-param-reassign': ['error', {
      props: false,
    }],
    'prefer-const': ['off'],
  },
};