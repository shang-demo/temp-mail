const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport(mKoa.config.get('mail.out'));

const svc = {
  async send(mailOptions) {
    return transporter.sendMail(
      _.assign({}, mKoa.config.get('mail.defaultOptions'), mailOptions)
    );
  },
};


module.exports = svc;

