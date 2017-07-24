const ctrl = {
  async query(ctx) {
    let opt = {};

    let search = ctx.query.search;
    if (search) {
      opt.condition = {
        $or: [{
          name: {
            $reg: UtilService.escapeRegExp(search),
            $options: 'gi',
          },
        }],
      };
    }

    /* eslint max-len: ["error", 120] */
    return UtilService.conditionsQuerySend(Webhook, ctx, new Errors.QueryError(), opt);
  },
  async get(ctx) {
    return Webhook
      .findOne({
        _id: ctx.params.id,
      })
      .then((data) => {
        ctx.body = data;
      })
      .catch((e) => {
        return ctx.wrapError(e, new Errors.GetError());
      });
  },
  async create(ctx) {
    let webhook = ctx.request.body;

    return Webhook
      .create(webhook)
      .then((data) => {
        ctx.body = data;
      })
      .catch((e) => {
        return ctx.wrapError(e, new Errors.CreateError());
      });
  },
  async update(ctx) {
    let webhook = ctx.request.body;

    return Webhook.update({
      _id: webhook.id,
    }, webhook)
      .then((data) => {
        ctx.body = data[0];
      })
      .catch((e) => {
        return ctx.wrapError(e, new Errors.UpdateError());
      });
  },
  async destroy(ctx) {
    let id = ctx.params.id;
    let webHook;
    return Webhook
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
      .then(() => {
        return HookService.on('Webhook:afterDestroy', webHook);
      })
      .then(() => {
        ctx.body = {};
      })
      .catch((e) => {
        return ctx.wrapError(e, new Errors.DeleteError());
      });
  },
  async queryEvent(ctx) {
    ctx.body = _.map(HookService.events, (value) => {
      return value;
    });
  },
};

module.exports = ctrl;

