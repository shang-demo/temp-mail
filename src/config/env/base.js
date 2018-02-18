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
  },
  port: process.env.PORT || 1337,
  graphql: {
    graphiql: true,
  },
  bootstrap: [],
  socketIO: {
    keys: ['purpose'],
  },
  rabbitmq: {
    username: '',
    password: '',
    host: '127.0.0.1',
    port: '',
    // url: `amqp://rabbitmq:${RABBITMQ_PASSWORD}@${RABBITMQ_DOMAIL}:${RABBITMQ_PORT}`,
    reconnectDelay: 0,
  },
};
