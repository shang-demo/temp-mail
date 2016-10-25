/**
 * WebhookController
 *
 */

const webhookModel = require('../models/webhookModel');
const hookService = require('../services/hookService');
const utilitiesService = require('../services/utilitiesService');

const ctrl = {
  query(ctx) {
    let opt = {};

    let search = ctx.query.search;
    if (search) {
      opt.condition = {
        $or: [{
          name: utilitiesService.escapeRegExp(search),
        }],
      };
    }

    /* eslint max-len: ["error", 120]*/
    return utilitiesService.conditionQuerySend(webhookModel, ctx, new ApplicationError.QueryError(), opt);
  },
  get(ctx) {
    webhookModel
      .findOne({
        _id: ctx.params.id,
      })
      .then((data) => {
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e, new ApplicationError.GetError()));
  },
  create(ctx) {
    let webhook = ctx.request.body;

    webhookModel
      .create(webhook)
      .then((data) => {
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e, new ApplicationError.CreateError()));
  },
  update(ctx) {
    let webhook = ctx.request.body;

    webhookModel.update({
      _id: webhook.id,
    }, webhook)
      .then((data) => {
        ctx.body = data[0];
      })
      .catch(e => ctx.wrapError(e, new ApplicationError.UpdateError()));
  },
  destroy(ctx) {
    let id = ctx.params.id;
    let webHook;
    webhookModel
      .findOne({
        _id: id,
      })
      .then((data) => {
        if (!data) {
          return new ApplicationError.NotFoundWebhook();
        }
        webHook = data;
        return data.remove();
      })
      .then(() => hookService.on('Webhook:afterDestroy', webHook))
      .then(() => {
        ctx.body = {};
      })
      .catch(e => ctx.wrapError(e, new ApplicationError.DeleteError()));
  },
  queryEvent(ctx) {
    ctx.body = _.map(hookService.events, value => value);
  },
};

module.exports = ctrl;

