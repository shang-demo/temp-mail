const humps = require('humps');
const socketIO = require('socket.io');

let io;

const svc = {
  keys: [],
  connectionListeners: [],
  async lift() {
    io = socketIO(this.server);

    _.forEach(this.config.get('socketIO.keys', []), (item) => {
      if (_.isString(item)) {
        svc.keys.push({
          key: item,
          required: false,
        });
      }
      else if (_.isPlainObject(item)) {
        svc.keys.push({
          key: item.key,
          required: !!item.required,
        });
      }
    });

    svc.keys = _.sortBy(svc.keys, 'key');

    io.use(svc.auth.bind(svc));
    svc.onConnection();

    this.socketIO = {
      get: function get() {
        return io;
      },
      getRoomId: svc.getRoomId.bind(svc),
      emit: svc.emit.bind(svc),
      addConnectionListener: svc.addConnectionListener.bind(svc),
      removeConnectionListener: svc.removeConnectionListener.bind(svc),
    };
  },
  async auth(socket, next) {
    let errors = [];

    svc.keys.forEach((item) => {
      let key = item.key;
      let prop = humps.camelize(key);
      let value = _.get(socket, `request.headers['${key}']`);

      if (item.required && _.isUndefined(value)) {
        errors.push({
          key,
          message: 'required',
        });
        return null;
      }

      socket[prop] = value;
      return null;
    });

    if (errors && errors.length) {
      socket.authErrors = errors;
    }
    next();
    return null;
  },
  getRoomId(obj) {
    let params = _.map(svc.keys, 'key');

    return params
      .map((key) => {
        let value = obj[key];
        if (_.isString(value) || _.isNumber(value)) {
          return `${key}:${value}`;
        }
        logger.warn(`${key}.value should be string, but got`, value);
        return undefined;
      })
      .filter((value) => {
        return value !== undefined;
      })
      .join('|');
  },
  joinRoom(client) {
    client.join(svc.getRoomId(client));
  },
  onConnection() {
    io.on('connection', (client) => {
      logger.info('client connect');

      if (client.authErrors) {
        client.emit('unauthorized', { message: client.authErrors }, () => {
          client.disconnect();
        });
      }

      svc.joinRoom(client);

      client.on('error', (error) => {
        logger.warn('socket client error: ', error);
      });

      svc.connectionListeners.forEach((listener) => {
        listener(client);
      });
    });
  },
  emit(clientProps, data, event) {
    let roomId = svc.getRoomId(clientProps);
    logger.debug('roomId: ', roomId);
    logger.debug('event: ', event);
    logger.debug('data: ', data);

    if (!roomId) {
      io.emit(event, data);
    }
    else {
      io.to(roomId).emit(event, data);

      io.in(roomId).clients((err, clients) => {
        if (err) {
          return null;
        }
        logger.debug(`${roomId} clients length: `, clients.length);
        return null;
      });
    }
  },
  addConnectionListener(fun) {
    svc.connectionListeners.push(fun);
  },
  removeConnectionListener(fun) {
    svc.connectionListeners.splice(svc.connectionListeners.indexOf(fun), 1);
  },
};

module.exports = svc;
