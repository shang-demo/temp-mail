const path = require('path');
const mailSendService = require('../services/mailSendService.js');
const utilitiesService = require('../services/utilitiesService.js');

const env = (process.env.NODE_ENV || 'development').trim();
const helpInfo = {
  cmds: [{
    name: 'update',
    option: 'update-X.X.X',
    argStr: '参数',
    detail: '使用 name 和 option 执行某update',
  }, {
    name: 'userDefine',
    option: '{cmd: xxx, arg: xxx}',
    detail: '使用spawn(cmd, arg) 执行命令 ',
  }],
  isWait: '是否等待命令执行完毕, bool, 默认false',
  email: '命令执行完毕后将结果发送至此email',
};

function userDefine(userOptionObj) {
  if (userOptionObj.cmd && userOptionObj.arg) {
    if (!_.isArray(userOptionObj.arg)) {
      // eslint-disable-next-line no-param-reassign
      userOptionObj.arg = [userOptionObj.arg];
    }

    return {
      cmd: (`${userOptionObj.cmd}`).trim(),
      arg: userOptionObj.arg,
    };
  }
  return null;
}

function updateFun(str, argStr) {
  let arg = [path.resolve(__dirname, '../updates/', str)];
  if (argStr) {
    arg.push(argStr);
  }
  if (/update-\d+/.test(str)) {
    return {
      name: str,
      cmd: 'node',
      arg,
    };
  }
  return null;
}

function execCmds(option) {
  let cmds = option.cmds;
  let isWait = option.isWait;
  let email = option.email;

  if (!_.isArray(cmds)) {
    return Promise.reject(new ApplicationError.ExecCmdParamError());
  }

  return new Promise((resolve, reject) => {
    if (!isWait) {
      resolve({
        msg: `正在执行中, ${email}` ? (`执行结果发送至: ${email}`) : '无邮箱提醒',
      });
      // eslint-disable-next-line no-param-reassign
      resolve = _.noop;
    }

    return Promise
      .mapSeries(analyseCmd(cmds), item => utilitiesService.spawnAsync(item).reflect())
      .then(data => wrapResult(data, email))
      .then((data) => {
        if (isWait) {
          resolve(data);
        }
      })
      .catch((e) => {
        logger.info(e);
        if (isWait) {
          reject(e);
        }
      });
  });
}

function wrapResult(arr, email) {
  let successResult = [];
  let errResult = [];
  arr.forEach((inspection) => {
    if (inspection.isFulfilled()) {
      successResult.push(inspection.value());
    }
    else {
      errResult.push(inspection.reason());
    }
  });

  let str = '';
  if (errResult.length) {
    str += `failed: ${errResult.length}    `;
  }

  str += `successed: ${successResult.length}    `;
  str += `all: ${arr.length}`;

  let body = `${str}\n${errResult.concat(successResult)}`;

  return Promise
    .resolve()
    .then(() => {
      if (email) {
        return mailSendService.sendMail({
          subject: str,
          html: `<p>${new Date().toLocaleString()}</p>${body}`,
        });
      }
      return null;
    })
    .then(() => body);
}

function analyseCmd(arr) {
  return arr.map((obj) => {
    if (!obj || !_.isObject(obj)) {
      return null;
    }
    if (obj.name === 'update') {
      return updateFun(obj.option, obj.argStr);
    }
    return userDefine(obj.option);
  });
}

function tryAutoDeploy(body) {
  let ref = (body.ref || '').replace('refs/heads/', '');
  if (!ref || ref !== _.get(config, 'env.update.ref')) {
    return Promise.resolve('not match');
  }
  let url = _.get(body, 'repository.https_url');
  let name = _.get(body, 'repository.name');
  let appPath = env === 'development' ? 'app/app.js' : 'app.js';
  if (!url || !name) {
    return Promise.reject(new Error('no url or no name'));
  }

  let dir = path.resolve(__dirname, '../');
  let cmds = [
    `cd ${dir}`,
    `git pull origin ${ref}`,
    `pm2 restart ${appPath}`,
  ];

  return mailSendService
    .sendMail({
      subject: `开始部署：${name}/${ref}`,
      html: `<p>${new Date().toLocaleString()}</p>`,
    })
    .then(() => utilitiesService.execAsync(cmds.join(' && ')))
    .catch((e) => {
      logger.info(e);
      return mailSendService.sendMail({
        subject: '自动部署失败',
        html: `<p>${new Date().toLocaleString()}</p>${JSON.stringify(e)}`,
      });
    });
}

module.exports = {
  execCmds,
  tryAutoDeploy,
  helpInfo,
};
