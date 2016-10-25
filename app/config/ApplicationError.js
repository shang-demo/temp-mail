/**
 * ApplicationError
 *
 */
const util = require('util');

const errors = {
  SystemBusy: { code: -1, message: 'system busy, retry later' },
  Success: { code: 0, message: 'success' },
  UnknownError: { code: 1, message: 'unknown error, need feedback' },
  InternalError: { code: 1, message: 'internal error, contact us' },
  RequireAppKey: { code: 10001, message: 'require appKey' },
  RequireAppSecret: { code: 10002, message: 'require appSecret' },
  InvalidAppKey: { code: 10004, message: 'invalid appKey' },
  InvalidAppSecret: { code: 10005, message: 'invalid appSecret' },
  // global
  QueryError: { code: 100101, message: '查询列表出错' },
  GetError: { code: 100102, message: '查询详情出错' },
  CreateError: { code: 100103, message: '创建出错' },
  UpdateError: { code: 100104, message: '更新出错' },
  DeleteError: { code: 100105, message: '删除出错' },
  // tokenAuth
  TokenNotFound: { code: 100201, message: 'token未找到' },
  TokenNotVerify: { code: 100202, message: 'token无法验证' },
  UserNotFound: { code: 100203, message: '无法找到用户' },
  // WebhookController
  NotFoundWebhook: { code: 200101, message: '无法找到对应的webhook' },
  // WebHookService
  NoPayloadAddress: { code: 200201, message: '没有发送地址' },
  NotSupportContentType: { code: 200201, message: '不支持此种类型' },
  // executeCmdService
  ExecCmdKeyNotMatch: { code: 200301, message: '无权限执行命令' },
  ExecCmdParamError: { code: 200302, message: '参数错误, 请使用help命令查看如何使用' },

};

function ApplicationError() {
}

util.inherits(ApplicationError, Error);

function buildErrorType(errorConfig, errorName) {
  function ConcreteCustomError(extra, message) {
    Error.captureStackTrace(this, this.constructor);

    this.name = errorName || this.constructor.name;
    this.message = message || errorConfig.message;

    this.extra = extra;
    this.code = errorConfig.code;
  }

  util.inherits(ConcreteCustomError, ApplicationError);
  return ConcreteCustomError;
}

_.forEach(errors, (errorConfig, errorName) => {
  ApplicationError[errorName] = buildErrorType(errorConfig, errorName);
});

module.exports = ApplicationError;
