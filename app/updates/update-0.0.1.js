
const dbService = require('../services/dbService');

require('../config/globalInit.js');

function closeConnection() {
  dbService.closeMongoose();
}

Promise
  .resolve()
  .finally(() => {
    closeConnection();
  });

