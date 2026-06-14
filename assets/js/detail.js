/* =============================================
   DETAIL.JS - AutoLuxe Supercar Web
   Car detail page logic: parse params, render
   ============================================= */

(function () {
  'use strict';

  var contentEl = document.getElementById('detailContent');
  if (!contentEl) return;

  init();

  async function init() {
    /* --- Parse query params --- */
    var params = new URLSearchParams(window.location.search);
    var carId = params.get('id');
    var carMake = params.get('make');
    var carModel = params.get('model');
    var carYear = params.get('year');

    if (!carId && !carMake && !carModel) {
      renderNotFound();
      return;
    }

    var query = {
      id: carId,
      make: carMake,
      model: carModel,
      year: carYear
    };

    renderLoading(carMake, carModel);

    var car = await loadCarDetail(query);

    if (!car) {
      renderNotFound();
      return;
    }

    if (typeof CatalogVisibility !== 'undefined' &&
        CatalogVisibility.isDemoFilterEnabled() &&
        !CatalogVisibility.isCatalogItemVisible(car.make, car.model)) {
      renderNotFound();
      return;
    }

    renderDetail(car, query);

    var titleMake = car.make || '';
    var titleModel = car.model || '';
    var displayTitle = (titleMake + ' ' + titleModel).trim() || _t('detail.fallback_title');
    document.title = displayTitle + ' - AutoLuxe';
  }

  async function loadCarDetail(query) {
    try {
      if (typeof CarDataAdapter !== 'undefined' && CarDataAdapter && typeof CarDataAdapter.fetchDetailWithImage === 'function') {
        var result = await CarDataAdapter.fetchDetailWithImage(query);
        if (result && result.detail) {
          return result.detail;
        }
      }
    } catch (e) {
      // Fallback to legacy functions below
    }

    var car = null;
    if (query.id) {
      car = getCarById(query.id);
    }
    if (!car && (query.make || query.model)) {
      car = getCarByMakeModel(query.make, query.model);
    }
    return car;
  }

  /* === Render loading state === */
  function renderLoading(make, model) {
    var name = ((make || '') + ' ' + (model || '')).trim();
    var html = '';
    html += '<div class="detail-loading" style="text-align:center;padding:var(--space-2xl) 0;">';
    html += '  <div class="spinner"></div>';
    html += '  <p style="margin-top:var(--space-md);font-size:var(--fs-lg);">' + (name ? esc(name) : _t('detail.fallback_title')) + '</p>';
    html += '  <p style="color:var(--color-text-muted);margin-top:var(--space-sm);">' + _t('catalog.quickview_loading') + '</p>';
    html += '</div>';
    contentEl.innerHTML = html;
  }

  /* === Render detail page === */
  function renderDetail(car, query) {
    var imageMake = (query && query.make) || car.make;
    var imageModel = (query && query.model) || car.model;
    var resolved = resolveCarImage(imageMake, imageModel);
    var heroSrc = resolved.primary || getPlaceholderImage();
    var heroFallbacks = (resolved.fallbacks || []).slice();
    var specs = buildSpecs(car);
    var related = getRelatedCars(car, 4);
    var listingSummary = getMarketplaceListingSummary(car.make, car.model);
    var hasMinimalData = isMinimalDataMode(car);

    var html = '';
    var catalogFallbackUrl = './catalog.html?make=' + encodeURIComponent(car.make || '');

    /* Back (top) */
    html += '<button type="button" id="detailBackBtn" class="detail-back" data-fallback-url="' + esc(catalogFallbackUrl) + '">';
    html += '<span class="detail-back__icon" aria-hidden="true">&#8592;</span>';
    html += '<span>' + _t('detail.back_prev') + '</span>';
    html += '</button>';

    /* Breadcrumb */
    var carDisplayName = (esc(car.make) + ' ' + esc(car.model)).trim() || _t('detail.fallback_title');
    html += '<nav class="detail-breadcrumb" aria-label="Breadcrumb">';
    html += '<a href="./catalog.html">' + _t('nav.catalog') + '</a> &rarr; ';
    html += '<span>' + carDisplayName + '</span>';
    html += '</nav>';

    /* Header */
    html += '<div class="detail-header">';
    html += '<h1 class="detail-header__title">' + carDisplayName + '</h1>';
    var yearFallback = car._enrichmentAttempted ? _t('common.na') : _t('common.updating');
    html += '<p class="detail-header__meta"><span>' + (esc(car.make) || _t('detail.fallback_title')) + '</span> &bull; ' + (car.year || yearFallback) + '</p>';
    html += '<p class="detail-header__market">' + esc(listingSummary.countText) + '</p>';
    html += '</div>';

    /* Divider */
    html += '<div class="divider"></div>';

    if (hasMinimalData) {
      html += '<div class="detail-updating">';
      html += '  <p class="detail-updating__title">' + _t('detail.data_pending') + '</p>';
      html += '  <p class="detail-updating__desc">' + _t('detail.fallback_info') + '</p>';
      html += '</div>';
    }

    /* Hero Image */
    html += '<div class="detail-hero">';
    html += '<img class="detail-hero__img" id="heroImg" src="' + esc(heroSrc) + '" alt="' + esc(car.make + ' ' + car.model) + '" data-fallbacks="' + esc(JSON.stringify(heroFallbacks)) + '">';
    html += '</div>';

    /* Specs Grid */
    html += '<div class="detail-specs">';
    html += '<h2 class="detail-specs__title">' + _t('detail.specs_title') + '</h2>';
    html += '<div class="detail-specs__grid">';
    specs.forEach(function (spec) {
      html += '<div class="detail-specs__item">';
      html += '<p class="detail-specs__label">' + esc(spec.label) + '</p>';
      html += '<p class="detail-specs__value">' + esc(spec.value) + '</p>';
      html += '</div>';
    });
    html += '</div>';
    html += '</div>';

    /* Description */
    html += '<div class="detail-description">';
    html += '<h2 class="detail-description__title">' + _t('detail.desc_title') + '</h2>';
    if (car.shortDescription) {
      html += '<p class="detail-description__short">' + esc(car.shortDescription) + '</p>';
    }
    if (car.longDescription) {
      html += '<p class="detail-description__long">' + esc(car.longDescription) + '</p>';
    }
    if (!car.shortDescription && !car.longDescription) {
      var descFallback = car._enrichmentAttempted ? _t('common.na') : _t('detail.desc_updating');
      html += '<p class="detail-description__long">' + descFallback + '</p>';
    }
    html += '</div>';

    /* Actions */
    html += '<div class="detail-actions">';
    if (listingSummary.count > 0) {
      html += '<a href="' + esc(listingSummary.url) + '" class="btn btn--primary">' + _t('detail.view_marketplace_count', { count: listingSummary.count }) + '</a>';
    } else {
      html += '<button type="button" class="btn btn--primary is-disabled" disabled aria-disabled="true">' + _t('detail.view_marketplace_none') + '</button>';
    }
    if (typeof Wishlist !== 'undefined') {
      html += Wishlist.renderWishlistBtnHTML({
        itemType: 'catalog',
        itemId: car.id,
        brand: car.make,
        title: car.make + ' ' + car.model,
        image: heroSrc,
        price: 0,
        sourceUrl: buildDetailSourceUrl(car, query)
      });
    }
    if (typeof CompareService !== 'undefined') {
      html += CompareService.renderCompareBtnHTML({
        make: car.make,
        model: car.model,
        year: car.year || query.year || '',
        id: car.id,
        source: 'catalog'
      });
    }
    html += '</div>';
    if (listingSummary.count === 0) {
      html += '<p class="detail-market-hint">' + _t('detail.market_none_hint') + '</p>';
    }

    /* Related Cars */
    if (related.length > 0) {
      html += '<div class="detail-related">';
      html += '<h2 class="detail-related__title">' + _t('detail.related_title') + '</h2>';
      html += '<div class="divider"></div>';
      html += '<div class="detail-related__grid" style="margin-top:var(--space-lg);">';
      related.forEach(function (r) {
        var relatedResolved = resolveRelatedCarImage(r.make, r.model);
        var rImg = relatedResolved.primary || getPlaceholderImage();
        var rFallbacks = relatedResolved.fallbacks || [];
        var isPlaceholder = rImg === getPlaceholderImage();
        var imgClass = 'detail-related__card-img' + (isPlaceholder ? ' detail-related__card-img--placeholder' : '');
        html += '<a href="./car-detail.html?id=' + esc(r.id) + '" class="detail-related__card">';
        html += '<img class="' + imgClass + '" src="' + esc(rImg) + '" alt="' + esc(r.make + ' ' + r.model) + '" data-fallbacks="' + esc(JSON.stringify(rFallbacks)) + '">';
        html += '<div class="detail-related__card-body">';
        html += '<p class="detail-related__card-title">' + esc(r.make) + ' ' + esc(r.model) + '</p>';
        html += '<p class="detail-related__card-meta">' + esc(r.engine || _t('common.na')) + ' &bull; ' + (r.horsepower || '?') + ' HP</p>';
        html += '</div>';
        html += '</a>';
      });
      html += '</div>';
      html += '</div>';
    }

    contentEl.innerHTML = html;

    bindBackNavigation(catalogFallbackUrl);
    bindHeroImageFallback();
    bindRelatedImageFallback();

    /* Bind wishlist buttons */
    if (typeof Wishlist !== 'undefined') {
      Wishlist.bindDelegatedWishlistButtons(contentEl);
    }
    if (typeof CompareService !== 'undefined') {
      CompareService.bindDelegatedCompareButtons(contentEl);
    }
  }

  function bindBackNavigation(fallbackUrl) {
    var btn = document.getElementById('detailBackBtn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      goBackPreferred(btn.getAttribute('data-fallback-url') || fallbackUrl);
    });
  }

  function goBackPreferred(fallbackUrl) {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var returnUrl = params.get('return');
    if (returnUrl && isSameOrigin(returnUrl)) {
      window.location.href = returnUrl;
      return;
    }

    if (fallbackUrl) {
      window.location.href = fallbackUrl;
    }
  }

  function isSameOrigin(url) {
    try {
      var parsed = new URL(url, window.location.href);
      return parsed.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function bindHeroImageFallback() {
    var heroImg = document.getElementById('heroImg');
    if (!heroImg) return;
    heroImg.addEventListener('error', onHeroImageError, true);
  }

  function onHeroImageError(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG') return;

    var placeholder = getPlaceholderImage();
    if (isPlaceholderSrc(img.src, placeholder)) return;

    if (!img.hasAttribute('data-fallbacks')) {
      img.src = placeholder;
      markRelatedPlaceholder(img);
      return;
    }

    var list = [];
    try { list = JSON.parse(img.getAttribute('data-fallbacks') || '[]'); } catch (_e) { list = []; }
    var next = list.shift();
    img.setAttribute('data-fallbacks', JSON.stringify(list));

    if (next) {
      img.src = next;
      if (isPlaceholderSrc(next, placeholder)) {
        markRelatedPlaceholder(img);
      }
      return;
    }

    img.removeAttribute('data-fallbacks');
    img.src = placeholder;
    markRelatedPlaceholder(img);
  }

  function markRelatedPlaceholder(img) {
    if (img && img.classList && img.classList.contains('detail-related__card-img')) {
      img.classList.add('detail-related__card-img--placeholder');
    }
  }

  function isPlaceholderSrc(src, placeholder) {
    if (!src) return false;
    var value = String(src);
    var marker = 'placeholder.svg';
    return value.indexOf(marker) !== -1 || (placeholder && value === placeholder);
  }

  function bindRelatedImageFallback() {
    var relatedGrid = contentEl.querySelector('.detail-related__grid');
    if (!relatedGrid) return;
    relatedGrid.addEventListener('error', onHeroImageError, true);
  }

  /* === Render not found === */
  function renderNotFound() {
    var html = '';
    html += '<div class="detail-notfound">';
    html += '<div class="detail-notfound__icon">🔍</div>';
    html += '<h1 class="detail-notfound__title">' + _t('detail.notfound_title') + '</h1>';
    html += '<p class="detail-notfound__desc">' + _t('detail.notfound_desc') + '</p>';
    html += '<a href="./catalog.html" class="btn btn--primary">' + _t('detail.back_catalog') + '</a>';
    html += '</div>';
    contentEl.innerHTML = html;
  }

  function resolveCarImage(make, model) {
    if (typeof CarImagePaths !== 'undefined' && CarImagePaths && typeof CarImagePaths.resolveImage === 'function') {
      return CarImagePaths.resolveImage(make, model, { placeholder: getPlaceholderImage() });
    }

    var placeholder = getPlaceholderImage();
    return { primary: placeholder, fallbacks: [], candidates: [placeholder] };
  }

  function resolveRelatedCarImage(make, model) {
    var placeholder = getPlaceholderImage();
    var resolved = resolveCarImage(make, model);

    if (!resolved.primary || resolved.primary === placeholder) {
      return { primary: placeholder, fallbacks: [] };
    }

    return {
      primary: resolved.primary,
      fallbacks: [placeholder]
    };
  }

  /* === Build specs array === */
  function buildSpecs(car) {
    var fallback = car._enrichmentAttempted ? _t('common.na') : _t('common.updating');
    return [
      { label: _t('detail.spec_power'), value: car.horsepower ? car.horsepower + ' HP' : fallback },
      { label: _t('detail.spec_topspeed'), value: car.topSpeed || fallback },
      { label: _t('detail.spec_accel'), value: car.zeroToHundred || fallback },
      { label: _t('detail.spec_engine'), value: car.engine || fallback },
      { label: _t('detail.spec_drivetrain'), value: car.drivetrain || fallback },
      { label: _t('detail.spec_year'), value: car.year ? String(car.year) : fallback }
    ];
  }

  function getMarketplaceListingSummary(makeName, modelName) {
    var count = 0;
    var url = './marketplace.html';

    if (makeName && modelName) {
      url += '?brand=' + encodeURIComponent(makeName) + '&model=' + encodeURIComponent(modelName);
      count = countAvailableListings(makeName, modelName);
    }

    var minPrice = null;
    if (typeof Marketplace !== 'undefined' && Marketplace.getAvailableListingsByBrandModel) {
      var listings = Marketplace.getAvailableListingsByBrandModel(makeName, modelName);
      listings.forEach(function (p) {
        var pr = Number(p.price);
        if (pr > 0 && (minPrice === null || pr < minPrice)) minPrice = pr;
      });
    }

    return {
      count: count,
      url: url,
      minPrice: minPrice,
      countText: count > 0
        ? _t('detail.market_available_count', { count: count })
        : _t('detail.market_available_none')
    };
  }

  function countAvailableListings(makeName, modelName) {
    var posts = Storage.get('autoluxe_market_posts', []);
    var list = Array.isArray(posts) ? posts : [];
    var targetMake = normalizeToken(makeName);
    var targetModel = normalizeToken(modelName);
    var count = 0;

    for (var i = 0; i < list.length; i++) {
      var post = list[i];
      if (!post || typeof post !== 'object') continue;
      if (normalizeToken(post.brand) !== targetMake || normalizeToken(post.model) !== targetModel) continue;
      if (!isApprovedAndAvailable(post)) continue;
      count++;
    }

    return count;
  }

  function isApprovedAndAvailable(post) {
    var moderation = normalizeModeration(post.moderation);
    if (moderation !== 'approved') return false;

    var source = post.availability;
    if (source === undefined || source === null || source === '') {
      source = post.status;
    }
    return normalizeAvailability(source) === 'available';
  }

  function normalizeModeration(value) {
    var normalized = normalizeToken(value);
    if (!normalized) return 'approved';
    if (normalized === 'pending' || normalized === 'pending_approval') return 'pending_approval';
    if (normalized === 'rejected' || normalized === 'reject') return 'rejected';
    if (normalized === 'approved' || normalized === 'approve') return 'approved';
    return 'approved';
  }

  function normalizeAvailability(value) {
    if (value === true) return 'available';
    if (value === false) return 'sold';
    var normalized = normalizeToken(value);
    if (!normalized) return 'available';
    if (normalized === 'available') return 'available';
    if (normalized === 'pending' || normalized === 'pending_payment' || normalized === 'reserved' || normalized === 'on_hold') {
      return 'pending_payment';
    }
    if (normalized === 'sold' || normalized === 'unavailable' || normalized === 'completed') {
      return 'sold';
    }
    return 'available';
  }

  function normalizeToken(value) {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isMinimalDataMode(car) {
    if (!car || typeof car !== 'object') return true;

    var missingSpecs = !car.horsepower || !car.engine || !car.topSpeed || !car.zeroToHundred || !car.drivetrain || !car.year;
    var missingDescription = !car.shortDescription && !car.longDescription;
    return missingSpecs || missingDescription;
  }

  function buildDetailSourceUrl(car, query) {
    query = query || {};
    if (query.id && typeof getCarById === 'function' && getCarById(query.id)) {
      return './car-detail.html?id=' + encodeURIComponent(query.id);
    }
    if (car.make && car.model) {
      var url = './car-detail.html?make=' + encodeURIComponent(car.make) + '&model=' + encodeURIComponent(car.model);
      if (query.year) {
        url += '&year=' + encodeURIComponent(query.year);
      }
      return url;
    }
    return './car-detail.html?id=' + encodeURIComponent(car.id);
  }

  /* === Escape HTML === */
  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

})();
