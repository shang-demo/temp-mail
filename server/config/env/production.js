

module.exports = {
  log: {
    options: {
      prettyPrint: {
        dateFormatter: false,
        pidAndHostname: true,
        sameLevelColorMessage: false,
      },
    },
    level: 'trace',
  },
  connections: {
    defaultMongo: {
      dbName: 'noDbName',
    },
  },
  superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
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
  update: {
    ref: 'master',
  },
  port: process.env.PORT || 1337,
};
