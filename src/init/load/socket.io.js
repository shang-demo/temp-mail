const humps = require('humps');
const socketIO = require('socket.io');
const Socket = require('socket.io/lib/socket');

let io;

const svc = {
  keys: [],
  connectionListeners: [],
  defaultListeners: {
    clientPropGet(client) {
      client.get = (propPath, defaultValue) => {
        return _.get(client.userProps, propPath, defaultValue);
      };
    },
    authCheck(client) {
      if (client.authErrors) {
        logger.info('client.authErrors: ', client.authErrors);
        client.emit('unauthorized', { message: client.authErrors }, () => {
          client.disconnect();
        });
      }
    },
    joinRoom(client) {
      client.join(svc.getRoomId(client));
    },
    clientError(client) {
      client.on('error', (error) => {
        logger.warn('socket client error: ', error);
      });
    },
  },
  defaultIOUse: {
    async auth(socket, next) {
      let errors = [];
      socket.userProps = {};

      svc.keys.forEach((item) => {
        let key = item.key;
        let value = _.get(socket, `request.headers['${item.header}']`);

        if (item.required && _.isUndefined(value)) {
          errors.push({
            key,
            message: 'required',
          });
          return null;
        }

        socket.userProps[key] = value;
        return null;
      });

      if (errors && errors.length) {
        socket.authErrors = errors;
      }
      next();
      return null;
    },
  },
  async lift() {
    this.socketIO = {
      get() {
        return io;
      },
      getRoomId: svc.getRoomId.bind(svc),
      emit: svc.emit.bind(svc),
      addConnectionListener: svc.addConnectionListener.bind(svc),
      removeConnectionListener: svc.removeConnectionListener.bind(svc),
    };

    _.forEach(this.config.get('socketIO.keys', []), (item) => {
      if (_.isString(item)) {
        svc.keys.push({
          key: item,
          header: humps.decamelize(item, { separator: '-' }),
          required: false,
        });
      }
      else if (_.isPlainObject(item)) {
        svc.keys.push({
          key: item.key,
          header: humps.decamelize(item.key, { separator: '-' }),
          required: !!item.required,
        });
      }
    });

    svc.keys = _.sortBy(svc.keys, 'key');

    io = socketIO(this.server, {
      handlePreflightRequest(req, res) {
        let extraHeader = _.map(svc.keys, 'header');
        extraHeader.unshift(...['content-type', 'authorization']);

        let headers = {
          'Access-Control-Allow-Headers': `${extraHeader.join(',')}`,
          'Access-Control-Allow-Origin': req.headers.origin,
          'Access-Control-Allow-Credentials': true,
        };
        res.writeHead(200, headers);
        res.end();
      },
    });

    _.forEach(svc.defaultListeners, (fun) => {
      svc.addConnectionListener(fun);
    });

    _.forEach(svc.defaultIOUse, (fun) => {
      io.use(fun);
    });

    svc.onConnection();
  },
  getRoomId(obj) {
    let props;
    if (obj instanceof Socket) {
      props = obj.userProps;
    }
    else {
      props = obj;
    }

    let params = _.map(svc.keys, 'key');

    return params
      .map((key) => {
        let value = props[key];
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
  onConnection() {
    io.on('connection', (client) => {
      logger.info('socket.io client connect, roomId:', svc.getRoomId(client));
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
