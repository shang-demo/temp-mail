
const redis = require('redis');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let redisClient;

const svc = {
  name: 'redisService',
  lift() {
    config.env.redis = config.env.redis || {};
    let option = {
      url: `redis://${config.env.redis.ip || '127.0.0.1'}:${config.env.redis.port || '6379'}`,
    };

    logger.info('redis option: ', option);

    return new Promise((resolve, reject) => {
      redisClient = redis.createClient(option);
      redisClient.on('error', (err) => {
        logger.error(`Redis error ${err}`);
        reject(err);
      });
      redisClient.on('connect', () => {
        logger.info('Redis connect');
        resolve();
      });
    });
  },
  get(key) {
    return redisClient.getAsync(key);
  },
  set(key, obj, express) {
    if (!express) {
      return redisClient.setAsync(key, JSON.stringify(obj));
    }
    return redisClient.setexAsync(key, express, JSON.stringify(obj));
  },
};

module.exports = svc;
