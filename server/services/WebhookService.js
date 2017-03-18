const rp = require('request-promise');

const svc = {
  lift() {
    return HookService.registerHook(svc.on.bind(svc));
  },
  resolveValue(body, data) {
    if (!body) {
      return null;
    }
    return _.reduce(body, (result, item) => {
      if (!item.value) {
        return result;
      }

      /* eslint-disable no-param-reassign */
      item.value = item.value.trim();
      if (/^{{(.*)}}$/gi.test(item.value)) {
        result[item.name] = _.get(data, RegExp.$1, '');
      }
      else {
        result[item.name] = item.value;
      }
      return result;
    }, {});
  },
  runHook(data, hook) {
    let method = (hook.method || 'POST').toUpperCase();
    let contentType = hook.contentType || 'application/json';
    let body;

    return Promise
      .try(() => {
        if (!hook.payloadAddress) {
          return Promise.reject(new Errors.NoPayloadAddress());
        }

        if (hook.resolveBody) {
          body = svc.resolveValue(hook.bodyFields, data);
        }
        else {
          body = data;
        }

        // mail
        if (method === 'EMAIL') {
          logger.info('hook sendMail to ', hook.name, 'body: ', body);
          return MailSendService.sendMail({
            subject: `webhook: ${hook.name}`,
            html: `<div>${JSON.stringify(body, null, 2)}</div>`,
          });
        }

        // http 请求
        let options = {
          proxy: false,
          followRedirect: false,
          url: hook.payloadAddress,
          method,
          headers: svc.resolveValue(hook.headerFields, data),
        };

        if (method === 'GET') {
          return rp(options);
        }

        switch (contentType) {
          case 'application/json':
            options.json = body || true;
            break;
          case 'application/x-www-form-urlencoded':
            options.form = body;
            break;
          default:
            // eslint-disable-next-line max-len
            return Promise.reject(new Errors.NotSupportContentType(undefined, { contentType }));
        }

        return rp(options);
      });
  },
  runHooks(data, hooks) {
    return Promise.map(hooks, (hook) => {
      return svc.runHook(data, hook).reflect();
    });
  },
  on(data, conditions, projection, options) {
    // not care the result
    Webhook
      .find(conditions, projection, options)
      .then((hooks) => {
        if (!hooks || !hooks.length) {
          return Promise.reject('no hooks');
        }

        return svc.runHooks(data, hooks);
      })
      .each((item) => {
        if (item.isFulfilled()) {
          logger.info('Webhook success: ', JSON.stringify(conditions, null, 2));
        }
        else {
          logger.info('Webhook error: ', conditions, JSON.stringify(item, null, 2), item.reason());
        }
        return null;
      })
      .catch((e) => {
        logger.info(e);
      });

    return Promise.resolve(null);
  },
};

module.exports = svc;
