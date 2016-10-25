'use strict';

angular
  .module('common')
  .service('dialogService', function($modal, $rootScope, $state) {
    this.okCancel = function(scope, title, contentTemplateUrl) {
      scope.title = title || scope.title;
      scope.contentTemplateUrl = contentTemplateUrl || scope.contentTemplateUrl;

      return $modal.open({
        controller: function($scope, $modalInstance) {
          $scope.ok = function() {
            $modalInstance.close();
          };

          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          };
        },
        scope: scope,
        windowClass: 'create-modal',
        backdrop: 'static',
        keyboard: true,
        backdropClick: true,
        templateUrl: 'common/dialog/ok-cancel-dialog.tpl.html'
      }).result;
    };

    this.messageBox = function(title, message, options) {
      var scope = $rootScope.$new();
      scope.title = title || scope.title;
      scope.message = message;
      scope.options = options;
      return $modal.open({
        controller: function($scope, $modalInstance) {
          $scope.ok = function() {
            $modalInstance.close();
          };

          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          };
        },
        scope: scope,
        windowClass: 'create-modal',
        backdrop: 'static',
        keyboard: true,
        backdropClick: true,
        templateUrl: 'common/dialog/message-box.tpl.html'
      }).result;
    };

    this.redirectMessageBox = function(title, message, ok, cancel) {
      var scope = $rootScope.$new();
      scope.title = title || scope.title;
      scope.message = message;

      return $modal.open({
        controller: function($scope, $modalInstance) {
          $scope.ok = function() {
            $modalInstance.close();
            $state.go(ok);
          };

          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
            $state.go(cancel);
          };
        },
        scope: scope,
        windowClass: 'create-modal',
        backdrop: 'static',
        keyboard: true,
        backdropClick: true,
        templateUrl: 'common/dialog/message-box.tpl.html'
      }).result;
    };

    this.prompt = function(title, message) {
      var scope = $rootScope.$new();
      scope.title = title || scope.title;
      scope.message = message;

      return $modal.open({
        // controller: function ($scope, $modalInstance) {
        //   $scope.ok = function () {
        //     $modalInstance.close();
        //   };

        //   $scope.cancel = function () {
        //     $modalInstance.dismiss('cancel');
        //   };
        // },
        scope: scope,
        windowClass: 'create-modal',
        backdrop: 'static',
        keyboard: true,
        backdropClick: true,
        templateUrl: 'common/dialog/prompt.tpl.html'
      }).result;
    };

    this.open = function(scope, templateUrl, controller) {
      var opts = {
        controller: controller,
        scope: scope,
        windowClass: 'create-modal',
        backdrop: 'static',
        keyboard: true,
        backdropClick: true,
        templateUrl: templateUrl
      };
      return $modal.open(opts).result;
    };

    this.edit = function(scope, title, contentTemplateUrl) {
      return this.okCancel(scope, title, contentTemplateUrl);
    };

  });