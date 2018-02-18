const amqp = require('amqplib');
const promiseRetry = require('promise-retry');

const svc = {
  channel: null,
  listeners: {},
  async lift() {
    this.rabbitmq = {
      addConsume: svc.addConsume.bind(svc),
      publish: svc.publish.bind(svc),
    };

    return svc.reconnect();
  },
  async reconnect() {
    try {
      await svc.retryCreateChannel();
    }
    catch (e) {
      logger.warn(e);
      process.exit(1);
    }

    return Promise
      .map(_.keys(svc.listeners), (key) => {
        return svc.addConsume(key, svc.listeners[key]);
      })
      .catch((e) => {
        logger.warn(e);
        process.exit(1);
      });
  },
  async retryCreateChannel() {
    return promiseRetry(async (retry, number) => {
      logger.debug('retryCreateChannel attempt number', number);
      try {
        await svc.createChannel();
      }
      catch (e) {
        logger.warn(e);
        retry(e);
      }
    }, {
      retries: 10,
      maxTimeout: 3 * 1000,
    });
  },
  amqpUrl(options) {
    return `amqp://${options.username ? (`${options.username}:${options.password}@`) : ''}${options.host || '127.0.0.1'}:${options.port || 5672}`;
  },
  async createChannel() {
    let rabbitmqConfig = mKoa.config.get('rabbitmq', {});
    let reconnectDelay = rabbitmqConfig.reconnectDelay || 0;
    let url;

    if (rabbitmqConfig.url) {
      url = rabbitmqConfig.url;
    }
    else if (!rabbitmqConfig.host) {
      return Promise.reject('no rabbitmq host found');
    }
    else {
      url = svc.amqpUrl(rabbitmqConfig);
    }

    logger.debug('rabbitmq url: ', url);
    if (!url) {
      return Promise.reject('no url found');
    }

    let conn = await amqp.connect(url);

    conn.on('error', (err) => {
      logger.error('[AMQP] conn error', err);
      try {
        svc.channel.close();
      }
      catch (e) {
        logger.warn(e);
      }
      svc.channel = null;
    });

    conn.on('close', () => {
      logger.error('[AMQP] close, reconnecting');
      svc.channel = null;
      return setTimeout(svc.reconnect.bind(svc), reconnectDelay);
    });

    svc.channel = await conn.createChannel();
    return svc.channel;
  },
  async getChannel() {
    if (svc.channel) {
      return svc.channel;
    }
    return promiseRetry((retry, number) => {
      logger.info('getChannel attempt number', number);

      return Promise.resolve()
        .then(() => {
          if (svc.channel) {
            return svc.channel;
          }

          return Promise.reject(new Error('no channel found'));
        })
        .catch(retry);
    }, {
      retries: 10,
      maxTimeout: 3 * 1000,
    });
  },
  async addConsume(key, fun) {
    svc.listeners[key] = fun;

    let ch = await svc.getChannel();
    await ch.assertQueue(key);
    await ch.consume(key, async (msg) => {
      if (msg !== null) {
        await fun(msg.content.toString());
      }
      return ch.ack(msg);
    });
    return null;
  },
  async publish(key, data) {
    let ch = await svc.getChannel();
    await ch.assertQueue(key);
    if (_.isBuffer(data)) {
      await ch.sendToQueue(key, data);
    }
    else {
      await ch.sendToQueue(key, new Buffer(JSON.stringify(data)));
    }
  },
};

module.exports = svc;
