'use strict';

angular
  .module('shangAngularTemplate')
  .controller('WebhookDetailCtrl',
    function($scope, $state, $stateParams, $translate, events, webhookEntity, dialogService) {
      $scope.events = events;
      $scope.webhook = new webhookEntity({id: $stateParams.id});
      $scope.editing = $stateParams.mode === 'editing' || !$scope.webhook.id;

      $scope.load = function() {
        if(!$scope.webhook.id) {
          $scope.webhook.suspended = false;
          $scope.webhook.method = 'email';
          return;
        }

        $scope.webhook
          .$get()
          .then(function() {
            if($scope.editing) {
              $scope.edit();
            }
          });

      };

      $scope.edit = function() {
        $state.go('.', {id: $scope.webhook.id, mode: 'editing'});
      };

      $scope.save = function(form) {
        form.submitted = true;
        if(form.$invalid) {
          return;
        }

        ($scope.webhook.id ? $scope.webhook.$update() : $scope.webhook.$save())
          .then(function(data) {
            $scope.editing = false;
            if(!$scope.webhook.id) {
              $state.go('.', {id: data.id});
            } else {
              $state.go('.', {id: $scope.webhook.id, mode: undefined});
            }
          });
      };

      $scope.cancel = function() {
        if($scope.webhook.id) {
          $state.go('.', {id: $scope.webhook.id, mode: undefined});
        } else {
          $state.go('^.list');
        }
      };

      $scope.delete = function() {
        dialogService
          .messageBox($translate.instant('webhooks.deleteConfirmTitle'), $translate.instant('webhooks.deleteConfirmMessage'), {
            displayCancel: true,
            displayOK: true
          })
          .then(function() {
            $scope.webhook.$delete()
              .then(function() {
                $state.go('^.list');
              });
          });
      };

      $scope.isEventEnabled = function(event) {
        return $scope.webhook.events ? $scope.webhook.events.indexOf(event.name) >= 0 : false;
      };

      $scope.toggleEvent = function(event) {
        var events = $scope.webhook.events = $scope.webhook.events || [];
        var index = events.indexOf(event.name);
        if(index < 0) {
          events.push(event.name);
        } else {
          events.splice(index, 1);
        }
      };

      $scope.load();
    });
