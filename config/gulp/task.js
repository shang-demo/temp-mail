const gulp = require('gulp');
const path = require('path');
const browserSync = require('browser-sync').create();
const utilities = require('./utilities');
let gulpConfig = require('./config.js');

const reload = browserSync.reload;

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

function changeSrc(src) {
  if (typeof src === 'string') {
    return path.join('**', src);
  }

  return src.map(value => path.join('**', value));
}

// global error handler
function errorHandler(error) {
  console.log(error);
  this.end();
  this.emit('end');
}


function injectHtmlDevErrorHandler(error) {
  console.log(error);
  $.isNeedInjectHtml = true;
  this.end();
  this.emit('end');
}

function validConfig(config, name) {
  name = name || 'src';
  return config[name] && config[name].length;
}


/**
 *
 * 特殊需求, 每个项目不同
 *
 */

gulp.task('theme', (done) => {
  if (!$.isBuild || !validConfig(specConfig.theme)) {
    return done();
  }
  return gulp.src(specConfig.theme.src, specConfig.theme.opt)
    .pipe($.cssnano())
    .pipe($.rev())
    .pipe($.rename({ extname: '.min.css' }))
    .pipe(utilities.saveStoreFile(specConfig.theme.storeFileNameSpaceName))
    .pipe(gulp.dest(specConfig.theme.dest));
});

gulp.task('userTask', gulp.series('theme'));


/**
 * end: 特殊需求
 */


gulp.task('browser-sync', (done) => {
  browserSync.init(config.browsersync.development);
  return done();
});

// no-op = empty function
gulp.task('no-op', () => {
});

gulp.task('clean', done => $.del(config.clean.src, done));

// 复制 lib css, 在build时起作用
gulp.task('libCss', (done) => {
  if (!$.isBuild || !validConfig(config.libCss)) {
    return done();
  }

  return gulp
    .src(config.libCss.src, config.libCss.opt)
    .pipe(gulp.dest(config.libCss.dest));
});

gulp.task('sass', (done) => {
  if (!validConfig(config.sass)) {
    return done();
  }
  return gulp.src(config.sass.src, config.sass.opt)
    .pipe($.if($.isBuild, $.replace(config.sass.subStr, config.sass.newStr)))
    .pipe($.sass())
    .on('error', $.sass.logError)
    .pipe(gulp.dest(config.sass.dest))
    .pipe($.if(!$.isBuild, reload({ stream: true })));
});

gulp.task('less', (done) => {
  if (!validConfig(config.less)) {
    return done();
  }
  return gulp
    .src(config.less.src, config.less.opt)
    .pipe($.less({
      expand: true,
      ext: '.css',
    }))
    .pipe(gulp.dest(config.less.dest))
    .pipe($.if(!$.isBuild, reload({ stream: true })));
});

gulp.task('injectHtml:dev', (done) => {
  let ignorePath = {
    ignorePath: config.injectHtmlDev.ignorePath,
  };

  let arr = [{
    objectMode: true,
  }];

  if (validConfig(config.libCss)) {
    let libCss = config.libCss.src.map(value => path.join(config.injectHtmlDev.libCssPrefix, value));
    arr.push(gulp.src(libCss, { read: false }));
  }

  if (validConfig(config.injectHtmlDev, 'cssSource')) {
    arr.push(gulp.src(config.injectHtmlDev.cssSource, { read: false }));
  }

  if (validConfig(config.libJs) && config.injectHtmlDev.libJsPrefix) {
    let libJs = config.libJs.src.map(value => path.join(config.injectHtmlDev.libJsPrefix, value));
    arr.push(gulp.src(libJs, { read: false }));
  }

  if (validConfig(config.specJs)) {
    let specJs = gulp.src(config.specJs.src, { read: false });
    arr.push(specJs);
  }

  if (validConfig(config.injectHtmlDev, 'jsSource')) {
    let userJs = gulp
      .src(config.injectHtmlDev.jsSource)
      .pipe($.angularFilesort())
      .on('error', errorHandler);

    arr.push(userJs);
  }

  if (arr.length <= 1 || !validConfig(config.injectHtmlDev)) {
    return done();
  }

  return gulp
    .src(config.injectHtmlDev.src, config.injectHtmlDev.opt)
    .pipe($.inject(
      $.streamqueue.apply($.streamqueue, arr),
      ignorePath
    ))
    .on('error', injectHtmlDevErrorHandler)
    .on('finish', () => {
      $.isNeedInjectHtml = false;
    })
    .pipe(gulp.dest(config.injectHtmlDev.dest));
});

gulp.task('images', (done) => {
  if (!validConfig(config.images)) {
    return done();
  }
  return gulp
    .src(config.images.src, config.images.opt)
    .pipe(gulp.dest(config.images.dest));
});

gulp.task('fonts', (done) => {
  if (!$.isBuild || !validConfig(config.fonts)) {
    return done();
  }
  return gulp
    .src(config.fonts.src)
    .pipe(gulp.dest(config.fonts.dest));
});

