/* =============================================
   STORAGE.JS - AutoLuxe Supercar Web
   LocalStorage helper with safe JSON handling
   ============================================= */

var Storage = (function () {
  'use strict';

  /**
   * Get a value from localStorage, parsed from JSON.
   * Returns fallbackValue if key doesn't exist or JSON is corrupted.
   */
  function get(key, fallbackValue) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallbackValue !== undefined ? fallbackValue : null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Storage] JSON parse error for key "' + key + '":', e);
      return fallbackValue !== undefined ? fallbackValue : null;
    }
  }

  /**
   * Set a value in localStorage as JSON string.
   */
  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[Storage] Failed to set key "' + key + '":', e);
      return false;
    }
  }

  /**
   * Update a value using an updater function.
   * updaterFn receives the current value and should return the new value.
   */
  function update(key, updaterFn, fallbackValue) {
    var current = get(key, fallbackValue !== undefined ? fallbackValue : null);
    var updated = updaterFn(current);
    return set(key, updated);
  }

  /**
   * Remove a key from localStorage.
   */
  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('[Storage] Failed to remove key "' + key + '":', e);
      return false;
    }
  }

  return {
    get: get,
    set: set,
    update: update,
    remove: remove
  };
})();
