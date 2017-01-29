const Koa = require('koa');

module.exports = function exportKoa() {
  this.Koa = Koa;
  this.app = new Koa();
};
