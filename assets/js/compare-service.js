/* =============================================
   COMPARE-SERVICE.JS - AutoLuxe Phase 9+
   Compare pool (unlimited) + selection (max 3)
   ============================================= */

var CompareService = (function () {
  'use strict';

  var MAX_COMPARE = 3;
  var MAX_ITEMS = MAX_COMPARE; /* backward compat */
  var listApi = AutoLuxeData.list('compare');
  var migrationDone = false;

  function normalizeKey(make, model, year) {
    return [
      String(make || '').trim().toLowerCase(),
      String(model || '').trim().toLowerCase(),
      String(year || '').trim()
    ].join('|');
  }

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function toId(make, model, year) {
    return slugify(make) + ':' + slugify(model) + ':' + (year || '');
  }

  function parseId(id) {
    var parts = String(id || '').split(':');
    if (parts.length < 2) return null;
    var year = '';
    var modelParts;
    if (parts.length >= 3 && /^\d{4}$/.test(parts[parts.length - 1])) {
      year = parts[parts.length - 1];
      modelParts = parts.slice(1, parts.length - 1);
    } else {
      modelParts = parts.slice(1);
    }
    return {
      make: parts[0].replace(/-/g, ' '),
      model: modelParts.join('-').replace(/-/g, ' '),
      year: year
    };
  }

  function migrateIfNeeded() {
    if (migrationDone) return;
    migrationDone = true;
    var all = listApi.getAll();
    if (!all.length) return;
    var changed = false;
    all.forEach(function (entry) {
      if (typeof entry.selected !== 'boolean') {
        entry.selected = true;
        changed = true;
      }
    });
    if (changed) listApi.setAll(all);
  }

  function getAll() {
    migrateIfNeeded();
    return listApi.getAll();
  }

  function getPool() {
    return getAll();
  }

  function getSelected() {
    return getAll().filter(function (x) { return x.selected === true; });
  }

  function count() {
    return getAll().length;
  }

  function selectedCount() {
    return getSelected().length;
  }

  function findIndex(item) {
    var key = normalizeKey(item.make, item.model, item.year);
    var all = getAll();
    for (var i = 0; i < all.length; i++) {
      if (normalizeKey(all[i].make, all[i].model, all[i].year) === key) return i;
    }
    return -1;
  }

  function findById(id) {
    var all = getAll();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return i;
    }
    return -1;
  }

  function isInCompare(make, model, year) {
    return findIndex({ make: make, model: model, year: year }) >= 0;
  }

  function add(item) {
    if (!item || !item.make || !item.model) return { ok: false, reason: 'invalid' };
    if (isInCompare(item.make, item.model, item.year)) {
      return { ok: false, reason: 'duplicate' };
    }
    var all = getAll();
    var entry = {
      id: item.id || toId(item.make, item.model, item.year),
      make: item.make,
      model: item.model,
      year: item.year || '',
      source: item.source || 'catalog',
      addedAt: Date.now(),
      selected: item.selected === true
    };
    all.push(entry);
    listApi.setAll(all);
    return { ok: true, item: entry };
  }

  function remove(make, model, year) {
    var idx = findIndex({ make: make, model: model, year: year });
    if (idx < 0) return false;
    var all = getAll();
    all.splice(idx, 1);
    listApi.setAll(all);
    return true;
  }

  function removeById(id) {
    var all = getAll().filter(function (x) { return x.id !== id; });
    listApi.setAll(all);
    return true;
  }

  function clear() {
    listApi.clear();
  }

  function clearSelection() {
    var all = getAll();
    var changed = false;
    all.forEach(function (entry) {
      if (entry.selected) {
        entry.selected = false;
        changed = true;
      }
    });
    if (changed) listApi.setAll(all);
    return true;
  }

  function toggleSelected(id) {
    var idx = findById(id);
    if (idx < 0) return { ok: false, reason: 'not_found' };
    var all = getAll();
    var entry = all[idx];
    if (entry.selected) {
      entry.selected = false;
      listApi.setAll(all);
      return { ok: true, selected: false, item: entry };
    }
    if (selectedCount() >= MAX_COMPARE) {
      return { ok: false, reason: 'selection_full' };
    }
    entry.selected = true;
    listApi.setAll(all);
    return { ok: true, selected: true, item: entry };
  }

  function setSelected(id, selected) {
    if (selected) {
      var idx = findById(id);
      if (idx < 0) return { ok: false, reason: 'not_found' };
      var all = getAll();
      if (!all[idx].selected && selectedCount() >= MAX_COMPARE) {
        return { ok: false, reason: 'selection_full' };
      }
      all[idx].selected = true;
      listApi.setAll(all);
      return { ok: true, item: all[idx] };
    }
    return toggleSelected(id);
  }

  function buildCompareUrl(basePath) {
    var items = getSelected();
    var path = basePath || getComparePageHref().split('#')[0];
    if (!items.length) return path;
    var qs = items.map(function (it) {
      return encodeURIComponent(it.id || toId(it.make, it.model, it.year));
    }).join(',');
    return path + '?ids=' + qs;
  }

  function loadFromQuery(idsParam) {
    if (!idsParam) return [];
    var ids = String(idsParam).split(',').filter(Boolean);
    var loaded = [];
    ids.forEach(function (raw) {
      var id = decodeURIComponent(raw);
      var parsed = parseId(id);
      if (!parsed) return;
      var make = parsed.make;
      var model = parsed.model;
      var year = parsed.year;
      if (typeof BrandModelNormalize !== 'undefined') {
        make = BrandModelNormalize.normalizeMake(make) || make;
      }
      if (isInCompare(make, model, year)) {
        var idx = findIndex({ make: make, model: model, year: year });
        var all = getAll();
        if (idx >= 0) {
          all[idx].selected = true;
          listApi.setAll(all);
        }
      } else {
        add({ make: make, model: model, year: year, id: id, source: 'catalog', selected: true });
      }
      loaded.push(id);
    });
    return loaded;
  }

  function dispatchBadgeUpdate() {
    try {
      document.dispatchEvent(new CustomEvent('autoluxe:compare-changed', {
        detail: { count: count(), selectedCount: selectedCount() }
      }));
    } catch (e) { /* ignore */ }
  }

  listApi._afterMutate = dispatchBadgeUpdate;

  var _origSet = listApi.setAll;
  listApi.setAll = function (items) {
    var r = _origSet.call(listApi, items);
    dispatchBadgeUpdate();
    return r;
  };

  document.addEventListener('autoluxe:data-changed', function (e) {
    if (e.detail && e.detail.collection === 'compare') dispatchBadgeUpdate();
  });

  function renderCompareBtnHTML(opts) {
    var make = opts.make;
    var model = opts.model;
    var year = opts.year || '';
    var active = isInCompare(make, model, year);
    var label = active ? _t('compare.in_list') : _t('compare.add');
    return '<button type="button" class="btn btn--ghost btn--sm compare-btn-add' + (active ? ' is-active' : '') + '"' +
      ' data-compare-toggle data-make="' + escapeAttr(make) + '" data-model="' + escapeAttr(model) + '"' +
      ' data-year="' + escapeAttr(year) + '" data-source="' + escapeAttr(opts.source || 'catalog') + '"' +
      (opts.id ? ' data-car-id="' + escapeAttr(opts.id) + '"' : '') + '>' + label + '</button>';
  }

  function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function bindDelegatedCompareButtons(container) {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-compare-toggle]');
      if (!btn) return;
      e.preventDefault();
      var make = btn.getAttribute('data-make');
      var model = btn.getAttribute('data-model');
      var year = btn.getAttribute('data-year') || '';
      var carId = btn.getAttribute('data-car-id') || '';
      if (isInCompare(make, model, year)) {
        remove(make, model, year);
        if (typeof Toast !== 'undefined') Toast.show(_t('compare.removed_toast'), 'info');
      } else {
        var result = add({
          make: make,
          model: model,
          year: year,
          id: carId || toId(make, model, year),
          source: btn.getAttribute('data-source') || 'catalog'
        });
        if (!result.ok) {
          var msg = result.reason === 'duplicate' ? _t('compare.duplicate') : _t('compare.add_failed');
          if (typeof Toast !== 'undefined') Toast.show(msg, 'warning');
        } else if (typeof Toast !== 'undefined') {
          Toast.show(_t('compare.added_toast'), 'success');
        }
      }
      btn.classList.toggle('is-active', isInCompare(make, model, year));
      btn.textContent = isInCompare(make, model, year) ? _t('compare.in_list') : _t('compare.add');
    });
  }

  function getComparePageHref() {
    var inPages = window.location.pathname.indexOf('/pages/') !== -1;
    return inPages ? './compare.html' : './pages/compare.html';
  }

  return {
    MAX_COMPARE: MAX_COMPARE,
    MAX_ITEMS: MAX_ITEMS,
    toId: toId,
    parseId: parseId,
    getAll: getAll,
    getPool: getPool,
    getSelected: getSelected,
    count: count,
    selectedCount: selectedCount,
    isInCompare: isInCompare,
    add: add,
    remove: remove,
    removeById: removeById,
    clear: clear,
    clearSelection: clearSelection,
    toggleSelected: toggleSelected,
    setSelected: setSelected,
    buildCompareUrl: buildCompareUrl,
    loadFromQuery: loadFromQuery,
    normalizeKey: normalizeKey,
    renderCompareBtnHTML: renderCompareBtnHTML,
    bindDelegatedCompareButtons: bindDelegatedCompareButtons,
    getComparePageHref: getComparePageHref
  };
})();
