// first under package.json same dir run npm install mailparser uws
const simpleParser = require('mailparser').simpleParser;
const WebSocket = require('uws');

const wss = new WebSocket.Server({
  port: 25000
});

exports.hook_queue = function (next, connection) {
  simpleParser(connection.transaction.message_stream)
    .then((data) => {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
      this.logdebug('data: ', data);
      return next(OK);
    })
    .catch((e) => {
      this.logdebug('e: ', e);
      return next(DENY);
    });
};
