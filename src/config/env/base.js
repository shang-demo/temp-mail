module.exports = {
  log: {
    level: 'trace',
    requestBody: true,
    responseBody: true,
  },
  auth: {
    tokenExpiresIn: 7200,
    superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  },
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  mail: {
    transport: {
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
    defaultOptions: {
      from: 'test4code@sina.com',
      to: 'codenotification@sina.com',
      subject: 'subject',
      text: 'text',
      html: '<b>Hello world ✔</b>', // html body
    },
    in: {
      url: 'ws://lsyx.online:25000/',
    },
    out: {
      logger: true,
      host: 'lsyx.online',
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: 'username',
        pass: 'password',
      },
    },
  },
  port: process.env.PORT || 1337,
  graphql: {
    graphiql: true,
  },
  bootstrap: [
    'MailInService',
  ],
  socketIO: {
    keys: ['shortId'],
  },
};
