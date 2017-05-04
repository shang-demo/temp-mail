const PASSWORD = process.env.MONGODB_PASSWORD;
const DATABASE = 'leancloud';

module.exports = {
  log: {
    level: 'trace',
    requestBody: true,
    responseBody: false,
  },
  connections: {
    defaultMongo: {
      type: 'uri',
      uri: `mongodb://q2234037172:${PASSWORD}@cluster0-shard-00-00-g30bn.mongodb.net:27017,cluster0-shard-00-01-g30bn.mongodb.net:27017,cluster0-shard-00-02-g30bn.mongodb.net:27017/${DATABASE}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`,
      collectionPrefix: '',
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
  update: {
    ref: 'master',
  },
  port: process.env.LEANCLOUD_APP_PORT || 8080,
  ip: undefined,
  bootstrap: [],
};