gulp.task('css', (done) => {
  if (!validConfig(config.injectHtmlProd, 'cssSource') || !config.injectHtmlProd.prodCssName) {
    return done();
  }


  let stream = gulp.src(config.injectHtmlProd.cssSource);

  let filters = config.injectHtmlProd.cssFilters;
  let f;
  for(let i = 0, l = filters.length; i < l; i++) {
    if (!filters[i].src || !filters[i].src.length) {
      continue;
    }
    f = $.filter(changeSrc(filters[i].src), { restore: true });

    if (typeof filters[i].newStr === 'function') {
      filters[i].newStr = filters[i].newStr($);
    }

    stream = stream
      .pipe(f)
      .pipe($.replace(filters[i].subStr, filters[i].newStr))
      .pipe(f.restore);
  }

  return stream
    .pipe($.concat(config.injectHtmlProd.prodCssName))
    .pipe($.cssnano())
    .pipe($.rev())
    .pipe($.rename({ extname: '.min.css' }))
    .pipe(gulp.dest(config.injectHtmlProd.cssDest));
});

gulp.task('cp', (done) => {
  if (!config.cp || !config.cp.length) {
    return done();
  }


  let arr = [];
  config.cp.forEach((item) => {
    if (validConfig(item)) {
      if (item.staticDisabled) {
        return null;
      }
      arr.push(() => {
        return gulp.src(item.src, item.opt)
          .pipe(gulp.dest(item.dest));
      });
    }
  });

  if (!arr.length) {
    return done();
  }

  gulp.series(
    gulp.parallel.apply(gulp.parallel, arr),
    (cb) => {
      cb();
      done();
    })();
});

// 前端js
gulp.task('js', (done) => {
  if (!validConfig(config.js)) {
    return done();
  }

  if (!$.isBuild) {
    return gulp.src(config.js.src, config.js.opt)
      .pipe($.jshint(config.jshintPath))
      .pipe($.jshint.reporter(utilities.jshintReporter));
  }

  let jssStreamQueue = [{
    objectMode: true,
  }];

  if (validConfig(config.specJs)) {
    let specStream = gulp.src(config.specJs.src);
    jssStreamQueue.push(specStream);
  }

  if (validConfig(config.js)) {
    let stream = gulp.src(config.js.src, config.js.opt);
    let filters = config.js.filters;
    let f;
    for(let i = 0, l = filters.length; i < l; i++) {
      if (!filters[i].src || !filters[i].src.length) {
        continue;
      }
      f = $.filter(changeSrc(filters[i].src), { restore: true });

      if (typeof filters[i].newStr === 'function') {
        filters[i].newStr = filters[i].newStr($);
      }

      stream = stream
        .pipe(f)
        .pipe($.replace(filters[i].subStr, filters[i].newStr))
        .pipe(f.restore);
    }

    let scriptStream = stream.pipe($.jshint(config.jshintPath))
      .pipe($.jshint.reporter(utilities.jshintReporter))
      .pipe($.ngAnnotate())
      .pipe($.angularFilesort())
      .on('error', errorHandler);

    jssStreamQueue.push(scriptStream);
  }

  if (validConfig(config.html2js)) {
    let templateStream = gulp
      .src(config.html2js.src, config.html2js.opt)
      .pipe($.if(config.html2js.isHtmlmin, $.htmlmin(config.htmlminConfig)))
      .pipe($.angularTemplatecache(config.html2js.name, config.html2js.config))
      .pipe($.angularFilesort());

    jssStreamQueue.push(templateStream);
  }

  return $.streamqueue.apply($.streamqueue, jssStreamQueue)
    .pipe($.concat(config.injectHtmlProd.prodUserJsName))
    .pipe($.uglify(config.uglifyConfig))
    .pipe($.rev())
    .pipe($.rename({ extname: '.min.js' }))
    .on('error', errorHandler)
    .pipe(gulp.dest(config.js.dest));
});

// 前端js进行jshint
gulp.task('jsCachedJshint', (done) => {
  if (!validConfig(config.js)) {
    return done();
  }

  return gulp.src(config.js.src, config.js.opt)
    .pipe($.cached('js')) // 只传递更改过的文件
    .pipe($.jshint(config.jshintPath))
    .pipe($.jshint.reporter(utilities.jshintReporter))
    .pipe($.remember('js')); // 把所有的文件放回 stream
});


gulp.task('libJs', (done) => {
  if (!validConfig(config.libJs) || !config.injectHtmlProd.prodLibJsName) {
    return done();
  }

  return gulp.src(config.libJs.src, config.libJs.opt)
    .pipe($.concat(config.injectHtmlProd.prodLibJsName))
    .pipe($.uglify(config.uglifyConfig))
    .pipe($.rev())
    .pipe($.rename({ extname: '.min.js' }))
    .on('error', errorHandler)
    .pipe(gulp.dest(config.libJs.dest));
});

