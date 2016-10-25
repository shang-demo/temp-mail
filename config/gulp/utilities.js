const chalk = require('chalk');
const logSymbols = require('log-symbols');
const notifier = require('node-notifier');
const through2 = require('through2');

let _filenames = {};

const svc = {
  eshintReporter(result) {
    var isNotify = false;
    if (result.messages.length) {
      result.messages.forEach((item) => {
        let location = `${result.filePath.replace(/.*?\/(?=app\/)/, '')}:${item.line}:${item.column}`;
        let ruleId = `${item.ruleId}`;
        let message = `${item.message}`;

        if(item.severity === 1) {
          console.log(`${chalk.yellow(location)}\n${chalk.blue(ruleId)} ${chalk.gray(message)}\n`);
        }
        else {
          console.log(`${chalk.red(location)}\n${chalk.blue(ruleId)} ${chalk.gray(message)}\n`);
        }


        if(!isNotify) {
          isNotify = true;
          notifier.notify({
            title:`${message}    ${svc.dateFormat('hh:mm:ss')}`,
            subtitle: ruleId,
            message: location,
          });
        }

      });
    }
  },
  jshintReporter: {
    reporter(result, config, options) {
      let total = result.length;
      let ret = '';
      let errorCount = 0;
      let warningCount = 0;

      options = options || {};

      ret += `${result.map((el, i) => {
        let err = el.error;
        // E: Error, W: Warning, I: Info
        let isError = err.code && err.code[0] === 'E';

        let line = [
          chalk.yellow(`${el.file}:${err.line}:${err.character}`),
          '\n',
          isError ? chalk.red(err.reason) : chalk.blue(err.reason),
        ];

        if (options.verbose) {
          line.push(chalk.gray(`(${err.code})`));
        }

        if (isError) {
          errorCount++;
        }
        else {
          warningCount++;
        }

        return line.join('    ');
      }).join('\n')}\n\n`;

      if (total > 0) {
        if (errorCount > 0) {
          ret += `  ${logSymbols.error}  ${errorCount} error`;
        }
        ret += `  ${logSymbols.warning}  ${warningCount} warning`;
      }
      else {
        ret += `  ${logSymbols.success} No problems`;
        ret = `\n${ret.trim()}`;
      }

      if (errorCount + warningCount > 0) {
        notifier.notify({
          title: ret.replace(/.*\//gi, ''),
          subtitle: (errorCount ? (`err: ${errorCount}`) : '') + (warningCount ? (` warning: ${warningCount}`) : ''),
          message: svc.dateFormat('hh:mm:ss'),
          sound: false, // Case Sensitive string of sound file (see below)
          wait: false, // if wait for notification to end
        });
      }

      console.log(`\n${ret}\n`);
    },
  },
  dateFormat(fmt, date) {
    date = date || new Date();
    let o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'h+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds(), // 毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
    }

    for(let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
      }
    }

    return fmt;
  },
  addStoreFile(file, name, options) {
    name = name || 'default';
    options = options || {};

    if (options.overrideMode) {
      _filenames[name] = [];
    }
    _filenames[name] = _filenames[name] || [];
    _filenames[name].push({
      relative: file.relative,
      full: file.path,
      base: file.base,
    });
    return _filenames;
  },
  saveStoreFile(name, options) {
    options = options || {};
    return through2.obj(function (file, enc, done) {
      this.push(file);
      if (file.isNull()) {

      }
      if (file.isStream()) {

      }
      if (file.isBuffer()) {
        svc.addStoreFile(file, name, options);
      }
      return done(null, file);
    });
  },
  getStorePath(fileNames, pathOption) {
    fileNames = fileNames || [];
    return fileNames.map((fileName) => {
      return fileName[pathOption];
    });
  },
  getStoreFile(name, pathOption) {
    if (!name && !pathOption) {
      return _filenames;
    }
    if (!name) {
      return _filenames.map((file) => {
        return svc.getStorePath(file, pathOption);
      });
    }
    if (!pathOption) {
      return _filenames[name];
    }

    return svc.getStorePath(_filenames[name], pathOption);
  },
};

module.exports = svc;
