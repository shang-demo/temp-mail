const ctrl = {
  query(ctx) {
    let opt = {};

    let search = ctx.query.search;
    if (search) {
      opt.condition = {
        $or: [{
          name: UtilService.escapeRegExp(search),
        }],
      };
    }

    /* eslint max-len: ["error", 120]*/
    return UtilService.conditionQuerySend(Webhook, ctx, new Errors.QueryError(), opt);
  },
  get(ctx) {
    Webhook
      .findOne({
        _id: ctx.params.id,
      })
      .then((data) => {
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e, new Errors.GetError()));
  },
  create(ctx) {
    let webhook = ctx.request.body;

    Webhook
      .create(webhook)
      .then((data) => {
        ctx.body = data;
      })
      .catch(e => ctx.wrapError(e, new Errors.CreateError()));
  },
  update(ctx) {
    let webhook = ctx.request.body;

    Webhook.update({
      _id: webhook.id,
    }, webhook)
      .then((data) => {
        ctx.body = data[0];
      })
      .catch(e => ctx.wrapError(e, new Errors.UpdateError()));
  },
  destroy(ctx) {
    let id = ctx.params.id;
    let webHook;
    Webhook
      .findOne({
        _id: id,
      })
      .then((data) => {
        if (!data) {
          return new Errors.NotFoundWebhook();
        }
        webHook = data;
        return data.remove();
      })
      .then(() => HookService.on('Webhook:afterDestroy', webHook))
      .then(() => {
        ctx.body = {};
      })
      .catch(e => ctx.wrapError(e, new Errors.DeleteError()));
  },
  queryEvent(ctx) {
    ctx.body = _.map(HookService.events, value => value);
  },
};

module.exports = ctrl;

