'use strict';

angular
  .module('shangAngularTemplate', [
    'ui.bootstrap',
    'ngResource',
    'ui.router',
    'angular-loading-bar',
    'ngAnimate',
    'pascalprecht.translate',
    'common'
  ])
  .config(function($locationProvider, $httpProvider, $translateProvider) {
    //$locationProvider.html5Mode(true);

    $httpProvider.interceptors.push('httpInjectorFactory');

    // languages
    $translateProvider.useStaticFilesLoader({
      prefix: '/languages/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('zh-hans');

  })
  .run(function($rootScope, $state, $stateParams, httpInjectorFactory, SERVER_URL) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // 防止languages未加载
    $rootScope.initialingServiceCount = $rootScope.initialingServiceCount || 0;
    $rootScope.initialingServiceCount += 1;
    $rootScope.$on('$translateLoadingSuccess', function () {
      $rootScope.initialingServiceCount -= 1;
    });

    httpInjectorFactory.statusCodeRouter = {
      401: 'home',
      403: 'home'
    };
    httpInjectorFactory.setServerUrl(SERVER_URL);
  });

