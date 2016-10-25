'use strict';

angular
  .module('common')
  .directive('customFields', function() {
    return {
      restrict: 'EA',
      templateUrl: 'common/custom-fields/custom-fields.tpl.html',
      scope: {
        ngModel: '='
      },
      replace: true,
      link: function(scope) {
        scope.add = function() {
          scope.ngModel = scope.ngModel || [];
          scope.ngModel.push({name: '', value: ''});
        };
        scope.remove = function(field) {
          scope.ngModel.splice(scope.ngModel.indexOf(field), 1);
          scope.ngModel.length === 0 && scope.add();
        };
        scope.$watch('ngModel', function(newModel) {
          _.remove(newModel, function(field) {
            return !field.name;
          });
          scope.add();
        });
      }
    };
  });