module.exports = {
  log: {
    level: 'trace',
    requestBody: true,
    responseBody: false,
  },
  connections: {
    defaultMongo: {
      hosts: [
        {
          host: '127.0.0.1',
        }
      ],
      database: 'test',
    },
  },
  port: process.env.PORT || 1337,
  bootstrap: [],
};
