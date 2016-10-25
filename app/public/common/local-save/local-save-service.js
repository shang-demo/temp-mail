'use strict';


angular
  .module('common')
  .service('localSaveService', function() {
    var cache = {};
    var keyNames = {};
    var prefix = '__shang__';

    this.setPrefix = function(p) {
      prefix = p;
    };

    // 存在 key 获取此属性值, 不存在key返回 cache
    this.get = function(key) {
      if(!key) {
        return cache;
      }
      return getItem(key);
    };

    // 保存整个 cache 对象 或 保存 属性值
    this.set = function(key, value) {
      if(angular.isObject(key)) {
        return setObj(key);
      }
      return setItem(key, value);
    };

    this.remove = function(key) {
      if(key === true) {
        // TODO: 清除localStorage缓存
        cache = {};
      }
      else {
        delete cache[key];
        saveToLocal(key);
      }
    };

    // 从localStorage获取 cacher对象
    this.initFromLocal = function() {
      try {
        keyNames = JSON.parse(localStorage.getItem(prefix + '__keyNames__')) || {};
      }
      catch(e) {
        console.log(e);
      }
      
      _.forEach(keyNames, function(value, key) {
        try{
          cache[key] = JSON.parse(localStorage.getItem(prefix + key));
        }
        catch(e) {
          console.log(e);
        }
      });
      return cache;
    };

    function getItem(key) {
      return cache[key];
    }

    function setItem(key, value) {
      cache[key] = value;
      saveToLocal(key);
    }

    function setObj(obj) {
      cache = obj;
      saveToLocal();
    }

    function saveToLocal(key) {

      if(!cache) {
        return;
      }

      if(key) {
        keyNames[key] = 1;
        localStorage.setItem(prefix + key, JSON.stringify(cache[key]));
      }
      else {
        _.forEach(cache, function(value, key) {
          keyNames[key] = 1;
          localStorage.setItem(prefix + key, JSON.stringify(cache[key]));
        });
      }

      return localStorage.setItem(prefix + '__keyNames__', JSON.stringify(keyNames));
    }

    this.initFromLocal();
  });