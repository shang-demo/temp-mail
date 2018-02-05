const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport(mKoa.config.get('mail.transport'));

const sendMail = async (mailOptions) => {
  logger.info('start mailOptions');
  return transporter.sendMail(
    _.assign({}, mKoa.config.get('mail.defaultOptions'), mailOptions)
  );
};

module.exports = {
  sendMail,
};
