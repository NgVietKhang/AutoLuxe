/* =============================================
   WISHLIST-PAGE.JS - AutoLuxe Supercar Web
   Wishlist page: render list, filter, delete (Phase 9)
   ============================================= */

(function () {
  'use strict';

  var contentEl = document.getElementById('wishlistContent');
  if (!contentEl) return;

  var currentTypeFilter = '';
  var currentBrandFilter = '';

  init();

  function init() {
    var session = Auth.getSession();
    if (!session) {
      renderLoginPrompt();
      return;
    }
    renderPage();
  }

  /* ===========================
     RENDER: LOGIN PROMPT
     =========================== */

  function renderLoginPrompt() {
    contentEl.innerHTML =
      '<div class="wishlist-empty">' +
        '<div class="wishlist-empty__icon">🔒</div>' +
        '<h2 class="wishlist-empty__title">' + _t('wishlist.login_title') + '</h2>' +
        '<p class="wishlist-empty__desc">' + _t('wishlist.login_desc') + '</p>' +
        '<div class="wishlist-empty__actions">' +
          '<a href="./auth.html" class="btn btn--primary">' + _t('common.login') + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ===========================
     RENDER: FULL PAGE
     =========================== */

  function renderPage() {
    var items = Wishlist.getMyWishlist();
    var brands = extractBrands(items);

    var html = '';

    html += '<div class="wishlist-header">';
    html += '<div>';
    html += '<h1 class="section-title">' + _t('wishlist.title') + '</h1>';
    html += '<div class="divider"></div>';
    html += '<p class="section-subtitle" style="margin-bottom:0;">' + _t('wishlist.subtitle') + '</p>';
    html += '</div>';
    if (items.length > 0) {
      html += '<div class="wishlist-header__actions">';
      html += '<button class="btn btn--danger btn--sm" id="btnClearAll">' + _t('wishlist.clear_all') + '</button>';
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="wishlist-filters">';
    html += '<div class="input-group">';
    html += '<label class="label" for="wlFilterType">' + _t('wishlist.filter_type') + '</label>';
    html += '<select class="input" id="wlFilterType">';
    html += '<option value="">' + _t('common.all') + '</option>';
    html += '<option value="catalog"' + (currentTypeFilter === 'catalog' ? ' selected' : '') + '>' + _t('nav.catalog') + '</option>';
    html += '<option value="market"' + (currentTypeFilter === 'market' ? ' selected' : '') + '>' + _t('nav.marketplace') + '</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="input-group">';
    html += '<label class="label" for="wlFilterBrand">' + _t('wishlist.filter_brand') + '</label>';
    html += '<select class="input" id="wlFilterBrand">';
    html += '<option value="">' + _t('common.all') + '</option>';
    for (var i = 0; i < brands.length; i++) {
      var sel = currentBrandFilter === brands[i] ? ' selected' : '';
      html += '<option value="' + esc(brands[i]) + '"' + sel + '>' + esc(brands[i]) + '</option>';
    }
    html += '</select>';
    html += '</div>';
    html += '</div>';

    html += '<div id="wlInfo"></div>';
    html += '<div id="wlGrid"></div>';

    contentEl.innerHTML = html;

    renderFilteredItems();
    bindPageEvents();
  }

  /* ===========================
     RENDER: FILTERED ITEMS
     =========================== */

  function renderFilteredItems() {
    var items = Wishlist.getMyWishlist();
    var filtered = applyFilters(items);

    var infoEl = document.getElementById('wlInfo');
    var gridEl = document.getElementById('wlGrid');
    if (!infoEl || !gridEl) return;

    if (items.length === 0) {
      infoEl.innerHTML = '';
      renderEmptyState(gridEl);
      return;
    }

    if (filtered.length === 0) {
      infoEl.innerHTML =
        '<div class="wishlist-info">' +
          '<p class="wishlist-info__count">' + _t('wishlist.no_match') + '</p>' +
        '</div>';
      gridEl.innerHTML = '';
      return;
    }

    infoEl.innerHTML =
      '<div class="wishlist-info">' +
        '<p class="wishlist-info__count">' + _t('wishlist.showing', { filtered: filtered.length, total: items.length }) + '</p>' +
      '</div>';

    var html = '<div class="wishlist-grid">';
    for (var i = 0; i < filtered.length; i++) {
      html += renderCard(filtered[i]);
    }
    html += '</div>';

    gridEl.innerHTML = html;
  }

  /* ===========================
     RENDER: SINGLE CARD
     =========================== */

  function renderCard(item) {
    var available = checkAvailability(item);
    var cardClass = 'wishlist-card' + (available ? '' : ' wishlist-card--unavailable');
    var typeLabel = item.itemType === 'catalog' ? _t('nav.catalog') : _t('nav.marketplace');

    var imageHtml;
    if (item.image) {
      imageHtml = '<div class="wishlist-card__image" style="background-image:url(\'' + esc(item.image) + '\')">';
    } else {
      imageHtml = '<div class="wishlist-card__image">' +
        '<div class="wishlist-card__image--fallback">🏎️</div>';
    }

    if (item.brand) {
      imageHtml += '<span class="badge wishlist-card__badge">' + esc(item.brand) + '</span>';
    }
    if (!available) {
      imageHtml += '<span class="wishlist-card__unavailable">' + _t('wishlist.unavailable') + '</span>';
    }
    imageHtml += '</div>';

    var priceHtml = '';
    if (item.price && item.itemType === 'market') {
      if (typeof I18n !== 'undefined' && typeof I18n.formatCurrency === 'function') {
        priceHtml = '<p class="wishlist-card__price">' + I18n.formatCurrency(item.price) + '</p>';
      } else {
        priceHtml = '<p class="wishlist-card__price">$' + Number(item.price).toLocaleString('en-US') + '</p>';
      }
    }

    var dateHtml = '';
    if (item.createdAt) {
      dateHtml = '<p class="wishlist-card__date">' + _t('wishlist.saved') + formatDate(item.createdAt) + '</p>';
    }

    var footerHtml = '<div class="wishlist-card__footer">';
    if (available && item.sourceUrl) {
      footerHtml += '<a href="' + esc(item.sourceUrl) + '" class="btn btn--secondary btn--sm">' + _t('common.view_detail') + '</a>';
    } else if (!available) {
      footerHtml += '<span style="font-size:var(--fs-xs);color:var(--color-text-muted);">' + _t('wishlist.item_deleted') + '</span>';
    } else {
      footerHtml += '<span></span>';
    }
    footerHtml += '<button class="btn btn--danger btn--sm" data-remove-id="' + esc(item.id) + '">' + _t('common.delete') + '</button>';
    footerHtml += '</div>';

    return '<article class="' + cardClass + '">' +
      imageHtml +
      '<div class="wishlist-card__body">' +
        '<span class="wishlist-card__type">' + esc(typeLabel) + '</span>' +
        '<h3 class="wishlist-card__title">' + esc(item.title || _t('wishlist.no_title')) + '</h3>' +
        (item.brand ? '<p class="wishlist-card__brand">' + esc(item.brand) + '</p>' : '') +
        priceHtml +
        dateHtml +
      '</div>' +
      footerHtml +
    '</article>';
  }

  /* ===========================
     FILTERS
     =========================== */

  function applyFilters(items) {
    var filtered = items.slice();

    if (currentTypeFilter) {
      filtered = filtered.filter(function (item) {
        return item.itemType === currentTypeFilter;
      });
    }

    if (currentBrandFilter) {
      filtered = filtered.filter(function (item) {
        return item.brand === currentBrandFilter;
      });
    }

    return filtered;
  }

  function extractBrands(items) {
    var brandSet = {};
    for (var i = 0; i < items.length; i++) {
      if (items[i].brand) {
        brandSet[items[i].brand] = true;
      }
    }
    return Object.keys(brandSet).sort();
  }

  /* ===========================
     AVAILABILITY CHECK
     =========================== */

  function resolveCatalogCar(item) {
    if (typeof getCarById === 'function') {
      var byId = getCarById(item.itemId);
      if (byId) return byId;
    }
    if (typeof getCarByMakeModel === 'function' && item.brand && item.title) {
      var modelName = item.title.replace(item.brand, '').trim();
      return getCarByMakeModel(item.brand, modelName);
    }
    return null;
  }

  function checkAvailability(item) {
    try {
      if (item.itemType === 'catalog') {
        return resolveCatalogCar(item) !== null;
      }
      if (item.itemType === 'market') {
        if (typeof Marketplace !== 'undefined' && Marketplace.getPostById) {
          return Marketplace.getPostById(item.itemId) !== null;
        }
        return true;
      }
    } catch (e) {
      return true;
    }
    return true;
  }

  /* ===========================
     EMPTY STATE
     =========================== */

  function renderEmptyState(container) {
    container.innerHTML =
      '<div class="wishlist-empty">' +
        '<div class="wishlist-empty__icon">💝</div>' +
        '<h2 class="wishlist-empty__title">' + _t('wishlist.empty_title') + '</h2>' +
        '<p class="wishlist-empty__desc">' + _t('wishlist.empty_desc') + '</p>' +
        '<div class="wishlist-empty__actions">' +
          '<a href="./catalog.html" class="btn btn--primary">' + _t('wishlist.explore_catalog') + '</a>' +
          '<a href="./marketplace.html" class="btn btn--secondary">' + _t('wishlist.view_marketplace') + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ===========================
     EVENT BINDINGS
     =========================== */

  function bindPageEvents() {
    var typeSelect = document.getElementById('wlFilterType');
    var brandSelect = document.getElementById('wlFilterBrand');
    var clearBtn = document.getElementById('btnClearAll');

    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        currentTypeFilter = typeSelect.value;
        renderFilteredItems();
      });
    }

    if (brandSelect) {
      brandSelect.addEventListener('change', function () {
        currentBrandFilter = brandSelect.value;
        renderFilteredItems();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        var confirmed = confirm(_t('wishlist.clear_confirm'));
        if (!confirmed) return;
        Wishlist.clearMyWishlist();
        Wishlist.showToast(_t('wishlist.cleared'), 'success');
        renderPage();
      });
    }

    contentEl.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('[data-remove-id]');
      if (!removeBtn) return;

      var id = removeBtn.getAttribute('data-remove-id');
      if (!id) return;

      var result = Wishlist.removeById(id);
      if (result.success) {
        Wishlist.showToast(_t('wishlist.removed'), 'success');
        renderPage();
      }
    });
  }

  /* ===========================
     HELPERS
     =========================== */

  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  function formatDate(isoStr) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatDate === 'function') {
      return I18n.formatDate(isoStr);
    }
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      var day = ('0' + d.getDate()).slice(-2);
      var month = ('0' + (d.getMonth() + 1)).slice(-2);
      return day + '/' + month + '/' + d.getFullYear();
    } catch (e) {
      return '';
    }
  }
})();
