const path = require('path');
const jwt = require('jwt-simple');
const fs = require('fs-extra');

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
  let arg = ['--harmony-async-await', path.resolve(__dirname, '../updates/update'), str];
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

function execCmd(option) {
  let cmds = option.cmds;
  let isWait = option.isWait;
  let email = option.email;

  if (!_.isArray(cmds)) {
    return Promise.reject(new Errors.ExecCmdParamError());
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
      .mapSeries(analyseCmd(cmds), (item) => {
        return UtilService.spawnAsync(item).reflect();
      })
      .then((data) => {
        return wrapResult(data, email, option);
      })
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

function wrapResult(arr, email, option) {
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
        return MailSendService.sendMail({
          subject: str,
          html: `<p>${new Date().toLocaleString()}</p>${body}
                <p>${JSON.stringify(option)}</p>`,
        });
      }
      return null;
    })
    .then(() => {
      return body;
    });
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
  if (!ref || ref !== _.get(mKoa.config, 'update.ref')) {
    return Promise.resolve('not match');
  }
  let url = _.get(body, 'repository.https_url');
  let name = _.get(body, 'repository.name');
  let appPath = mKoa.environment === 'development' ? 'src/index.js' : 'index.js';
  if (!url || !name) {
    return Promise.reject(new Error('no url or no name'));
  }

  let dir = path.resolve(__dirname, '../');
  let cmds = [
    `cd ${dir}`,
    `git pull origin ${ref}`,
    `pm2 restart ${appPath}`,
  ];

  return MailSendService
    .sendMail({
      subject: `开始部署：${name}/${ref}`,
      html: `<p>${new Date().toLocaleString()}</p>`,
    })
    .then(() => {
      return UtilService.execAsync(cmds.join(' && '));
    })
    .catch((e) => {
      logger.info(e);
      return MailSendService.sendMail({
        subject: '自动部署失败',
        html: `<p>${new Date().toLocaleString()}</p>${JSON.stringify(e)}`,
      });
    });
}

let version;
async function getVersion() {
  if (!version) {
    version = await fs.readFile(path.join(__dirname, '../config/version.txt'))
      .then((buffer) => {
        return buffer.toString();
      })
      .catch(() => {
        return 'no version';
      });
  }

  return {
    env: process.env.NODE_ENV,
    version,
  };
}

function generateToken(user) {
  let payload = {
    id: user.id,
    expiresAt: (new Date().getTime() + ((mKoa.config.auth.tokenExpiresIn || 7200) * 1000)),
  };

  let token = jwt.encode(payload, mKoa.config.auth.superSecret);

  return {
    token,
    expiresIn: mKoa.config.auth.tokenExpiresIn || 7200,
  };
}

module.exports = {
  execCmd,
  tryAutoDeploy,
  helpInfo,
  getVersion,
  generateToken,
}
;
