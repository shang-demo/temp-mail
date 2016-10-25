

module.exports = {
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  port: process.env.PORT || '8080',
  ip: undefined,
  mailTransport: {
    host: 'smtp.sina.com',
    port: 465,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'test4code@sina.com',
      pass: 'Test4code;',
    },
  },
  mongo: {
    type: 'uri',
    uri: 'mongodb://heroku:heroku@ds019816.mlab.com:19816/q2234037172-heroku',
    collectionPrefix: 'template-',
  },
  update: {
    // ref: 'production'
  },
  bootstrap: [
    // 'webhookService',
  ],
};
