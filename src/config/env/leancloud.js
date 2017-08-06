const MONGODB_DATABASE = 'leancloud';
const MONGODB_USERNAME = 'leancloudUser';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

module.exports = {
  log: {
    level: 'trace',
    requestBody: true,
    responseBody: false,
  },
  connections: {
    defaultMongo: {
      username: MONGODB_USERNAME,
      password: MONGODB_PASSWORD,
      hosts: [
        {
          host: '112.74.107.82',
          port: 13508,
        }
      ],
      database: MONGODB_DATABASE,
    },
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
  port: process.env.LEANCLOUD_APP_PORT || 8080,
  graphiql: true,
  ip: undefined,
  bootstrap: [],
};
