const MAIL_DOMAIN = process.env.MAIL_DOMAIN;
const MAIL_OUT_AUTH_PASSWORD = process.env.MAIL_OUT_AUTH_PASSWORD;

const RABBITMQ_DOMAIL = process.env.RABBITMQ_DOMAIL;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
const RABBITMQ_PORT = process.env.RABBITMQ_PORT;


if (!MAIL_DOMAIN || !MAIL_OUT_AUTH_PASSWORD) {
  // eslint-disable-next-line no-console
  console.warn(new Error('process.env error'));
  process.exit(1);
}

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
      subject: '',
      text: '',
      html: '',
    },
    domain: MAIL_DOMAIN,
    out: {
      logger: true,
      host: MAIL_DOMAIN,
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: 'username',
        pass: MAIL_OUT_AUTH_PASSWORD,
      },
    },
  },
  rabbitmq: {
    username: 'rabbitmq',
    password: RABBITMQ_PASSWORD,
    host: RABBITMQ_DOMAIL,
    port: RABBITMQ_PORT,
    // url: `amqp://rabbitmq:${RABBITMQ_PASSWORD}@${RABBITMQ_DOMAIL}:${RABBITMQ_PORT}`,
    reconnectDelay: 0,
  },
  port: process.env.PORT || 1337,
  graphql: {
    graphiql: true,
  },
  bootstrap: [
    'MailInService',
    'MailOutService',
  ],
  socketIO: {
    keys: ['shortId'],
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
