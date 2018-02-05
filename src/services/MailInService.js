const WebSocketClient = require('./WebSocketClient');

const svc = {
  lift() {
    const wsc = new WebSocketClient();
    wsc.open(mKoa.config.mail.in.url);
    wsc.onmessage = function onMessage(data) {
      svc.delivery(UtilService.tryParseJsonObject(data, {}))
        .catch((e) => {
          logger.warn(e);
        });
    };

    return Promise.resolve();
  },
  async delivery(opt) {
    let to = _.get(opt, 'to.value', []);

    return Promise.map(to, async(item) => {
      let shortId = await svc.parseShortId(item.address);
      if (!shortId) {
        logger.warn('no shortId: ', opt);
      }
      else {
        mKoa.socketIO.emit({ shortId }, opt, 'mailIn');
      }
    });
  },
  async parseShortId(address) {
    let matches = address.match(/([\w._+-]+)@[\w._+-]+/i);
    return matches && matches[1];
  },
};


module.exports = svc;

