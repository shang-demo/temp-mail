const notifier = require('node-notifier');
const gulp = require('gulp');
const utilities = require('./utilities');
const rebuildTypings = require('../generate-typings').init;
let gulpConfig = require('./config.js');

let specConfig = null;       // 在环境初始化之后再读取配置
let config = null;

let $ = require('gulp-load-plugins')(
  {
    pattern: ['gulp-*', 'del', 'streamqueue'],
    // ,lazy: false
  });

$.utilities = utilities;
$.isBuild = false;
$.isStatic = false;
$.specConfig = specConfig;
$.config = config;
$.isNeedInjectHtml = false;

// set default env
// eslint-disable-next-line no-underscore-dangle
gulpConfig.__alterableSetting__ = {};
// eslint-disable-next-line no-underscore-dangle
copyAttrValue(gulpConfig.__alterableSetting__, gulpConfig.alterableSetting);
setDevEnv();

function copyAttrValue(obj, copyObj) {
  if (!obj || !copyObj) {
    return obj;
  }
  for(let attr in copyObj) {
    if ({}.hasOwnProperty.call(copyObj, attr)) {
      obj[attr] = copyObj[attr];
    }
  }
  return obj;
}

function getConfig() {
  config = gulpConfig.getCommonConfig();
  $.config = config;
}

function setDevEnv(done) {
  gulpConfig.alterableSetting.publicPath = 'src/public';
  getConfig();
  return done && done();
}

function validConfig(config, name) {
  name = name || 'src';
  return config[name] && config[name].length;
}

gulp.task('clean', done => $.del(config.clean.src, done));


// start watchers
gulp.task('watchBuildTypings', function (done) {
  rebuildTypings();
  let rebuildTypingsTimer = null;

  gulp.watch(config.watchRebuildTypings.src, config.watchRebuildTypings.opt)
  // 增加文件需要重新生成依赖
    .on('add', function () {
      clearTimeout(rebuildTypingsTimer);
      rebuildTypingsTimer = setTimeout(function () {
        rebuildTypings();
      }, 200);
    })// 删除文件需要重新生成依赖
    .on('unlink', function () {
      clearTimeout(rebuildTypingsTimer);
      rebuildTypingsTimer = setTimeout(function () {
        rebuildTypings();
      }, 200);
    });

  return done();
});


gulp.task('lint', (done) => {
    if (!validConfig(config.server)) {
      return done();
    }

    return gulp
      .src(config.server.src, config.server.opt)
      .pipe($.cached('serverJs'))
      .pipe($.eslint())
      .pipe($.eslint.result(result => {
        utilities.eshintReporter(result);
      }))
      .pipe($.remember('serverJs'))
    // .pipe($.eslint.format())
    // .pipe($.eslint.failAfterError())
  }
);

gulp.task('wlint', (done) => {
  if (!validConfig(config.server)) {
    return done();
  }

  gulp.series('lint')();
  gulp.watch(config.server.src, config.server.opt)
    .on('change', (filePath) => {
      console.info(`${filePath} do eslint`);
      // js文件需要 jshint
      gulp.series('lint')();
    });

  return done();
});


gulp.task('server', () => {
  let f = $.filter(['**/*.js'], { restore: true });

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe(f)
    .pipe($.eslint())
    .pipe($.eslint.result(result => {
      utilities.eshintReporter(result);
    }))
    .pipe(f.restore)
    .pipe(gulp.dest(config.server.dest));
});

gulp.task('buildServer', gulp.series(
  'clean',
  'server'
));

gulp.task('nodemon', (done) => {
  let stream = $.nodemon(config.nodemon.config);

  let defaultEvent = {
    crash() {
      console.error('Application has crashed!\n');
      notifier.notify({
        title: `Application has crashed!`,
        message: utilities.dateFormat('hh:mm:ss'),
      });
    },
    start() {
      utilities
        .spawnDefer({
          cmd: 'clear',
          arg: [],
        });
    },
  };

  Object.keys(config.nodemon.event).forEach((eventName) => {
    let event = config.nodemon.event[eventName];
    if (typeof eventName === 'function') {
      stream.on(eventName, event);
    }
    else if (event === true && defaultEvent[eventName]) {
      stream.on(eventName, defaultEvent[eventName]);
    }
    else {
      console.warn(`not support for ${eventName}`);
    }
  });

  return done();
});

gulp.task('default', gulp.series(
  setDevEnv,
  'clean',
  gulp.parallel(
    'watchBuildTypings',
    'nodemon',
    'wlint'
  )
));
