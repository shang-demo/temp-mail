declare let _ = require('lodash');
declare let Promise = require('bluebird');
declare let logger = require('pino')();
declare let User = require('mongoose').Model;
declare let Webhook = require('mongoose').Model;
declare let Constants = require('Constants');
declare let ExecuteCmdService = require('ExecuteCmdService');
declare let HookService = require('HookService');
declare let MailSendService = require('MailSendService');
declare let RedisService = require('RedisService');
declare let UtilService = require('UtilService');
declare let WebhookService = require('WebhookService');
declare let mKoa = {
      config: require('config'),
      environment: {}
    };
