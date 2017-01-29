'use strict';

angular
  .module('shangAngularTemplate')
  .config(function($urlRouterProvider, $stateProvider) {
    $stateProvider
      .state('webhook', {
        url: '/webhook',
        abstract: true,
        template: '<ui-view>',
      })
      .state('webhook.list', {
        url: '/list',
        templateUrl: 'webhook/webhooks.tpl.html',
        controller: 'WebhooksCtrl',
        resolve: {
          events: function(webhookEventEntity) {
            return webhookEventEntity
              .query({})
              .$promise;
          }
        }
      })
      .state('webhook.new', {
        url: '/new',
        templateUrl: 'webhook/webhook-detail.tpl.html',
        controller: 'WebhookDetailCtrl',
        resolve: {
          events: function(webhookEventEntity) {
            return webhookEventEntity
              .query({})
              .$promise;
          }
        }
      })
      .state('webhook.detail', {
        url: '/:id?mode',
        templateUrl: 'webhook/webhook-detail.tpl.html',
        controller: 'WebhookDetailCtrl',
        resolve: {
          events: function(webhookEventEntity) {
            return webhookEventEntity
              .query({})
              .$promise;
          }
        }
      });
  });