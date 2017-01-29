const nodemailer = require('nodemailer');

// 默认配置
let defaultMailOptions = {
  from: 'test4code@sina.com',
  to: 'codenotification@sina.com',
  subject: 'subject',
  text: 'text',
  html: '<b>Hello world ✔</b>', // html body
};

let transporter = nodemailer.createTransport(mKoa.config.mailTransport);

const sendMail = (mailOptions) => {
  logger.info('start mailOptions');
  return new Promise((resolve, reject) => {
    transporter.sendMail(_.assign({}, defaultMailOptions, mailOptions), (error, info) => {
      logger.info('end sendMail');
      if (error) {
        reject(error);
        return;
      }
      resolve(info);
    });
  });
};

module.exports = {
  sendMail,
};
