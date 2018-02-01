const mailin = require('mailin');

const svc = {
  async lift() {
    mailin.start(mKoa.config.mailin);

    mailin.on('message', (connection, data) => {
      return MailSendService
        .sendMail({
          to: _.get(mKoa.config, 'mailBackup.to'),
          html: data.html,
          subject: `${data.headers.subject} | ${data.headers.from} => ${data.headers.to}`,
        })
        .catch((e) => {
          logger.warn(e);
        });
    });
  },
  on(cb) {
    mailin.on('message', cb);

    // let to = data.headers.to.toLowerCase();
    // let exp = /[\w._+-]+@[\w._+-]+/i;
    // if (exp.test(to)) {
    //   let matches = to.match(exp);
    //   let shortId = matches[0].substring(0, matches[0].indexOf('@'));
    //
    //   logger.info(data.headers.from, shortId, data.text);
    // }
  },
};

module.exports = svc;
