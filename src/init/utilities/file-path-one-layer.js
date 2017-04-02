const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

module.exports = function filePathOneLayer(modelsPath) {
  return Promise
    .try(() => {
      return fs.readdirAsync(modelsPath);
    })
    .then((fileNames) => {
      return Promise
        .map(fileNames, (fileName) => {
          let filePath = path.join(modelsPath, fileName);

          let extname = path.extname(filePath);
          if (extname !== '.js') {
            return null;
          }

          return fs.statAsync(filePath)
            .then((stat) => {
              return {
                basename: fileName.replace(/\.js/i, ''),
                name: fileName,
                path: filePath,
                stat,
              };
            });
        })
        .filter((file) => {
          return file && file.stat && file.stat.isFile();
        });
    });
};
