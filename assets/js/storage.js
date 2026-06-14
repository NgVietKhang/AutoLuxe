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

/* =============================================
  DATA MIGRATION HELPER (Phase 0)
  Versioned + idempotent schema enrichment
  ============================================= */

var DataMigration = (function () {
  'use strict';

  var KEYS = {
    marketPosts: 'autoluxe_market_posts',
    orders: 'autoluxe_orders',
    profiles: 'autoluxe_profiles',
    users: 'autoluxe_users',
    versions: 'autoluxe_data_migration_versions'
  };

  var CURRENT_VERSIONS = {
    market_posts: 1,
    orders: 1,
    profiles: 1
  };

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function cloneObject(source) {
    var out = {};
    if (!isObject(source)) return out;
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        out[key] = source[key];
      }
    }
    return out;
  }

  function normalizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function normalizeEmail(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  function ensureArray(value) {
    if (Array.isArray(value)) return value.slice();
    if (isObject(value)) {
      var arr = [];
      for (var key in value) {
        if (value.hasOwnProperty(key)) {
          arr.push(value[key]);
        }
      }
      return arr;
    }
    return [];
  }

  function normalizeModeration(value) {
    var normalized = normalizeText(value);
    if (!normalized) return 'approved';

    if (normalized === 'approved' || normalized === 'approve') return 'approved';
    if (normalized === 'rejected' || normalized === 'reject') return 'rejected';
    if (normalized === 'pending_approval' || normalized === 'pending') return 'pending_approval';

    return 'approved';
  }

  function normalizeAvailability(value) {
    if (value === true) return 'available';
    if (value === false) return 'sold';

    var normalized = normalizeText(value);
    if (!normalized) return 'available';

    if (normalized === 'sold' || normalized === 'unavailable' || normalized === 'completed') {
      return 'sold';
    }

    if (
      normalized === 'pending' ||
      normalized === 'pending_payment' ||
      normalized === 'reserved' ||
      normalized === 'on_hold'
    ) {
      return 'pending_payment';
    }

    return 'available';
  }

  function normalizeLegacyPostStatus(statusValue, availability) {
    var normalized = normalizeText(statusValue);

    if (!normalized) {
      return availability === 'pending_payment' ? 'pending' : availability;
    }

    if (
      normalized === 'pending_payment' ||
      normalized === 'reserved' ||
      normalized === 'on_hold' ||
      normalized === 'pending'
    ) {
      return 'pending';
    }

    if (normalized === 'available' || normalized === 'sold') {
      return normalized;
    }

    return String(statusValue);
  }

  function normalizeOrderStatus(statusValue) {
    var normalized = normalizeText(statusValue);
    if (!normalized) return 'new';

    if (normalized === 'new' || normalized === 'pending' || normalized === 'created') return 'new';
    if (normalized === 'confirmed' || normalized === 'approve' || normalized === 'approved') return 'confirmed';
    if (normalized === 'rejected' || normalized === 'reject' || normalized === 'declined') return 'rejected';
    if (normalized === 'shipping' || normalized === 'in_transit') return 'shipping';
    if (normalized === 'delivered' || normalized === 'completed' || normalized === 'complete') return 'delivered';
    if (normalized === 'cancelled' || normalized === 'canceled') return 'cancelled';

    return 'new';
  }

  function normalizeLegacyOrderStatus(orderStatus, currentStatus) {
    var normalizedCurrent = normalizeText(currentStatus);

    if (
      normalizedCurrent === 'pending' ||
      normalizedCurrent === 'confirmed' ||
      normalizedCurrent === 'rejected' ||
      normalizedCurrent === 'shipping' ||
      normalizedCurrent === 'delivered' ||
      normalizedCurrent === 'cancelled' ||
      normalizedCurrent === 'canceled'
    ) {
      return normalizedCurrent === 'canceled' ? 'cancelled' : normalizedCurrent;
    }

    if (!normalizedCurrent) {
      return orderStatus === 'new' ? 'pending' : orderStatus;
    }

    return String(currentStatus);
  }

  function readRawItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function getVersionMap() {
    var raw = Storage.get(KEYS.versions, {});
    return isObject(raw) ? raw : {};
  }

  function migrateMarketPosts() {
    var rawPosts = Storage.get(KEYS.marketPosts, []);
    var posts = ensureArray(rawPosts);
    var changed = !Array.isArray(rawPosts);
    var migrated = [];

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      if (!isObject(post)) {
        migrated.push(post);
        continue;
      }

      var nextPost = cloneObject(post);

      var sourceAvailability = nextPost.availability;
      if (sourceAvailability === undefined || sourceAvailability === null || sourceAvailability === '') {
        sourceAvailability = nextPost.status;
      }
      var normalizedAvailability = normalizeAvailability(sourceAvailability);
      if (nextPost.availability !== normalizedAvailability) {
        nextPost.availability = normalizedAvailability;
        changed = true;
      }

      var legacyStatus = normalizeLegacyPostStatus(nextPost.status, normalizedAvailability);
      if (nextPost.status !== legacyStatus) {
        nextPost.status = legacyStatus;
        changed = true;
      }

      var normalizedModeration = normalizeModeration(nextPost.moderation);
      if (nextPost.moderation !== normalizedModeration) {
        nextPost.moderation = normalizedModeration;
        changed = true;
      }

      migrated.push(nextPost);
    }

    if (changed) {
      Storage.set(KEYS.marketPosts, migrated);
    }

    return { changed: changed, count: migrated.length };
  }

  function migrateOrders() {
    var rawOrders = Storage.get(KEYS.orders, []);
    var orders = ensureArray(rawOrders);
    var changed = !Array.isArray(rawOrders);
    var migrated = [];

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      if (!isObject(order)) {
        migrated.push(order);
        continue;
      }

      var nextOrder = cloneObject(order);

      var normalizedOrderStatus = normalizeOrderStatus(nextOrder.orderStatus || nextOrder.status);
      if (nextOrder.orderStatus !== normalizedOrderStatus) {
        nextOrder.orderStatus = normalizedOrderStatus;
        changed = true;
      }

      var legacyStatus = normalizeLegacyOrderStatus(normalizedOrderStatus, nextOrder.status);
      if (nextOrder.status !== legacyStatus) {
        nextOrder.status = legacyStatus;
        changed = true;
      }

      if (typeof nextOrder.cancelWindowDays !== 'number' || nextOrder.cancelWindowDays <= 0) {
        nextOrder.cancelWindowDays = 7;
        changed = true;
      }

      if (typeof nextOrder.deliveryReminderSent !== 'boolean') {
        nextOrder.deliveryReminderSent = false;
        changed = true;
      }

      if (!nextOrder.updatedAt && nextOrder.createdAt) {
        nextOrder.updatedAt = nextOrder.createdAt;
        changed = true;
      }

      migrated.push(nextOrder);
    }

    if (changed) {
      Storage.set(KEYS.orders, migrated);
    }

    return { changed: changed, count: migrated.length };
  }

  function findProfileIndex(profiles, userId, email) {
    var normalizedEmail = normalizeEmail(email);

    for (var i = 0; i < profiles.length; i++) {
      var profile = profiles[i];
      if (!isObject(profile)) continue;

      if (userId && profile.userId === userId) return i;
      if (normalizedEmail && normalizeEmail(profile.email) === normalizedEmail) return i;
    }

    return -1;
  }

  function normalizeProfile(profile, nowIso) {
    var nextProfile = cloneObject(profile);
    var changed = false;

    var normalizedEmail = normalizeEmail(nextProfile.email);
    if (nextProfile.email !== normalizedEmail) {
      nextProfile.email = normalizedEmail;
      changed = true;
    }

    if (!nextProfile.fullName && nextProfile.fullName !== '') {
      nextProfile.fullName = '';
      changed = true;
    }
    if (!nextProfile.phone && nextProfile.phone !== '') {
      nextProfile.phone = '';
      changed = true;
    }
    if (!nextProfile.address && nextProfile.address !== '') {
      nextProfile.address = '';
      changed = true;
    }
    if (!nextProfile.avatar && nextProfile.avatar !== '') {
      nextProfile.avatar = '';
      changed = true;
    }

    if (!nextProfile.createdAt) {
      nextProfile.createdAt = nowIso;
      changed = true;
    }
    if (!nextProfile.updatedAt) {
      nextProfile.updatedAt = nextProfile.createdAt || nowIso;
      changed = true;
    }

    return {
      profile: nextProfile,
      changed: changed
    };
  }

  function migrateProfiles() {
    var rawProfiles = Storage.get(KEYS.profiles, []);
    var profiles = ensureArray(rawProfiles);
    var changed = !Array.isArray(rawProfiles);

    if (readRawItem(KEYS.profiles) === null && profiles.length === 0) {
      changed = true;
    }

    var nowIso = new Date().toISOString();
    var migrated = [];

    for (var i = 0; i < profiles.length; i++) {
      var profile = profiles[i];
      if (!isObject(profile)) {
        continue;
      }

      var normalized = normalizeProfile(profile, nowIso);
      migrated.push(normalized.profile);
      if (normalized.changed) changed = true;
    }

    var rawUsers = Storage.get(KEYS.users, []);
    var users = ensureArray(rawUsers);

    for (var j = 0; j < users.length; j++) {
      var user = users[j];
      if (!isObject(user)) continue;

      var userId = user.id || '';
      var userEmail = normalizeEmail(user.email);
      var index = findProfileIndex(migrated, userId, userEmail);

      if (index === -1) {
        migrated.push({
          userId: userId,
          email: userEmail,
          fullName: user.fullName || '',
          phone: '',
          address: '',
          avatar: '',
          createdAt: user.createdAt || nowIso,
          updatedAt: user.createdAt || nowIso
        });
        changed = true;
      } else {
        var existingProfile = migrated[index];
        if (!existingProfile.userId && userId) {
          existingProfile.userId = userId;
          changed = true;
        }
        if (!existingProfile.email && userEmail) {
          existingProfile.email = userEmail;
          changed = true;
        }
        if (!existingProfile.fullName && user.fullName) {
          existingProfile.fullName = user.fullName;
          changed = true;
        }
      }
    }

    if (changed) {
      Storage.set(KEYS.profiles, migrated);
    }

    return { changed: changed, count: migrated.length };
  }

  function run() {
    var versions = getVersionMap();
    var nextVersions = cloneObject(versions);
    var versionChanged = false;

    var marketResult = migrateMarketPosts();
    var orderResult = migrateOrders();
    var profileResult = migrateProfiles();

    if (nextVersions.market_posts !== CURRENT_VERSIONS.market_posts) {
      nextVersions.market_posts = CURRENT_VERSIONS.market_posts;
      versionChanged = true;
    }
    if (nextVersions.orders !== CURRENT_VERSIONS.orders) {
      nextVersions.orders = CURRENT_VERSIONS.orders;
      versionChanged = true;
    }
    if (nextVersions.profiles !== CURRENT_VERSIONS.profiles) {
      nextVersions.profiles = CURRENT_VERSIONS.profiles;
      versionChanged = true;
    }

    if (versionChanged) {
      Storage.set(KEYS.versions, nextVersions);
    }

    return {
      versions: nextVersions,
      market_posts: marketResult,
      orders: orderResult,
      profiles: profileResult
    };
  }

  return {
    run: run,
    currentVersions: CURRENT_VERSIONS
  };
})();

try {
  DataMigration.run();
} catch (e) {
  console.error('[DataMigration] Failed to run migrations:', e);
}
