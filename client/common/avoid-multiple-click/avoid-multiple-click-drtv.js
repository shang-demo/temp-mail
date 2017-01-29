'use strict';

angular
  .module('common')
  .directive('avoidMultipleClick', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.bind('click', function() {
          $timeout(function() {
            element.attr('disabled', true);
          }, 0);
          $timeout(function() {
            element.attr('disabled', false);
          }, 1000);
        });
      }
    };
  });