gulp.task('injectHtml:prod', () => {
  let injectSource = gulp.src(config.injectHtmlProd.injectSource, { read: false });
  return gulp
    .src(config.injectHtmlProd.src, config.injectHtmlProd.opt)
    .pipe($.inject(injectSource, {
      ignorePath: config.injectHtmlProd.injectIgnorePath,
    }))
    .pipe($.if(config.injectHtmlProd.isHtmlmin, $.htmlmin(config.htmlminConfig)))
    .pipe(gulp.dest(config.injectHtmlProd.dest));
});

// start watchers
gulp.task('watchers', (done) => {
  // less
  if (config.less.watcherPath) {
    gulp.watch(config.less.watcherPath, gulp.series('less'));
  }
  // 后端js变动
  if (config.server.jsWatch) {
    gulp.watch(config.server.jsWatch, gulp.series('server'));
  }

  if (config.browsersync.development && config.browsersync.development.files) {
    let injectHtmlDevTimer = null;
    gulp.watch(config.browsersync.development.files)
      .on('change', (filePath) => {
        // js文件需要 jshint
        if (/\.js/.test(filePath)) {
          gulp.series('jsCachedJshint')();
        }

        if ($.isNeedInjectHtml) {
          console.log('NeedInjectHtml');
          gulp.series('injectHtml:dev')();
        }
      }) // 增加文件需要重新生成依赖
      .on('add', () => {
        clearTimeout(injectHtmlDevTimer);
        injectHtmlDevTimer = setTimeout(() => {
          gulp.series('injectHtml:dev')();
        }, 200);
      })// 删除文件需要重新生成依赖
      .on('unlink', () => {
        clearTimeout(injectHtmlDevTimer);
        injectHtmlDevTimer = setTimeout(() => {
          gulp.series('injectHtml:dev')();
        }, 200);
      });
  }

  done();
});

gulp.task('watchers:sass', () => {
  gulp.watch(config.sass.watcherPath, ['sass']);
});

gulp.task('server', (done) => {
  if ($.isStatic) {
    return done();
  }
  let f = $.filter(['**/*.js'], { restore: true });

  if (!$.isBuild || !validConfig(config.server)) {
    return gulp
      .src(config.server.src, config.server.opt)
      .pipe(f)
      .pipe(eslint())
      .pipe(eslint.result(result => {
        utilities.eshintReporter(result);
      }))
      .pipe(f.restore);
  }

  return gulp
    .src(config.server.src, config.server.opt)
    .pipe(f)
    .pipe(eslint())
    .pipe(eslint.result(result => {
      utilities.eshintReporter(result);
    }))
    .pipe(f.restore)
    .pipe(gulp.dest(config.server.dest));
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

gulp.task('build', gulp.series(
  (done) => {
    if (!$.isStatic) {
      copyAttrValue(gulpConfig.alterableSetting, gulpConfig.__alterableSetting__);
    }
    getConfig();
    $.isBuild = true;
    return done();
  },
  'clean',
  'less',
  'cp',
  // 'userTask',
  gulp
    .parallel(
      'libCss',
      'js',
      'images',
      'fonts',
      'libJs',
      'server'
    ),
  'css',
  'injectHtml:prod'
));

gulp.task('prod', gulp.series('build'));

gulp.task('static', gulp.series(
  (done) => {
    $.isStatic = true;
    gulpConfig.alterableSetting.basePath = 'static';
    gulpConfig.alterableSetting.publicPath = gulpConfig.alterableSetting.basePath;
    gulpConfig.alterableSetting.viewPath = gulpConfig.alterableSetting.basePath;
    gulpConfig.alterableSetting.noHtml5Mode = true;
    gulpConfig.alterableSetting.noServer = true;
    return done();
  },
  'build'
));

gulp.task('default', gulp.series(
  setDevEnv,
  'clean',
  gulp.parallel(
    'less',
    'js',
    'server'
  ),
  // 'userTask',
  'injectHtml:dev'
));


gulp.task('dev', gulp.series(
  'default',
  'browser-sync',
  'watchers'
));

gulp.task('quickStart', gulp.series(
  setDevEnv,
  'browser-sync',
  'watchers'
));



const eslint = require('gulp-eslint');

gulp.task('lint', () => gulp
  .src(config.server.src, config.server.opt)
  .pipe($.cached('serverJs'))
  .pipe(eslint())
  .pipe(eslint.result(result => {
    utilities.eshintReporter(result);
  }))
  .pipe($.remember('serverJs'))
  // .pipe(eslint.format())
  // .pipe(eslint.failAfterError())
);

gulp.task('wlint', () => {
  gulp.series('lint')();
  gulp.watch(config.server.src, config.server.opt)
    .on('change', (filePath) => {
      // js文件需要 jshint
      gulp.series('lint')();
    })
});
