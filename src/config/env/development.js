module.exports = {
  connections: {
    defaultMongo: {
      hosts: [
        {
          host: '127.0.0.1',
        }
      ],
      database: 'noName',
    },
  },
  mailin: {
    host: '0.0.0.0',
    port: 25000,
    disableWebhook: true,
  },
  rabbitmq: {
    username: '',
    password: '',
    host: '127.0.0.1',
    port: '',
    reconnectDelay: 0,
  },
};
