const dbService = require('../services/dbService.js');

const user = dbService.define('user', {
  username: {
    type: String,
    required: true,
    unique: true,
  },
});

const userModel = user.model;

module.exports = userModel;
