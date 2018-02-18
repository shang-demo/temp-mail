const simpleParser = require('mailparser').simpleParser;

const svc = {
  name: 'rabbitmq',
  lift() {
    return mKoa.rabbitmq
      .addConsume('email', (message) => {
        return svc.delivery(message);
      });
  },
  async delivery(message) {
    return simpleParser(message)
      .then((opt) => {
        return MailPersistenceService.save(opt, message, Mail.purposes.in)
          .then(() => {
            return opt;
          });
      })
      .then((opt) => {
        let to = _.get(opt, 'to.value', []);
        return Promise
          .map(to, async (item) => {
            let shortId = await svc.parseShortId(item.address);
            if (!shortId) {
              logger.warn('no shortId: ', opt);
            }
            else {
              mKoa.socketIO.emit({ shortId }, opt, 'mailIn');
            }
          });
      });
  },
  async parseShortId(address) {
    let matches = address.match(/([\w._+-]+)@[\w._+-]+/i);
    return matches && matches[1];
  },

  async query(shortId) {
    let conditions = {
      'to.value.address': `${shortId}@${mKoa.config.mail.domain}`,
      purpose: Mail.purposes.in,
    };
    logger.info('conditions: ', conditions);
    return Promise
      .props({
        total: Mail.count(conditions),
        items: Mail.find(conditions, null, { sort: { date: -1 } }).lean(),
      })
      .then((result) => {
        return result.items || [];
      });
  },
};


module.exports = svc;

