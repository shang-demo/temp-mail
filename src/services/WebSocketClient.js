const WebSocket = require('uws');

function WebSocketClient() {
  this.number = 0;
  this.autoReconnectInterval = 5 * 1000;
}
WebSocketClient.prototype.open = function open(url) {
  this.url = url;
  this.instance = new WebSocket(this.url);
  this.instance.on('open', () => {
    this.onopen();
  });
  this.instance.on('message', (data, flags) => {
    this.number = this.number + 1;
    this.onmessage(data, flags, this.number);
  });
  this.instance.on('close', (e) => {
    switch (e) {
      case 1000:
        logger.info('WebSocket: closed');
        break;
      default:
        this.reconnect(e);
        break;
    }
    this.onclose(e);
  });
  this.instance.on('error', (e) => {
    switch (e.code) {
      case 'ECONNREFUSED':
        this.reconnect(e);
        break;
      default:
        this.onerror(e);
        break;
    }
  });
};
WebSocketClient.prototype.send = function send(data, option) {
  try {
    this.instance.send(data, option);
  }
  catch (e) {
    this.instance.emit('error', e);
  }
};
WebSocketClient.prototype.reconnect = function reconnect(e) {
  logger.info(`WebSocketClient: retry in ${this.autoReconnectInterval}ms`, e);
  this.instance.removeAllListeners();
  let that = this;
  setTimeout(() => {
    logger.info('WebSocketClient: reconnecting...');
    that.open(that.url);
  }, this.autoReconnectInterval);
};

WebSocketClient.prototype.onopen = function onopen(...args) {
  logger.info('WebSocketClient: open', args);
};
WebSocketClient.prototype.onmessage = function onmessage(...args) {
  logger.info('WebSocketClient: message', args);
};
WebSocketClient.prototype.onerror = function onerror(...args) {
  logger.info('WebSocketClient: error', args);
};
WebSocketClient.prototype.onclose = function onclose(...args) {
  logger.info('WebSocketClient: closed', args);
};

module.exports = WebSocketClient;
