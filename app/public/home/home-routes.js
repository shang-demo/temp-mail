'use strict';

angular
  .module('shangAngularTemplate')
  .config(function($urlRouterProvider, $stateProvider) {
    //$urlRouterProvider.when('', '/');
    // $location.url($stateParams.from);

    $stateProvider
      .state('home', {
        url: '?from',
        templateUrl: 'home/home.tpl.html',
        resolve: {
        }
      });
  });