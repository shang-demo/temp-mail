
const split = require('split2');
const Parse = require('fast-json-parse');
const chalk = require('chalk');

const levels = {
  60: 'FATAL',
  50: 'ERROR',
  40: 'WARN',
  30: 'INFO',
  20: 'DEBUG',
  10: 'TRACE',
};
const standardKeys = [
  'pid',
  'hostname',
  'name',
  'level',
  'msg',
  'time',
  'v',
];

function withSpaces(value) {
  let lines = value.split('\n');
  lines.splice(0, 1);
  return lines.map(item => `    ${item}`).join('\n');
}

function filter(value) {
  let keys = Object.keys(value);
  let result = '';

  keys.forEach((item) => {
    if (standardKeys.indexOf(item) < 0) {
      result += `    ${item}: ${withSpaces(JSON.stringify(item[item], null, 2))}\n`;
    }
  });

  return result;
}

function isPinoLine(line) {
  return {}.hasOwnProperty.call(line, 'hostname') && {}.hasOwnProperty.call(line, 'pid') && ({}.hasOwnProperty.call(line, 'v') && line.v === 1);
}

function pretty(opts, mapLineFun) {
  let timeTransOnly = opts && opts.timeTransOnly;
  let levelFirst = opts && opts.levelFirst;

  let stream = split(mapLineFun || mapLine);
  let ctx;
  let levelColors;

  let pipe = stream.pipe;

  stream.pipe = function streamPipe(dest, options) {
    ctx = new chalk.constructor({
      enabled: !!(chalk.supportsColor && dest.isTTY),
    });

    levelColors = {
      60: ctx.bgRed,
      50: ctx.red,
      40: ctx.yellow,
      30: ctx.green,
      20: ctx.blue,
      10: ctx.grey,
    };

    pipe.call(stream, dest, options);
  };

  return stream;

  function mapLine(line) {
    /* eslint-disable no-param-reassign */
    let parsed = new Parse(line);
    let value = parsed.value;

    if (parsed.err || !isPinoLine(value)) {
      // pass through
      return `${line}\n`;
    }

    if (timeTransOnly) {
      value.time = asLocaleDate(value.time);
      return `${JSON.stringify(value)}\n`;
    }

    line = (levelFirst) ? `${asColoredLevel(value)} [${asLocaleDate(value.time)}]` : `[${asLocaleDate(value.time)}] ${asColoredLevel(value)}`;

    if (value.name) {
      line += ` (${value.name} )`;
    }
    line += ': ';
    if (value.msg) {
      line += levelColors[value.level](value.msg);
    }
    line += '\n';
    if (value.type === 'Error') {
      line += `    ${withSpaces(value.stack)}\n`;
    }
    else {
      line += filter(value);
    }
    return line;
  }

  function asLocaleDate(time) {
    return new Date(time).toLocaleString();
  }

  function asColoredLevel(value) {
    return levelColors[value.level](levels[value.level]);
  }
}

module.exports = pretty;
