const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const filePathOneLayer = require('../server/init/utilities/file-path-one-layer');

const serverPath = path.join(__dirname, '../server');
const autoGeneratePath = path.join(__dirname, 'typings/auto-generate.d.ts');

function ensureTypingDir() {
  return fs.mkdirAsync(path.join(__dirname, 'typings'))
    .catch((e) => {
      if (e.code === 'EEXIST') {
        return Promise.resolve();
      }

      return Promise.reject(e);
    });
}

function getServicesDeclare() {
  return filePathOneLayer(path.join(serverPath, 'services'))
    .map((serviceFile) => {
      return `declare let ${serviceFile.basename} = require('${serviceFile.basename}');`;
    })
    .then((arr) => {
      return arr.join('\n');
    });
}

function getServiceDeclare() {
  return filePathOneLayer(path.join(serverPath, 'models'))
    .map((modelFile) => {
      return `declare let ${modelFile.basename} = require('mongoose').Model;`;
    })
    .then((arr) => {
      return arr.join('\n');
    });
}

function getGlobal() {
  return Promise.try(() => {
    return `declare let _ = require('lodash');
declare let Promise = require('bluebird');`;
  });
}

function getMKoa() {
  return Promise.try(() => {
    return `declare let mKoa = {
      config: require('config'),
      environment: {}
    };
`
  });
}

function globalLogger() {
  return Promise.try(() => {
    return `declare let logger = require('pino')();`
  });
}

function fsPromisifyAll() {
  return Promise.try(() => {
    return `
let Buffer = require('node').Buffer;
declare let  fs: {
  renameAsync(oldPath: string, newPath: string): Promise<void>;
  truncateAsync(path: string | Buffer, len?: number): Promise<void>;
  ftruncateAsync(fd: number, len?: number): Promise<void>;
  chownAsync(path: string | Buffer, uid: number, gid: number): Promise<void>;
  fchownAsync(fd: number, uid: number, gid: number): Promise<void>;
  lchownAsync(path: string | Buffer, uid: number, gid: number): Promise<void>;
  chmodAsync(path: string | Buffer, mode: string | number): Promise<void>;
  fchmodAsync(fd: number, mode: string | number): Promise<void>;
  lchmodAsync(path: string | Buffer, mode: string | number): Promise<void>;
  statAsync(path: string | Buffer): Promise<fs.Stats>;
  lstatAsync(path: string | Buffer): Promise<fs.Stats>;
  fstatAsync(fd: number): Promise<fs.Stats>;
  linkAsync(srcpath: string | Buffer, dstpath: string | Buffer): Promise<void>;
  symlinkAsync(srcpath: string | Buffer, dstpath: string | Buffer, type?: string): Promise<void>;
  readlinkAsync(path: string | Buffer): Promise<string>;
  realpathAsync(path: string | Buffer): Promise<string>;
  unlinkAsync(path: string | Buffer): Promise<void>;
  rmdirAsync(path: string | Buffer): Promise<void>;
  mkdirAsync(path: string | Buffer, mode?: string | number): Promise<void>;
  readdirAsync(path: string | Buffer): Promise<string[]>;
  closeAsync(fd: number): Promise<void>;
  openAsync(path: string | Buffer, flags: string | number, mode?: number): Promise<number>;
  utimesAsync(path: string | Buffer, atime: number | Date, mtime: number | Date): Promise<void>;
  futimesAsync(fd: number, atime: number | Date, mtime: number | Date): Promise<void>;
  fsyncAsync(fd: number): Promise<void>;
  writeAsync(fd: number, data: string, position?: number, encoding?: string): Promise<[number, string]>;
  writeAsync(fd: number, buffer: Buffer, offset: number, length: number, position?: number): Promise<[number, Buffer]>;
  readAsync(fd: number, buffer: Buffer, offset: number, length: number, position: number): Promise<[number, Buffer]>;
  readFileAsync(file: string | number | Buffer, options?:
             { encoding?: "buffer" | null; flag?: string; }
             | "buffer"
             | null): Promise<Buffer>;
  readFileAsync(file: string | number | Buffer, options: { encoding: string; flag?: string; } | string): Promise<string>;
  writeFileAsync(file: string | number | Buffer, data: string | Buffer, options?:
              { encoding?: string | null; mode?: string | number; flag?: string; }
              | string
              | null): Promise<void>;
  appendFileAsync(file: string | number | Buffer, data: string | Buffer, options?:
               { encoding?: string | null; mode?: number | string; flag?: string; }
               | string
               | null): Promise<void>;
  existsAsync(path: string): Promise<boolean>;
  accessAsync(path: string, mode?: number): Promise<void>;
};
`
  });
}

function init() {
  return ensureTypingDir()
    .then(() => {
      return Promise
        .all([
          getGlobal(),
          globalLogger(),
          fsPromisifyAll(),
          getServiceDeclare(),
          getServicesDeclare(),
          getMKoa(),
        ]);
    })
    .then((arr) => {
      return fs.writeFileAsync(autoGeneratePath, arr.join('\n'));
    });
}

module.exports = {
  init: init,
};

