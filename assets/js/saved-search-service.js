/* =============================================
   SAVED-SEARCH-SERVICE.JS - AutoLuxe Phase 12
   ============================================= */

var SavedSearchService = (function () {
  'use strict';

  var listApi = AutoLuxeData.list('saved_searches');

  function getOwnerKey() {
    try {
      var session = Auth.getSession();
      return session ? (session.email || session.userId) : null;
    } catch (e) {
      return null;
    }
  }

  function getMine() {
    var key = getOwnerKey();
    if (!key) return [];
    return listApi.getAll().filter(function (s) { return s.ownerKey === key; });
  }

  function add(filter) {
    var ownerKey = getOwnerKey();
    if (!ownerKey) return { ok: false, reason: 'login' };
    var entry = {
      id: 'ss_' + Date.now().toString(36),
      ownerKey: ownerKey,
      label: filter.label || _t('saved_search.default_label'),
      brand: filter.brand || '',
      model: filter.model || '',
      minPrice: filter.minPrice != null ? Number(filter.minPrice) : null,
      maxPrice: filter.maxPrice != null ? Number(filter.maxPrice) : null,
      yearMin: filter.yearMin != null ? Number(filter.yearMin) : null,
      createdAt: Date.now()
    };
    listApi.update(function (all) {
      all.push(entry);
      return all;
    });
    return { ok: true, entry: entry };
  }

  function remove(id) {
    var ownerKey = getOwnerKey();
    listApi.update(function (all) {
      return all.filter(function (s) { return !(s.id === id && s.ownerKey === ownerKey); });
    });
  }

  function postMatchesFilter(post, filter) {
    if (!post || !filter) return false;
    if (filter.brand && normalize(post.brand) !== normalize(filter.brand)) return false;
    if (filter.model && normalize(post.model) !== normalize(filter.model)) return false;
    var price = Number(post.price) || 0;
    if (filter.minPrice != null && price < filter.minPrice) return false;
    if (filter.maxPrice != null && price > filter.maxPrice) return false;
    if (filter.yearMin != null) {
      var y = Number(post.year) || 0;
      if (y < filter.yearMin) return false;
    }
    return true;
  }

  function normalize(v) {
    return String(v || '').trim().toLowerCase();
  }

  function buildFilterQuery(filter) {
    var q = {};
    if (filter.brand) q.brand = filter.brand;
    if (filter.model) q.model = filter.model;
    if (filter.minPrice != null) q.minPrice = filter.minPrice;
    if (filter.maxPrice != null) q.maxPrice = filter.maxPrice;
    return q;
  }

  function notifyMatches(post, reason) {
    var searches = listApi.getAll();
    searches.forEach(function (s) {
      if (!postMatchesFilter(post, s)) return;
      var dedupeKey = s.id + ':' + (post.id || '') + ':' + reason;
      var seen = Storage.get('autoluxe_saved_search_notified', {});
      if (seen[dedupeKey]) return;
      seen[dedupeKey] = Date.now();
      Storage.set('autoluxe_saved_search_notified', seen);
      if (typeof Notifications !== 'undefined' && Notifications.emitEvent) {
        Notifications.emitEvent('saved_search_match', {
          userKey: s.ownerKey,
          filterQuery: buildFilterQuery(s),
          params: {
            label: s.label,
            postTitle: ((post.brand || '') + ' ' + (post.model || '')).trim()
          }
        });
      }
    });
  }

  function runMatcherOnPosts(posts) {
    if (!Array.isArray(posts)) return;
    posts.forEach(function (p) {
      if (typeof Marketplace !== 'undefined' && Marketplace.isPostPubliclyVisible && !Marketplace.isPostPubliclyVisible(p)) return;
      notifyMatches(p, 'scan');
    });
  }

  return {
    getMine: getMine,
    add: add,
    remove: remove,
    postMatchesFilter: postMatchesFilter,
    buildFilterQuery: buildFilterQuery,
    notifyMatches: notifyMatches,
    runMatcherOnPosts: runMatcherOnPosts
  };
})();
