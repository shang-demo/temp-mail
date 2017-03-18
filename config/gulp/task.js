const gulp = require('gulp');
const utilities = require('./utilities');
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
  specConfig = gulpConfig.getSpecConfig();
  $.config = config;
  $.specConfig = specConfig;
}

function setDevEnv(done) {
  gulpConfig.alterableSetting.publicPath = 'app/public';
  getConfig();
  return done && done();
}

function validConfig(config, name) {
  name = name || 'src';
  return config[name] && config[name].length;
}

gulp.task('clean', done => $.del(config.clean.src, done));

gulp.task('server', (done) => {
  if ($.isStatic) {
    return done();
  }
  let f = $.filter(['**/*.js'], { restore: true });

  if (!$.isBuild || !validConfig(config.server)) {
    return gulp
      .src(config.server.src, config.server.opt)
      .pipe(f)
      .pipe($.eslint())
      .pipe($.eslint.result(result => {
        utilities.eshintReporter(result);
      }))
      .pipe(f.restore);
  }

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

gulp.task('injectHtml:dev', () => {
  return gulp
    .src(config.injectHtmlDev.src, config.injectHtmlDev.opt)
    .pipe($.rename(function (path) {
      path.basename = path.basename.substring(2, path.basename.length - 2);
    }))
    .pipe(gulp.dest(config.injectHtmlDev.dest));
});

gulp.task('buildServer', gulp.series(
  (done) => {
    if (!$.isStatic) {
      copyAttrValue(gulpConfig.alterableSetting, gulpConfig.__alterableSetting__);
    }
    getConfig();
    $.isBuild = true;
    return done();
  },
  'clean',
  gulp
    .parallel(
      'server'
    ),
  () => {
    return gulp
      .src(config.injectHtmlProd.src, config.injectHtmlProd.opt)
      .pipe($.rename(function (path) {
        path.basename = path.basename.substring(2, path.basename.length - 2);
      }))
      .pipe(gulp.dest(config.injectHtmlProd.dest));
  }
));


gulp.task('lint', () => gulp
    .src(config.server.src, config.server.opt)
    .pipe($.cached('serverJs'))
    .pipe($.eslint())
    .pipe($.eslint.result(result => {
      utilities.eshintReporter(result);
    }))
    .pipe($.remember('serverJs'))
  // .pipe($.eslint.format())
  // .pipe($.eslint.failAfterError())
);

gulp.task('wlint', () => {
  gulp.series('lint')();
  gulp.watch(config.server.src, config.server.opt)
    .on('change', (filePath) => {
      // js文件需要 jshint
      gulp.series('lint')();
    })
});


gulp.task('default', gulp.series(
  setDevEnv,
  'clean',
  'injectHtml:dev',
  'wlint'
));