'use strict';

angular
  .module('shangAngularTemplate')
  .factory('webhookEntity', function($resource) {
    return $resource(
      '/api/v1/webhook/:id',
      {id: '@id'},
      {
        update: {method: 'PUT'}
      }
    );
  })
  .factory('webhookEventEntity', function($resource) {
    return $resource(
      '/api/v1/webhook-event',
      {},
      {
        update: {method: 'PUT'}
      }
    );
  })
;