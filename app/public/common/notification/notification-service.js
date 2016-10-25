'use strict';

angular
  .module('common')
  .service('notificationService', function($timeout) {
    var notifications = [];
    var svc = this;

    this.getNotifications = function() {
      return notifications;
    };

    this.removeNotification = function(notification) {
      notifications.splice(notifications.indexOf(notification), 1);
    };

    this.error = function(message, timeout) {
      var notification = {
        type: 'error',
        message: message
      };
      notifications.push(notification);
      $timeout(function() {
        svc.removeNotification(notification);
      }, timeout || 5000);
    };

    this.warn = function(message, timeout) {
      var notification = {
        type: 'warn',
        message: message
      };
      notifications.push(notification);
      $timeout(function() {
        svc.removeNotification(notification);
      }, timeout || 3000);
    };

    this.info = function(message, timeout) {
      var notification = {
        type: 'info',
        message: message
      };
      notifications.push(notification);
      $timeout(function() {
        svc.removeNotification(notification);
      }, timeout || 2000);
    };
  });
