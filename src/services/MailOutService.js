const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport(mKoa.config.get('mail.out'));

const svc = {
  async lift() {
    mKoa.socketIO.addConnectionListener((client) => {
      if (!client.get('shortId')) {
        logger.warn('no shortId');
      }

      client.on('mailOut', (data) => {
        let shortId = client.get('shortId');
        if (!shortId) {
          client.emit('mailOut', {
            e: 'no shortId found',
          });
          return null;
        }
        let from = `${shortId}@${mKoa.config.mail.domain}`;
        let options = _.assign({}, data, { from });
        logger.info('mail send options: ', options);

        let now = Date.now();
        let persistenceObj = {
          messageId: `${now}|${from}`,
          html: options.html,
          text: options.text,
          subject: options.subject,
          date: now,
          to: {
            value: [{
              address: options.to,
            }],
          },
          from: {
            value: [{
              address: from,
            }],
          },
        };

        return MailPersistenceService
          .save(persistenceObj, JSON.stringify(options), Mail.purposes.out)
          .then(() => {
            return svc.send(options);
          })
          .then((result) => {
            client.emit('mailOut', {
              data: result,
            });
          })
          .catch((e) => {
            logger.warn(e);
            client.emit('mailOut', {
              e: e.message,
            });
          });
      });
    });
  },
  async send(mailOptions) {
    return transporter.sendMail(
      _.assign({}, mKoa.config.get('mail.defaultOptions'), mailOptions)
    );
  },

  async query(shortId) {
    let conditions = {
      'from.value.address': `${shortId}@${mKoa.config.mail.domain}`,
      purpose: Mail.purposes.out,
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

