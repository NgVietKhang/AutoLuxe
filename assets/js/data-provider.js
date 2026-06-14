/* =============================================
   DATA-PROVIDER.JS - AutoLuxe Phase 8+
   Collection abstraction over localStorage with
   optional remote provider stub for future backend.
   ============================================= */

var AutoLuxeData = (function () {
  'use strict';

  var COLLECTION_KEYS = {
    compare: 'autoluxe_compare',
    garage: 'autoluxe_garage',
    saved_searches: 'autoluxe_saved_searches',
    threads: 'autoluxe_threads',
    finance_draft: 'autoluxe_finance_draft',
    inbox_unread: 'autoluxe_inbox_unread'
  };

  function getConfig() {
    return (typeof window !== 'undefined' && window.AUTOLUXE_CONFIG) || {};
  }

  function getProviderMode() {
    var cfg = getConfig();
    return cfg.dataProvider === 'remote' ? 'remote' : 'local';
  }

  function emitChanged(collection, payload) {
    try {
      document.dispatchEvent(new CustomEvent('autoluxe:data-changed', {
        detail: { collection: collection, payload: payload || null }
      }));
    } catch (e) { /* ignore */ }
  }

  /* --- Local provider --- */
  var LocalStorageProvider = {
    get: function (key, fallback) {
      if (typeof Storage === 'undefined') return fallback;
      return Storage.get(key, fallback);
    },
    set: function (key, value) {
      if (typeof Storage === 'undefined') return false;
      var ok = Storage.set(key, value);
      return ok;
    },
    update: function (key, updaterFn, fallback) {
      if (typeof Storage === 'undefined') return false;
      return Storage.update(key, updaterFn, fallback);
    },
    remove: function (key) {
      if (typeof Storage === 'undefined') return false;
      return Storage.remove(key);
    }
  };

  /* --- Remote stub (Phase 15) --- */
  var RemoteProvider = {
    get: function () {
      return Promise.reject(new Error('Remote data provider is not configured. Set AUTOLUXE_CONFIG.remoteUrl and implement RemoteProvider.'));
    },
    set: function () {
      return Promise.reject(new Error('Remote data provider is not configured.'));
    },
    update: function () {
      return Promise.reject(new Error('Remote data provider is not configured.'));
    },
    remove: function () {
      return Promise.reject(new Error('Remote data provider is not configured.'));
    }
  };

  function warnRemote() {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[AutoLuxeData] Remote provider requested but not implemented; using local fallback.');
    }
  }

  function activeLocal() {
    return LocalStorageProvider;
  }

  function createList(collectionName) {
    var storageKey = COLLECTION_KEYS[collectionName];
    if (!storageKey) {
      throw new Error('Unknown collection: ' + collectionName);
    }

    return {
      key: storageKey,
      name: collectionName,

      getAll: function () {
        if (getProviderMode() === 'remote') {
          warnRemote();
        }
        var data = activeLocal().get(storageKey, []);
        return Array.isArray(data) ? data.slice() : [];
      },

      setAll: function (items) {
        var list = Array.isArray(items) ? items : [];
        if (getProviderMode() === 'remote') {
          warnRemote();
        }
        var ok = activeLocal().set(storageKey, list);
        if (ok) emitChanged(collectionName, { action: 'setAll', count: list.length });
        return ok;
      },

      update: function (updaterFn) {
        if (getProviderMode() === 'remote') {
          warnRemote();
        }
        var ok = activeLocal().update(storageKey, function (current) {
          var base = Array.isArray(current) ? current : [];
          return updaterFn(base.slice());
        }, []);
        if (ok) emitChanged(collectionName, { action: 'update' });
        return ok;
      },

      clear: function () {
        return this.setAll([]);
      }
    };
  }

  function getScalar(key, fallback) {
    if (getProviderMode() === 'remote') warnRemote();
    return activeLocal().get(key, fallback);
  }

  function setScalar(key, value) {
    if (getProviderMode() === 'remote') warnRemote();
    var ok = activeLocal().set(key, value);
    if (ok) emitChanged(key, { action: 'set' });
    return ok;
  }

  return {
    COLLECTION_KEYS: COLLECTION_KEYS,
    getProviderMode: getProviderMode,
    list: createList,
    getScalar: getScalar,
    setScalar: setScalar,
    RemoteProvider: RemoteProvider,
    syncOnLogin: function () {
      var cfg = getConfig();
      if (!cfg.remoteUrl || getProviderMode() !== 'remote') return Promise.resolve({ synced: false });
      return Promise.reject(new Error('syncOnLogin: configure RemoteProvider with your backend SDK.'));
    }
  };
})();
