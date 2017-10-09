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
  port: process.env.PORT || 1337,
  graphql: {
    graphiql: true,
  },
  bootstrap: [],
};
