const fs = require('mz/fs');
const path = require('path');
const Promise = require('bluebird');

module.exports = function filePathOneLayer(modelsPath) {
  return fs.readdir(modelsPath)
    .then(fileNames => Promise
        .map(fileNames, (fileName) => {
          let filePath = path.join(modelsPath, fileName);

          let extname = path.extname(filePath);
          if (extname !== '.js') {
            return null;
          }

          return fs.stat(filePath)
            .then(stat => ({
              basename: fileName.replace(/\.js/i, ''),
              name: fileName,
              path: filePath,
              stat,
            }));
        })
        .filter(file => file && file.stat && file.stat.isFile()));
};
