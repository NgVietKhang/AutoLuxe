/* =============================================
   COMPARE.JS - AutoLuxe Phase 9+
   Compare page: pool picker + comparison grid
   ============================================= */

(function () {
  'use strict';

  var root = document.getElementById('compareContent');
  if (!root || typeof CompareService === 'undefined') return;

  var compareBasePath = './compare.html';

  var SPEC_ROWS = [
    { key: 'price', labelKey: 'compare.row_price', higherBetter: false },
    { key: 'horsepower', labelKey: 'compare.row_hp', higherBetter: true },
    { key: 'zeroToHundred', labelKey: 'compare.row_accel', higherBetter: false },
    { key: 'topSpeed', labelKey: 'compare.row_speed', higherBetter: true },
    { key: 'engine', labelKey: 'compare.row_engine', higherBetter: null },
    { key: 'drivetrain', labelKey: 'compare.row_drivetrain', higherBetter: null }
  ];

  var imageFallbackBound = false;

  init();

  function init() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('ids')) {
      CompareService.loadFromQuery(params.get('ids'));
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', CompareService.buildCompareUrl(compareBasePath));
      }
    }
    bindImageFallback();
    render();
    document.addEventListener('autoluxe:compare-changed', render);
    document.addEventListener('autoluxe:locale-changed', render);
  }

  function bindImageFallback() {
    if (imageFallbackBound) return;
    imageFallbackBound = true;
    document.addEventListener('error', onCompareImageError, true);
  }

  function onCompareImageError(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.hasAttribute('data-fallbacks')) return;
    if (!root.contains(img)) return;

    var list = [];
    try { list = JSON.parse(img.getAttribute('data-fallbacks') || '[]'); } catch (_err) { list = []; }
    var next = list.shift();
    img.setAttribute('data-fallbacks', JSON.stringify(list));
    if (next) {
      img.src = next;
    } else {
      img.removeAttribute('data-fallbacks');
    }
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function resolveCarImage(make, model) {
    if (typeof CarImagePaths !== 'undefined' && CarImagePaths && typeof CarImagePaths.resolveImage === 'function') {
      return CarImagePaths.resolveImage(make, model, { placeholder: getPlaceholderImageSafe() });
    }

    var placeholder = getPlaceholderImageSafe();
    return { primary: placeholder, fallbacks: [], candidates: [placeholder] };
  }

  function resolveCar(item) {
    var car = null;
    if (typeof getCarByMakeModel === 'function') {
      car = getCarByMakeModel(item.make, item.model);
    }
    if (!car && item.id && typeof getCarById === 'function') {
      car = getCarById(item.id);
    }
    var minPrice = getMinListingPrice(item.make, item.model);
    var imageResolved = resolveCarImage(item.make, item.model);
    var primary = imageResolved.primary || getPlaceholderImageSafe();
    if (primary === getPlaceholderImageSafe() && car && car.heroImage) {
      primary = car.heroImage;
    }
    return {
      item: item,
      car: car,
      minPrice: minPrice,
      image: primary,
      imageFallbacks: imageResolved.fallbacks || [],
      displayName: (item.make + ' ' + item.model).trim()
    };
  }

  function getMinListingPrice(make, model) {
    if (typeof Marketplace === 'undefined' || !Marketplace.getAvailableListingsByBrandModel) return null;
    var posts = Marketplace.getAvailableListingsByBrandModel(make, model);
    var min = null;
    posts.forEach(function (p) {
      var price = Number(p.price);
      if (!price || price <= 0) return;
      if (min === null || price < min) min = price;
    });
    return min;
  }

  function getPlaceholderImageSafe() {
    if (typeof getPlaceholderImage === 'function') return getPlaceholderImage();
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80';
  }

  function buildDetailHref(item) {
    if (item.id && String(item.id).indexOf(':') === -1) {
      return './car-detail.html?id=' + encodeURIComponent(item.id);
    }
    return './car-detail.html?make=' + encodeURIComponent(item.make) + '&model=' + encodeURIComponent(item.model) +
      (item.year ? '&year=' + encodeURIComponent(item.year) : '');
  }

  function numericVal(key, resolved) {
    var car = resolved.car;
    if (key === 'price') return resolved.minPrice;
    if (!car) return null;
    if (key === 'horsepower') return parseFloat(String(car.horsepower || '').replace(/[^\d.]/g, '')) || null;
    if (key === 'zeroToHundred') return parseFloat(String(car.zeroToHundred || '').replace(/[^\d.]/g, '')) || null;
    if (key === 'topSpeed') return parseFloat(String(car.topSpeed || '').replace(/[^\d.]/g, '')) || null;
    return null;
  }

  function textVal(key, resolved) {
    var car = resolved.car;
    if (key === 'price') {
      if (resolved.minPrice != null && typeof I18n !== 'undefined') {
        return I18n.formatCurrency(resolved.minPrice);
      }
      return _t('compare.price_none');
    }
    if (!car) return _t('common.updating');
    if (key === 'engine') return car.engine || _t('common.na');
    if (key === 'drivetrain') return car.drivetrain || _t('common.na');
    if (key === 'horsepower') return car.horsepower ? car.horsepower + ' HP' : _t('common.na');
    if (key === 'zeroToHundred') {
      if (!car.zeroToHundred) return _t('common.na');
      var accel = String(car.zeroToHundred).trim();
      return /s$/i.test(accel) ? accel : accel + ' s';
    }
    if (key === 'topSpeed') return car.topSpeed || _t('common.na');
    return _t('common.na');
  }

  function findWinners(resolvedList, row) {
    if (row.higherBetter === null) return {};
    var nums = resolvedList.map(function (r) { return numericVal(row.key, r); });
    var valid = nums.filter(function (n) { return n != null && !isNaN(n); });
    if (valid.length < 2) return {};
    var best = row.higherBetter ? Math.max.apply(null, valid) : Math.min.apply(null, valid);
    var winners = {};
    nums.forEach(function (n, i) {
      if (n != null && n === best) winners[i] = true;
    });
    return winners;
  }

  function buildCarHeadHTML(r, opts) {
    opts = opts || {};
    var html = '<div class="compare-car-head">';
    html += '<div class="compare-car-head__media"><img src="' + esc(r.image) + '" alt="" loading="lazy" data-fallbacks="' + esc(JSON.stringify(r.imageFallbacks || [])) + '"></div>';
    html += '<h3>' + esc(r.displayName) + '</h3>';
    if (r.item.year) html += '<p class="card__meta">' + esc(String(r.item.year)) + '</p>';
    html += '<div class="compare-car-head__actions">';
    html += '<a href="' + esc(buildDetailHref(r.item)) + '" class="btn btn--secondary btn--sm">' + esc(_t('common.view_detail')) + '</a>';
    if (opts.removeFromCompare) {
      html += '<button type="button" class="btn btn--ghost btn--sm" data-deselect-compare data-car-id="' + esc(r.item.id) + '">' + esc(_t('compare.remove_from_compare')) + '</button>';
    }
    html += '</div></div>';
    return html;
  }

  function buildDesktopGridHTML(resolved) {
    var html = '<div class="compare-grid-wrap compare-desktop"><div class="compare-grid" style="--compare-cols:' + resolved.length + '" role="table">';
    html += '<div class="compare-grid__corner" role="columnheader">' + esc(_t('compare.spec_label')) + '</div>';
    resolved.forEach(function (r) {
      html += '<div class="compare-grid__head" role="columnheader">' + buildCarHeadHTML(r, { removeFromCompare: true }) + '</div>';
    });

    SPEC_ROWS.forEach(function (row) {
      var winners = findWinners(resolved, row);
      html += '<div class="compare-grid__row" role="row">';
      html += '<div class="compare-grid__label" role="rowheader">' + esc(_t(row.labelKey)) + '</div>';
      resolved.forEach(function (r, idx) {
        var cellCls = 'compare-grid__cell' + (winners[idx] ? ' compare-win' : '');
        html += '<div class="' + cellCls + '" role="cell">' + esc(textVal(row.key, r)) + '</div>';
      });
      html += '</div>';
    });

    html += '</div></div>';
    return html;
  }

  function buildMobileCardsHTML(resolved) {
    var html = '<div class="compare-mobile">';
    resolved.forEach(function (r, carIdx) {
      html += '<article class="compare-mobile-card">';
      html += '<div class="compare-mobile-card__head">' + buildCarHeadHTML(r, { removeFromCompare: true }) + '</div>';
      html += '<dl class="compare-mobile-specs">';
      SPEC_ROWS.forEach(function (row) {
        var winners = findWinners(resolved, row);
        var ddCls = winners[carIdx] ? 'compare-win' : '';
        html += '<div class="compare-mobile-specs__row">';
        html += '<dt>' + esc(_t(row.labelKey)) + '</dt>';
        html += '<dd' + (ddCls ? ' class="' + ddCls + '"' : '') + '>' + esc(textVal(row.key, r)) + '</dd>';
        html += '</div>';
      });
      html += '</dl></article>';
    });
    html += '</div>';
    return html;
  }

  function buildPickerCardHTML(r, selectedCount, maxCompare) {
    var isSelected = r.item.selected === true;
    var atLimit = !isSelected && selectedCount >= maxCompare;
    var cardCls = 'compare-picker-card' +
      (isSelected ? ' is-selected' : '') +
      (atLimit ? ' is-disabled' : '');

    var html = '<article class="' + cardCls + '" data-picker-card data-car-id="' + esc(r.item.id) + '">';
    html += '<label class="compare-picker-card__select">';
    html += '<input type="checkbox" data-compare-select data-car-id="' + esc(r.item.id) + '"' +
      (isSelected ? ' checked' : '') +
      (atLimit ? ' disabled' : '') + '>';
    html += '<span class="compare-picker-card__check" aria-hidden="true"></span>';
    html += '</label>';
    html += '<div class="compare-picker-card__media"><img src="' + esc(r.image) + '" alt="" loading="lazy" data-fallbacks="' + esc(JSON.stringify(r.imageFallbacks || [])) + '"></div>';
    html += '<div class="compare-picker-card__body">';
    html += '<h3 class="compare-picker-card__title">' + esc(r.displayName) + '</h3>';
    if (r.item.year) html += '<p class="compare-picker-card__meta">' + esc(String(r.item.year)) + '</p>';
    html += '</div>';
    html += '<button type="button" class="btn btn--ghost btn--sm compare-picker-card__remove" data-compare-remove-pool data-car-id="' + esc(r.item.id) + '" aria-label="' + esc(_t('compare.remove_from_pool')) + '">&times;</button>';
    html += '</article>';
    return html;
  }

  function buildPickerHTML(pool, selectedCount) {
    var maxCompare = CompareService.MAX_COMPARE;
    var resolved = pool.map(resolveCar);
    var html = '<section class="compare-picker" aria-labelledby="comparePickerTitle">';
    html += '<div class="compare-picker__header">';
    html += '<div>';
    html += '<h2 id="comparePickerTitle" class="compare-picker__title">' + esc(_t('compare.picker_title')) + '</h2>';
    html += '<p class="compare-picker__subtitle">' + esc(_t('compare.pool_subtitle', { poolCount: pool.length, max: maxCompare })) + '</p>';
    html += '</div>';
    html += '<div class="compare-picker__counter" aria-live="polite">' + esc(_t('compare.selected_count', { count: selectedCount, max: maxCompare })) + '</div>';
    html += '</div>';

    if (selectedCount === 0) {
      html += '<p class="compare-picker__hint">' + esc(_t('compare.select_hint')) + '</p>';
    }

    html += '<div class="compare-picker__grid">';
    resolved.forEach(function (r) {
      html += buildPickerCardHTML(r, selectedCount, maxCompare);
    });
    html += '</div></section>';
    return html;
  }

  function bindPickerEvents() {
    root.querySelectorAll('[data-compare-select]').forEach(function (input) {
      input.addEventListener('change', function () {
        var id = input.getAttribute('data-car-id');
        var result = CompareService.toggleSelected(id);
        if (!result.ok) {
          input.checked = false;
          if (result.reason === 'selection_full' && typeof Toast !== 'undefined') {
            Toast.show(_t('compare.selection_full', { max: CompareService.MAX_COMPARE }), 'warning');
          }
          return;
        }
        render();
      });
    });

    root.querySelectorAll('[data-picker-card]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-compare-remove-pool]') || e.target.closest('input[type="checkbox"]')) return;
        var input = card.querySelector('[data-compare-select]');
        if (!input || input.disabled) return;
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    root.querySelectorAll('[data-compare-remove-pool]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-car-id');
        CompareService.removeById(id);
        if (typeof Toast !== 'undefined') Toast.show(_t('compare.removed_toast'), 'info');
        render();
      });
    });
  }

  function bindGridEvents() {
    var btnClear = document.getElementById('btnClearCompare');
    if (btnClear) {
      btnClear.addEventListener('click', function () {
        CompareService.clear();
        if (typeof Toast !== 'undefined') Toast.show(_t('compare.cleared'), 'info');
        render();
      });
    }

    var btnDeselect = document.getElementById('btnDeselectCompare');
    if (btnDeselect) {
      btnDeselect.addEventListener('click', function () {
        CompareService.clearSelection();
        render();
      });
    }

    var btnShare = document.getElementById('btnShareCompare');
    if (btnShare) {
      btnShare.addEventListener('click', function () {
        var url = new URL(CompareService.buildCompareUrl(compareBasePath), window.location.href).href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            if (typeof Toast !== 'undefined') Toast.show(_t('compare.link_copied'), 'success');
          });
        } else {
          prompt(_t('compare.share_link'), url);
        }
      });
    }

    root.querySelectorAll('[data-deselect-compare]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        CompareService.toggleSelected(btn.getAttribute('data-car-id'));
        render();
      });
    });
  }

  function render() {
    var pool = CompareService.getPool();
    var selected = CompareService.getSelected();
    var selectedCount = selected.length;
    document.title = _t('compare.title') + ' - AutoLuxe';

    if (!pool.length) {
      root.innerHTML =
        '<div class="compare-empty">' +
        '<div class="compare-empty__icon">⚖</div>' +
        '<h1 class="section-title">' + esc(_t('compare.empty_title')) + '</h1>' +
        '<p class="section-subtitle">' + esc(_t('compare.empty_desc')) + '</p>' +
        '<a href="./catalog.html" class="btn btn--primary">' + esc(_t('compare.explore_catalog')) + '</a>' +
        '</div>';
      return;
    }

    var html = '';

    html += '<div class="compare-header">';
    html += '<div><h1 class="section-title">' + esc(_t('compare.title')) + '</h1>';
    html += '<div class="divider"></div>';
    html += '<p class="section-subtitle" style="margin-bottom:0;">' + esc(_t('compare.pool_subtitle', { poolCount: pool.length, max: CompareService.MAX_COMPARE })) + '</p></div>';
    html += '<div class="compare-actions">';
    if (selectedCount > 0) {
      html += '<button type="button" class="btn btn--secondary btn--sm" id="btnDeselectCompare">' + esc(_t('compare.deselect_all')) + '</button>';
      html += '<button type="button" class="btn btn--secondary btn--sm" id="btnShareCompare">' + esc(_t('compare.share_link')) + '</button>';
    }
    html += '<button type="button" class="btn btn--danger btn--sm" id="btnClearCompare">' + esc(_t('compare.clear_all')) + '</button>';
    html += '</div></div>';

    html += buildPickerHTML(pool, selectedCount);

    if (selectedCount > 0) {
      var resolved = selected.map(resolveCar);
      html += '<section class="compare-results" aria-labelledby="compareResultsTitle">';
      html += '<h2 id="compareResultsTitle" class="compare-results__title">' + esc(_t('compare.results_title')) + '</h2>';
      html += '<p class="compare-results__subtitle">' + esc(_t('compare.subtitle', { count: selectedCount, max: CompareService.MAX_COMPARE })) + '</p>';
      html += buildMobileCardsHTML(resolved);
      html += buildDesktopGridHTML(resolved);
      html += '</section>';
    }

    root.innerHTML = html;
    bindPickerEvents();
    bindGridEvents();
  }

  window.AutoLuxeComparePage = { render: render };
})();
