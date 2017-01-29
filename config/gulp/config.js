

let path = require('path');

/** **** start: 用户配置***********/

let alterableSetting = {  // prod 的 基础路径
  basePath: 'production/',
  publicPath: 'production/public/',
  viewPath: 'production/views/',
};


function getCommonConfig() {
  return {
    clean: {                   // 清除生成文件的路径
      src: [
        `${alterableSetting.basePath}**/*`,
        'clinet/styles/',
        `!${alterableSetting.basePath}/.git/`,
        `!${alterableSetting.basePath}/CNAME`,
        `!${alterableSetting.basePath}/Makefile`,
      ],
    },
    sass: {
      watcherPath: [],    // watch:sass 文件路径
      src: [],
      opt: {},
      subStr: '',
      newStr: '',            // prod环境下 替换fonts后的路径
      dest: '',
    },
    less: {
      watcherPath: [
        'less/**/*.less',
        'clinet/common/**/*.less',
        'clinet/components/**/*.less',
      ],    // watch:sass 文件路径
      src: [
        'less/variables.less',
        'clinet/common/**/*.less',
        'clinet/components/**/*.less',
      ],
      opt: {},
      dest: 'clinet/styles',
    },
    injectHtmlDev: {            // development环境
      src: 'index.html',
      opt: {
        cwd: 'server/views',
        base: 'server/views',
      },
      cssSource: [                    // 需要引入的css
        'clinet/styles/**/*.css',
      ],
      jsSource: [         // 需要引入的js, config.specJs会加载在其上面
        'clinet/**/*.js',
        '!clinet/vendor/**/*',
        '!clinet/framework/**/*',
      ],
      libJsPrefix: 'clinet/vendor',  // libJS  依赖于 config.libJs.src; 需要加上前缀
      libCssPrefix: 'clinet',       // libCss  依赖于 config.libCss.src; 需要加上前缀
      ignorePath: 'clinet/',       // 路径去除, 相当于 base
      dest: 'server/views',
    },
    libCss: {             // lib css 需要引入的的css
      src: [              // src 可以为空数组
        'framework/paper/dist/bootstrap.min.css',
        'vendor/angular-loading-bar/build/loading-bar.min.css',
        'vendor/font-awesome/css/font-awesome.min.css',
      ],
      opt: {
        cwd: 'clinet/',
      },
      dest: 'clinet/styles',
    },
    libJs: {              // lib js, 需要按照顺序书写
      src: [
        'angular/angular.min.js',
        'angular-animate/angular-animate.min.js',
        'angular-resource/angular-resource.min.js',
        'angular-ui-router/release/angular-ui-router.min.js',
        'angular-bootstrap/ui-bootstrap-tpls.min.js',
        'angular-loading-bar/build/loading-bar.min.js',
        'angular-translate/angular-translate.min.js',
        'angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
        'lodash/dist/lodash.min.js',
      ],
      opt: {
        cwd: 'clinet/vendor',
        base: 'clinet/vendor',
      },
      dest: path.join(alterableSetting.publicPath, 'js'),          // libJs在prod环境下才需要 输出, 故dest为 prod环境的dest
    },
    specJs: {
      src: [                 // 需要引入的且没有依赖项的js,如i18n,  [可以为空数组]

      ],
    },
    js: {                                   // 用户写的 js
      src: [
        '**/*.js',
        '!vendor/**/*',
        '!framework/**/*',
      ],
      opt: {
        cwd: 'clinet/',
        base: 'clinet/',
      },
      filters: [{
        src: ['app.js'],
        subStr: '$locationProvider.html5Mode(true);',
        newStr: `$locationProvider.html5Mode(${!alterableSetting.noHtml5Mode});`,
      }, {
        src: ['components/constants.js'],
        subStr: '.constant(\'SERVER_URL\', \'\')',
        newStr: `.constant('SERVER_URL', '${alterableSetting.noServer ? '' : ''}')`,
      }, {
        src: ['this_is_a_template.js'],
        subStr: /shangAngularTemplate/,
        newStr($) {
          let filepath = $.utilities.getStoreFile($.specConfig.theme.storeFileNameSpaceName, 'relative') || [];
          return filepath[0];
        },
      }],
      dest: path.join(alterableSetting.publicPath, 'js'),        // userJs在prod环境下才需要 输出, 故dest为 prod环境的dest
    },
    images: {
      src: [],
      opt: {
        cwd: 'clinet/images',
        base: 'clinet',
      },
      dest: alterableSetting.publicPath,
    },
    fonts: {
      src: ['clinet/vendor/font-awesome/fonts/**/*'],
      dest: path.join(alterableSetting.publicPath, 'styles/fonts'),
    },
    injectHtmlProd: {
      src: 'index.html',
      opt: {
        cwd: 'server/views',
        base: 'server/views',
      },
      cssSource: [                    // 需要引入的cs
        'clinet/styles/bootstrap.min.css',
        'clinet/styles/**/*.css',
      ],
      injectSource: [
        path.join(alterableSetting.publicPath, 'styles/**/*.css'),
        path.join(alterableSetting.publicPath, 'js/lib*.min*.js'),
        path.join(alterableSetting.publicPath, 'js/user*.min*.js'),
      ],
      cssDest: path.join(alterableSetting.publicPath, 'styles'),
      cssFilters: [{
        src: ['some-need-change-fonts-like-bootstrap.min.css'],
        subStr: '../fonts/',
        newStr: 'fonts/',
      }],
      dest: alterableSetting.viewPath,
      injectIgnorePath: alterableSetting.publicPath,
      isHtmlmin: true,
      prodCssName: 'production',     // css压缩后的名称(无需写 min.css)
      prodUserJsName: 'user',        // 用户js压缩后的名字(无需写 min.js)
      prodLibJsName: 'lib',         // lib js 压缩后的名字 (无需写 min.js)
    },
    html2js: {
      src: [
        '**/*.html',
        '!index.html',
        '!vendor/**/*',
        '!framework/**/*',
      ],
      opt: {
        cwd: 'clinet/',
        base: 'server/',
      },
      config: {
        module: 'shangAngularTemplate',
        transformUrl(url) {
          return url.replace(/.*[\/\\]public[\/\\]/, '');
        },
      },
      isHtmlmin: true,
      name: 'template-app.js',
      dest: path.join(alterableSetting.publicPath, 'js'),
    },
    server: {
      jsWatch: [
        'server/**/*.js',
        '!server/views/**/*',
      ],
      src: [
        '**/*',
        '!public/**/*',
        '!views/**/*',
        '!index.html',
      ],
      opt: {
        cwd: 'server/',
        base: 'server/',
      },
      dest: alterableSetting.basePath,
    },
    revAll: {
      src: [
        '**/*',
        '!imagas/**/*',
        '!fonts/**/*',
        '!index.html',
      ],
      opt: {
        cwd: alterableSetting.publicPath,
        base: alterableSetting.publicPath,
      },
      dest: alterableSetting.publicPath,
    },
    cp: [{
      staticDisabled: true,
      src: [
        'config/**/*',
      ],
      opt: {
        cwd: 'server/',
        base: 'server/',
      },
      dest: alterableSetting.basePath,
    }, {
      src: [
        'languages/**/*',
      ],
      opt: {
        cwd: 'clinet',
        base: 'clinet',
      },
      dest: alterableSetting.publicPath,
    }],
    browsersync: {
      development: {
        proxy: 'http://127.0.0.1:1337',
        online: true,
        port: 13370,
        files: [
          'clinet/**/*',
          '!clinet/styles/**/*',
          'server/views/**/*',
        ],
      },
    },
    minifyCssConfig: {                        // 压缩css配置
      keepSpecialComments: 0,
    },
    uglifyConfig: {                           // 压缩js配置
      compress: {
        drop_console: true,
      },
    },
    htmlminConfig: {
      collapseWhitespace: true,
      removeComments: true,
    },
    jshintPath: 'config/gulp/.jshintrc',        // jshintrc 的路径, 相对gulpfile.js
    jshintPathApp: 'config/gulp/.jshintrc_app',  // jshintrc 的路径, 相对gulpfile.js
  };
}

/** **** end: 用户配置***********/


function getSpecConfig() {
  return {
    theme: {
      src: [],
      opt: {
        cwd: 'clinet',
        base: 'clinet',
      },
      dest: alterableSetting.publicPath,
      storeFileNameSpaceName: 'nightTheme',
    },
  };
}

module.exports = {
  alterableSetting,
  getCommonConfig,
  getSpecConfig,
};
