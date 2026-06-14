/* =============================================
   CATALOG.JS - AutoLuxe Supercar Web
   Modern catalog: fetch, filter, sort, paginate,
   NHTSA model list + local CAR_DATABASE images/specs.
   ============================================= */

(function () {
  'use strict';

  /* --- DOM References --- */
  var selectMake = document.getElementById('filterMake');
  var selectYear = document.getElementById('filterYear');
  var inputSearch = document.getElementById('searchModel');
  var selectSort = document.getElementById('sortMode');
  var btnViewGrid = document.getElementById('viewGrid');
  var btnViewList = document.getElementById('viewList');
  var btnRetry = document.getElementById('btnRetry');
  var resultsContainer = document.getElementById('catalogResults');
  var skeletonContainer = document.getElementById('catalogSkeleton');
  var resultsCount = document.getElementById('resultsCount');
  var stateContainer = document.getElementById('catalogState');
  var catalogBrandsView = document.getElementById('catalogBrandsView');
  var catalogCatalogPane = document.getElementById('catalogCatalogPane');
  var paginationContainer = document.getElementById('catalogPagination');
  var quickviewEl = document.getElementById('catalogQuickview');
  var quickviewBody = document.getElementById('quickviewBody');

  /* --- State --- */
  var allMakes = [];
  var currentModels = [];
  var filteredModels = [];
  var availabilityMap = {};
  var prefilledMake = '';
  var currentPage = 1;
  var pageSize = 12;
  var sortMode = 'az';
  var viewMode = 'grid';
  var selectedYear = '';
  var searchTimer = null;
  var lastFocusedEl = null;
  var isCatalogListVisible = false;
  var isRestoringFromUrl = false;

  var PAGE_SIZE_OPTIONS = 12;

  var CATALOG_EXCLUDED_MODELS = {
    lamborghini: ['147'],
    koenigsegg: ['koenigsegg automotive']
  };

  function isExcludedCatalogModel(makeName, modelName) {
    if (!makeName || !modelName) return false;
    var makeKey = String(makeName).trim().toLowerCase();
    var modelKey = String(modelName).trim().toLowerCase();
    var blocked = CATALOG_EXCLUDED_MODELS[makeKey];
    if (!blocked || !blocked.length) return false;
    return blocked.indexOf(modelKey) !== -1;
  }

  /* --- Init --- */
  init();

  function init() {
    pageSize = PAGE_SIZE_OPTIONS;
    var catalogQuery = parseCatalogQuery();
    prefilledMake = catalogQuery.make;
    populateYearOptions();
    if (catalogQuery.year) {
      selectedYear = catalogQuery.year;
      selectYear.value = catalogQuery.year;
    }
    if (catalogQuery.q) {
      inputSearch.value = catalogQuery.q;
    }
    if (catalogQuery.sort && ['az', 'za', 'available'].indexOf(catalogQuery.sort) !== -1) {
      sortMode = catalogQuery.sort;
      selectSort.value = catalogQuery.sort;
    }
    if (catalogQuery.page > 1) {
      currentPage = catalogQuery.page;
    }
    if (catalogQuery.view === 'list' || catalogQuery.view === 'grid') {
      viewMode = catalogQuery.view;
      btnViewGrid.classList.toggle('is-active', viewMode === 'grid');
      btnViewList.classList.toggle('is-active', viewMode === 'list');
      btnViewGrid.setAttribute('aria-pressed', String(viewMode === 'grid'));
      btnViewList.setAttribute('aria-pressed', String(viewMode === 'list'));
    }
    loadMakes();
    bindEvents();
    bindBrandGridEvents();
    updateDataSourceChips();
    if (typeof Wishlist !== 'undefined') {
      Wishlist.bindDelegatedWishlistButtons(resultsContainer);
    }
    if (typeof CompareService !== 'undefined') {
      CompareService.bindDelegatedCompareButtons(resultsContainer);
    }
    revealPageChrome();
  }

  function updateDataSourceChips() {
    /* Chips are static in catalog.html (NHTSA vPIC + AutoLuxe Database). */
  }

  /* --- Event Binding --- */
  function bindEvents() {
    selectMake.addEventListener('change', onMakeChange);
    selectYear.addEventListener('change', onYearChange);
    inputSearch.addEventListener('input', onSearchInput);
    selectSort.addEventListener('change', onSortChange);
    btnViewGrid.addEventListener('click', function () { setViewMode('grid'); });
    btnViewList.addEventListener('click', function () { setViewMode('list'); });
    btnRetry.addEventListener('click', onRetry);

    /* Image fallback chain (capture phase, error doesn't bubble) */
    document.addEventListener('error', onImageError, true);

    /* Pagination (delegated) */
    paginationContainer.addEventListener('click', onPaginationClick);

    /* Quick view (delegated) */
    resultsContainer.addEventListener('click', onResultsClick);

    /* Quick view modal close */
    if (quickviewEl) {
      var closers = quickviewEl.querySelectorAll('[data-quickview-close]');
      for (var i = 0; i < closers.length; i++) {
        closers[i].addEventListener('click', closeQuickView);
      }
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && quickviewEl && quickviewEl.classList.contains('is-open')) {
        closeQuickView();
      }
    });

    /* Re-render on locale change so dynamic text follows language */
    document.addEventListener('autoluxe:locale-changed', function () {
      if (selectMake.value && (filteredModels.length || currentModels.length)) {
        renderResults();
      }
    });
  }

  function bindBrandGridEvents() {
    if (!catalogBrandsView) return;
    catalogBrandsView.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="make="]');
      if (!link) return;
      e.preventDefault();
      try {
        var url = new URL(link.getAttribute('href'), window.location.href);
        var make = url.searchParams.get('make');
        if (!make) return;
        selectMakeFromBrand(make);
      } catch (err) { /* ignore */ }
    });
  }

  function selectMakeFromBrand(makeName) {
    var options = selectMake.options;
    var matched = '';
    for (var i = 0; i < options.length; i++) {
      if (options[i].value && options[i].value.toLowerCase() === String(makeName).toLowerCase()) {
        matched = options[i].value;
        break;
      }
    }
    if (!matched) {
      for (var j = 0; j < options.length; j++) {
        if (options[j].value && options[j].value.toLowerCase().indexOf(String(makeName).toLowerCase()) !== -1) {
          matched = options[j].value;
          break;
        }
      }
    }
    if (matched) {
      selectMake.value = matched;
      onMakeChange();
    }
  }

  function showBrandsView() {
    if (catalogBrandsView) catalogBrandsView.hidden = false;
    if (catalogCatalogPane) {
      catalogCatalogPane.hidden = true;
      catalogCatalogPane.style.display = 'none';
    }
    hideSkeleton();
    hideState();
    if (resultsContainer) {
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
    }
    hidePagination();
    if (resultsCount && resultsCount.parentElement) {
      resultsCount.parentElement.style.display = 'none';
    }
    isCatalogListVisible = false;
    syncCatalogUrl('brands');
  }

  function showCatalogView() {
    if (catalogBrandsView) catalogBrandsView.hidden = true;
    if (catalogCatalogPane) {
      catalogCatalogPane.hidden = false;
      catalogCatalogPane.style.display = '';
    }
  }

  /* --- Year options --- */
  function populateYearOptions() {
    var now = new Date().getFullYear();
    var maxYear = now + 1;
    var minYear = 1990;
    var frag = document.createDocumentFragment();
    for (var y = maxYear; y >= minYear; y--) {
      var opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      frag.appendChild(opt);
    }
    selectYear.appendChild(frag);
  }

  /* --- Load Makes into Select --- */
  function getCatalogMakeList() {
    if (typeof CatalogVisibility !== 'undefined' && CatalogVisibility.isDemoFilterEnabled()) {
      return CatalogVisibility.getVisibleBrands().map(function (name) {
        return { name: name };
      });
    }

    return null;
  }

  async function loadMakes() {
    try {
      var demoMakes = getCatalogMakeList();
      var filteredMakes;

      if (demoMakes) {
        filteredMakes = demoMakes.slice();
      } else {
        allMakes = await fetchAllMakes();

        var supercarMakes = [
          'FERRARI', 'LAMBORGHINI', 'MCLAREN', 'PORSCHE', 'BUGATTI',
          'ASTON MARTIN', 'BENTLEY', 'ROLLS-ROYCE', 'MASERATI',
          'LOTUS', 'PAGANI', 'KOENIGSEGG', 'MERCEDES-BENZ', 'BMW',
          'AUDI', 'JAGUAR', 'ALFA ROMEO', 'FORD', 'CHEVROLET',
          'DODGE', 'NISSAN', 'TOYOTA', 'LEXUS', 'ACURA'
        ];

        filteredMakes = allMakes.filter(function (make) {
          return supercarMakes.indexOf(make.name.toUpperCase()) !== -1;
        });

        /* Merge makes from local CAR_DATABASE that NHTSA may miss */
        if (typeof CAR_DATABASE !== 'undefined' && Array.isArray(CAR_DATABASE)) {
          var localMakeMap = {};
          CAR_DATABASE.forEach(function (car) {
            if (!car.make) return;
            var key = car.make.toUpperCase();
            if (supercarMakes.indexOf(key) !== -1) {
              localMakeMap[key] = car.make;
            }
          });
          var seen = {};
          filteredMakes.forEach(function (m) { seen[m.name.toUpperCase()] = true; });
          Object.keys(localMakeMap).forEach(function (key) {
            if (!seen[key]) {
              filteredMakes.push({ name: localMakeMap[key] });
              seen[key] = true;
            }
          });
        }
      }

      filteredMakes.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });

      selectMake.innerHTML = '<option value="">' + _t('catalog.select_make') + '</option>';
      filteredMakes.forEach(function (make) {
        var option = document.createElement('option');
        option.value = make.name;
        option.textContent = make.name;
        selectMake.appendChild(option);
      });

      if (prefilledMake) {
        if (typeof CatalogVisibility !== 'undefined' &&
            CatalogVisibility.isDemoFilterEnabled() &&
            !CatalogVisibility.isBrandVisible(prefilledMake)) {
          prefilledMake = '';
          showBrandsView();
          return;
        }

        var matchedMake = findMatchingMakeValue(prefilledMake, filteredMakes);
        if (matchedMake) {
          selectMake.value = matchedMake;
          prefilledMake = '';
          isRestoringFromUrl = true;
          onMakeChange();
          isRestoringFromUrl = false;
          return;
        }
        prefilledMake = '';
      }

      showBrandsView();
    } catch (err) {
      showState('error', err.message);
    }
  }

  /* --- Event Handlers --- */
  async function onMakeChange() {
    if (!isRestoringFromUrl) {
      inputSearch.value = '';
      currentPage = 1;
    }
    loadModels();
  }

  function onYearChange() {
    selectedYear = selectYear.value;
    currentPage = 1;
    if (selectMake.value) {
      loadModels();
    } else {
      showBrandsView();
    }
  }

  async function loadModels() {
    var makeName = selectMake.value;

    if (!makeName) {
      showBrandsView();
      return;
    }

    if (typeof CatalogVisibility !== 'undefined' &&
        CatalogVisibility.isDemoFilterEnabled() &&
        !CatalogVisibility.isBrandVisible(makeName)) {
      selectMake.value = '';
      showBrandsView();
      return;
    }

    showCatalogView();
    showSkeleton();

    try {
      var apiModels = await fetchModelsByMake(makeName, selectedYear || undefined);
      currentModels = mergeLocalModels(makeName, apiModels);
      availabilityMap = buildAvailableListingCountMap();
      applyFiltersAndRender();
    } catch (err) {
      currentModels = mergeLocalModels(makeName, []);
      if (currentModels.length === 0) {
        hideSkeleton();
        showState('error', err.message);
        return;
      }
      availabilityMap = buildAvailableListingCountMap();
      applyFiltersAndRender();
    }
  }

  function mergeLocalModels(makeName, apiModels) {
    var map = {};
    (apiModels || []).forEach(function (m) {
      if (isExcludedCatalogModel(makeName, m.name)) return;
      map[m.name.toLowerCase()] = m;
    });
    if (typeof getCarsByMake === 'function') {
      try {
        var localCars = getCarsByMake(makeName);
        localCars.forEach(function (car) {
          if (!car.model) return;
          if (isExcludedCatalogModel(makeName, car.model)) return;
          var key = car.model.toLowerCase();
          if (!map[key]) {
            map[key] = {
              id: car.id || key,
              name: car.model,
              makeName: car.make
            };
          }
        });
      } catch (e) { /* ignore */ }
    }
    return Object.values(map);
  }

  function onSearchInput() {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      currentPage = 1;
      applyFiltersAndRender();
    }, 220);
  }

  function onSortChange() {
    sortMode = selectSort.value || 'az';
    currentPage = 1;
    applyFiltersAndRender();
  }

  function setViewMode(mode) {
    viewMode = mode === 'list' ? 'list' : 'grid';
    btnViewGrid.classList.toggle('is-active', viewMode === 'grid');
    btnViewList.classList.toggle('is-active', viewMode === 'list');
    btnViewGrid.setAttribute('aria-pressed', String(viewMode === 'grid'));
    btnViewList.setAttribute('aria-pressed', String(viewMode === 'list'));
    resultsContainer.classList.toggle('is-list', viewMode === 'list');
    if (selectMake.value) {
      syncCatalogUrl('replace');
    }
  }

  function onRetry() {
    if (!selectMake.value) {
      loadMakes();
    } else {
      loadModels();
    }
  }

  /* --- Filtering + Sorting --- */
  function applyFiltersAndRender() {
    var keyword = inputSearch.value.trim().toLowerCase();

    if (!keyword) {
      filteredModels = currentModels.slice();
    } else {
      filteredModels = currentModels.filter(function (model) {
        return model.name.toLowerCase().indexOf(keyword) !== -1;
      });
    }

    if (typeof CatalogVisibility !== 'undefined' && CatalogVisibility.isDemoFilterEnabled()) {
      filteredModels = CatalogVisibility.filterVisibleModels(filteredModels);
    }

    sortModels(filteredModels);
    renderResults();
    if (selectMake.value) {
      syncCatalogUrl(isCatalogListVisible ? 'replace' : 'push');
    }
  }

  function sortModels(list) {
    if (sortMode === 'za') {
      list.sort(function (a, b) { return b.name.localeCompare(a.name); });
    } else if (sortMode === 'available') {
      list.sort(function (a, b) {
        var ca = getAvailableListingCount(a.makeName, a.name);
        var cb = getAvailableListingCount(b.makeName, b.name);
        if (cb !== ca) return cb - ca;
        return a.name.localeCompare(b.name);
      });
    } else {
      list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    }
  }

  /* --- Render --- */
  function renderResults() {
    hideSkeleton();

    if (filteredModels.length === 0) {
      hidePagination();
      if (currentModels.length === 0 && selectMake.value) {
        showState('empty', _t('catalog.state_empty_no_model'));
      } else if (inputSearch.value.trim()) {
        showState('empty', _t('catalog.state_empty_keyword', { keyword: inputSearch.value.trim() }));
      } else if (!selectMake.value && selectedYear) {
        showState('empty', _t('catalog.state_empty_year', { year: selectedYear }));
      } else {
        showState('empty', _t('catalog.state_empty_nodata'));
      }
      return;
    }

    hideState();

    var totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * pageSize;
    var pageItems = filteredModels.slice(start, start + pageSize);

    var countKey = 'catalog.results_count';
    resultsCount.innerHTML = _t(countKey, { count: filteredModels.length });
    resultsCount.parentElement.style.display = '';

    var html = '';
    pageItems.forEach(function (model) {
      html += renderCard(model);
    });

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = '';
    resultsContainer.classList.toggle('is-list', viewMode === 'list');

    renderPagination(totalPages);
    revealCards();
    hydrateCardSpecs(pageItems);
  }

  function renderCard(model) {
    var detailUrl = buildDetailUrl(model.makeName, model.name);
    var marketUrl = './marketplace.html?brand=' + encodeURIComponent(model.makeName) + '&model=' + encodeURIComponent(model.name);
    var cardId = (model.makeName + '-' + model.name).toLowerCase().replace(/\s+/g, '-');
    var listingCount = getAvailableListingCount(model.makeName, model.name);

    var localCar = getLocalCar(model.makeName, model.name);
    var wishlistItemId = (localCar && localCar.id) ? localCar.id : cardId;
    var resolved = buildImageFallbacks(model);
    var primary = resolved.primary || getPlaceholderImageSafe();
    var fallbacks = resolved.fallbacks || [];
    var specHtml = buildCardSpecHtml(localCar);

    var html = '';
    html += '<article class="catalog-card" data-reveal data-card-key="' + escapeAttr(cardId) + '">';
    html += '  <div class="catalog-card__media">';
    html += '    <img class="catalog-card__img" loading="lazy" alt="' + escapeAttr(model.makeName + ' ' + model.name) + '" src="' + escapeAttr(primary) + '" data-fallbacks="' + escapeAttr(JSON.stringify(fallbacks)) + '">';
    if (listingCount > 0) {
      html += '    <span class="catalog-card__availability-badge is-available">' + escapeHtml(_t('catalog.market_available_count', { count: listingCount })) + '</span>';
    }
    html += '    <button type="button" class="catalog-card__quickview" data-quickview data-make="' + escapeAttr(model.makeName) + '" data-model="' + escapeAttr(model.name) + '">' + _t('catalog.quickview') + '</button>';
    html += '  </div>';
    html += '  <div class="catalog-card__body">';
    html += '    <p class="catalog-card__make">' + escapeHtml(model.makeName) + '</p>';
    html += '    <h3 class="catalog-card__name">' + escapeHtml(model.name) + '</h3>';
    html += specHtml;
    html += '    <div class="catalog-card__actions">';
    if (listingCount > 0) {
      html += '      <div class="catalog-card__market">';
      html += '        <a href="' + marketUrl + '" class="btn btn--primary btn--sm catalog-card__market-btn">' + _t('catalog.market_view_available') + '</a>';
      html += '      </div>';
    }
    html += '      <div class="catalog-card__action-grid">';
    html += '        <a href="' + detailUrl + '" class="btn btn--secondary catalog-card__detail-btn">' + _t('catalog.view_detail') + '</a>';
    if (typeof Wishlist !== 'undefined') {
      html += '        <div class="catalog-card__wishlist">';
      html += Wishlist.renderWishlistBtnHTML({
        itemType: 'catalog',
        itemId: wishlistItemId,
        brand: model.makeName,
        title: model.makeName + ' ' + model.name,
        image: primary,
        price: 0,
        sourceUrl: detailUrl
      });
      html += '        </div>';
    }
    if (typeof CompareService !== 'undefined') {
      html += '        <div class="catalog-card__compare">';
      html += CompareService.renderCompareBtnHTML({
        make: model.makeName,
        model: model.name,
        year: selectedYear || '',
        id: cardId,
        source: 'catalog'
      });
      html += '        </div>';
    }
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</article>';
    return html;
  }

  /* --- Pagination --- */
  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      hidePagination();
      return;
    }

    var html = '';
    html += '<button type="button" class="catalog-pagination__btn" data-page="prev"' + (currentPage === 1 ? ' disabled' : '') + '>' + _t('catalog.pagination_prev') + '</button>';

    var pages = computePageWindow(currentPage, totalPages);
    pages.forEach(function (p) {
      if (p === '...') {
        html += '<span class="catalog-pagination__ellipsis">…</span>';
      } else {
        html += '<button type="button" class="catalog-pagination__btn catalog-pagination__num' + (p === currentPage ? ' is-active' : '') + '" data-page="' + p + '">' + p + '</button>';
      }
    });

    html += '<button type="button" class="catalog-pagination__btn" data-page="next"' + (currentPage === totalPages ? ' disabled' : '') + '>' + _t('catalog.pagination_next') + '</button>';

    paginationContainer.innerHTML = html;
    paginationContainer.style.display = '';
  }

  function computePageWindow(current, total) {
    var pages = [];
    var delta = 1;
    var range = [];
    for (var i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    pages.push(1);
    if (range[0] > 2) pages.push('...');
    range.forEach(function (r) { pages.push(r); });
    if (range[range.length - 1] < total - 1) pages.push('...');
    if (total > 1) pages.push(total);
    return pages;
  }

  function onPaginationClick(e) {
    var btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    var value = btn.getAttribute('data-page');
    var totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));

    if (value === 'prev') {
      currentPage = Math.max(1, currentPage - 1);
    } else if (value === 'next') {
      currentPage = Math.min(totalPages, currentPage + 1);
    } else {
      currentPage = parseInt(value, 10) || 1;
    }

    renderResults();
    if (selectMake.value) {
      syncCatalogUrl('replace');
    }
    scrollToResultsTop();
  }

  function scrollToResultsTop() {
    var toolbar = document.querySelector('.catalog-toolbar');
    if (toolbar && typeof toolbar.scrollIntoView === 'function') {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      toolbar.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function hidePagination() {
    paginationContainer.style.display = 'none';
    paginationContainer.innerHTML = '';
  }

  /* --- Quick View --- */
  function onResultsClick(e) {
    var trigger = e.target.closest('[data-quickview]');
    if (!trigger) return;
    e.preventDefault();
    var make = trigger.getAttribute('data-make');
    var model = trigger.getAttribute('data-model');
    openQuickView(make, model);
  }

  function openQuickView(make, model) {
    if (!quickviewEl || !quickviewBody) return;

    lastFocusedEl = document.activeElement;

    var localCar = getLocalCar(make, model);
    var resolved = resolveCarImage(make, model);
    var imgSrc = resolved.primary || getPlaceholderImageSafe();
    var fallbacks = resolved.fallbacks || [];

    quickviewBody.innerHTML = buildQuickViewSkeleton(make, model, imgSrc, fallbacks);
    quickviewEl.classList.add('is-open');
    quickviewEl.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    var closeBtn = quickviewEl.querySelector('.catalog-quickview__close');
    if (closeBtn) closeBtn.focus();

    loadEnrichment(make, model).then(function (data) {
      if (!quickviewEl.classList.contains('is-open')) return;
      renderQuickViewContent(make, model, data, imgSrc, fallbacks);
    });
  }

  function buildQuickViewSkeleton(make, model, imgSrc, fallbacks) {
    var detailUrl = buildDetailUrl(make, model);
    var html = '';
    html += '<div class="catalog-quickview__media">';
    html += '  <img class="catalog-quickview__img" alt="' + escapeAttr(make + ' ' + model) + '" src="' + escapeAttr(imgSrc) + '" data-fallbacks="' + escapeAttr(JSON.stringify(fallbacks)) + '">';
    html += '</div>';
    html += '<div class="catalog-quickview__content">';
    html += '  <p class="catalog-quickview__make">' + escapeHtml(make) + '</p>';
    html += '  <h2 class="catalog-quickview__title" id="quickviewTitle">' + escapeHtml(model) + '</h2>';
    html += '  <div class="catalog-quickview__loading"><span class="spinner spinner--sm"></span> ' + _t('catalog.quickview_loading') + '</div>';
    html += '  <a href="' + detailUrl + '" class="btn btn--primary btn--sm" style="margin-top:var(--space-md);">' + _t('catalog.view_detail') + '</a>';
    html += '</div>';
    return html;
  }

  function renderQuickViewContent(make, model, data, imgSrc, fallbacks) {
    var localCar = data && data.local;

    var detailUrl = buildDetailUrl(make, model);
    var marketUrl = './marketplace.html?brand=' + encodeURIComponent(make) + '&model=' + encodeURIComponent(model);
    var listingCount = getAvailableListingCount(make, model);

    var power = localCar && localCar.horsepower
      ? (String(localCar.horsepower).indexOf('HP') !== -1 ? localCar.horsepower : localCar.horsepower + ' HP')
      : '';
    var topSpeed = (localCar && localCar.topSpeed) || '';
    var accel = (localCar && localCar.zeroToHundred) || '';
    var engine = (localCar && localCar.engine) || '';
    var drivetrain = (localCar && localCar.drivetrain) || '';
    var year = (localCar && localCar.year) || selectedYear || '';

    var torque = (localCar && localCar.torque) || '';
    var weight = (localCar && localCar.weight) || '';
    var transmission = (localCar && localCar.transmission) || '';
    var seats = (localCar && localCar.seats) ? localCar.seats + ' seats' : '';
    var doors = (localCar && localCar.doors) ? localCar.doors + ' doors' : '';
    var dimensions = (localCar && localCar.dimensions) || '';
    var fuelType = (localCar && localCar.fuelType) || '';
    var bodyType = (localCar && localCar.bodyType) || '';
    var price = (localCar && localCar.priceUSD) ? '$' + String(localCar.priceUSD).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
    var brakes = (localCar && localCar.brakes) || '';

    var specs = [
      { label: _t('detail.spec_power') || 'Công suất', value: power },
      { label: _t('detail.spec_topspeed') || 'Vận tốc tối đa', value: topSpeed },
      { label: _t('detail.spec_accel') || 'Tăng tốc 0-100', value: accel },
      { label: _t('detail.spec_engine') || 'Động cơ', value: engine },
      { label: _t('detail.spec_drivetrain') || 'Dẫn động', value: drivetrain },
      { label: _t('detail.spec_year') || 'Năm', value: year },
      { label: 'Mô-men xoắn', value: torque },
      { label: 'Trọng lượng', value: weight },
      { label: 'Hộp số', value: transmission },
      { label: 'Chỗ ngồi', value: seats },
      { label: 'Cửa', value: doors },
      { label: 'Kích thước', value: dimensions },
      { label: 'Nhiên liệu', value: fuelType },
      { label: 'Kiểu dáng', value: bodyType },
      { label: 'Giá (USD)', value: price },
      { label: 'Phanh', value: brakes }
    ];

    var description = (localCar && localCar.longDescription) || _t('catalog.quickview_wiki_empty');

    var finalResolved = resolveCarImage(make, model);
    var finalImg = finalResolved.primary || imgSrc || getPlaceholderImageSafe();
    var finalFallbacks = finalResolved.fallbacks || fallbacks;

    var html = '';
    html += '<div class="catalog-quickview__media">';
    html += '  <img class="catalog-quickview__img" alt="' + escapeAttr(make + ' ' + model) + '" src="' + escapeAttr(finalImg) + '" data-fallbacks="' + escapeAttr(JSON.stringify(finalFallbacks)) + '">';
    html += '</div>';
    html += '<div class="catalog-quickview__content">';
    html += '  <p class="catalog-quickview__make">' + escapeHtml(make) + '</p>';
    html += '  <h2 class="catalog-quickview__title" id="quickviewTitle">' + escapeHtml(model) + '</h2>';

    html += '  <h3 class="catalog-quickview__subhead">' + _t('catalog.quickview_specs') + '</h3>';
    html += '  <div class="catalog-quickview__specs">';
    specs.forEach(function (s) {
      var val = s.value || _t('common.na');
      html += '<div class="catalog-quickview__spec"><span class="catalog-quickview__spec-label">' + escapeHtml(s.label) + '</span><span class="catalog-quickview__spec-value">' + escapeHtml(String(val)) + '</span></div>';
    });
    html += '  </div>';

    html += '  <h3 class="catalog-quickview__subhead">' + _t('catalog.quickview_desc') + '</h3>';
    html += '  <p class="catalog-quickview__desc">' + escapeHtml(description) + '</p>';

    html += '  <div class="catalog-quickview__actions">';
    html += '    <a href="' + detailUrl + '" class="btn btn--primary btn--sm">' + _t('catalog.view_detail') + '</a>';
    if (listingCount > 0) {
      html += '    <a href="' + marketUrl + '" class="btn btn--secondary btn--sm">' + _t('catalog.market_view_available') + '</a>';
    }
    html += '  </div>';
    html += '</div>';

    quickviewBody.innerHTML = html;
  }

  function loadEnrichment(make, model) {
    var localCar = getLocalCar(make, model);
    return Promise.resolve({ local: localCar });
  }

  function hydrateCardSpecs(pageItems) {
    if (!pageItems || !pageItems.length) return;
    pageItems.forEach(function (model) {
      var localCar = getLocalCar(model.makeName, model.name);
      if (!localCar) return;
      var cardKey = (model.makeName + '-' + model.name).toLowerCase().replace(/\s+/g, '-');
      var card = resultsContainer.querySelector('[data-card-key="' + escapeAttr(cardKey) + '"]');
      if (!card) return;
      var specHtml = buildCardSpecHtml(localCar);
      if (!specHtml) return;
      var specsEl = card.querySelector('.catalog-card__specs');
      if (!specsEl) {
        specsEl = document.createElement('div');
        specsEl.className = 'catalog-card__specs';
        var nameEl = card.querySelector('.catalog-card__name');
        if (nameEl && nameEl.parentNode) {
          nameEl.parentNode.insertBefore(specsEl, nameEl.nextSibling);
        }
      }
      specsEl.outerHTML = specHtml;
    });
  }

  function closeQuickView() {
    if (!quickviewEl) return;
    quickviewEl.classList.remove('is-open');
    quickviewEl.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function buildDetailUrl(make, model) {
    var url = './car-detail.html?make=' + encodeURIComponent(make) + '&model=' + encodeURIComponent(model);
    if (selectedYear) {
      url += '&year=' + encodeURIComponent(selectedYear);
    }
    if (selectMake.value) {
      url += '&return=' + encodeURIComponent(buildCatalogUrl());
    }
    return url;
  }

  function buildCatalogUrl() {
    var makeName = selectMake.value;
    if (!makeName) {
      return window.location.pathname;
    }
    var params = new URLSearchParams();
    params.set('make', makeName);
    if (selectedYear) {
      params.set('year', selectedYear);
    }
    var keyword = inputSearch.value.trim();
    if (keyword) {
      params.set('q', keyword);
    }
    if (sortMode && sortMode !== 'az') {
      params.set('sort', sortMode);
    }
    if (currentPage > 1) {
      params.set('page', String(currentPage));
    }
    if (viewMode === 'list') {
      params.set('view', 'list');
    }
    var qs = params.toString();
    return window.location.pathname + (qs ? '?' + qs : '');
  }

  function syncCatalogUrl(mode) {
    if (!window.history || typeof window.history.replaceState !== 'function') {
      return;
    }

    var makeName = selectMake.value;
    if (!makeName || mode === 'brands') {
      var brandsUrl = window.location.pathname;
      if (window.location.search) {
        window.history.replaceState(null, '', brandsUrl);
      }
      isCatalogListVisible = false;
      return;
    }

    var nextUrl = buildCatalogUrl();
    var currentUrl = window.location.pathname + window.location.search;
    if (nextUrl === currentUrl) {
      isCatalogListVisible = true;
      return;
    }

    if (mode === 'push' || !isCatalogListVisible) {
      window.history.pushState(null, '', nextUrl);
    } else {
      window.history.replaceState(null, '', nextUrl);
    }
    isCatalogListVisible = true;
  }

  function pickSpec(primary, secondary, formatter) {
    if (primary !== undefined && primary !== null && primary !== '') {
      return formatter(primary);
    }
    if (secondary !== undefined && secondary !== null && secondary !== '') {
      return formatter(secondary);
    }
    return '';
  }

  function buildCardSpecHtml(specs) {
    if (!specs) return '';
    var bits = [];
    if (specs.horsepower) {
      var hpVal = String(specs.horsepower).indexOf('HP') !== -1
        ? specs.horsepower
        : specs.horsepower + ' HP';
      bits.push('<span class="catalog-card__spec">' + escapeHtml(String(hpVal)) + '</span>');
    }
    if (specs.topSpeed) {
      bits.push('<span class="catalog-card__spec">' + escapeHtml(String(specs.topSpeed)) + '</span>');
    }
    if (specs.zeroToHundred) {
      bits.push('<span class="catalog-card__spec">' + escapeHtml(String(specs.zeroToHundred)) + '</span>');
    }
    if (specs.engine && bits.length < 6) {
      bits.push('<span class="catalog-card__spec">' + escapeHtml(specs.engine) + '</span>');
    }
    if (specs.torque && bits.length < 6) {
      bits.push('<span class="catalog-card__spec">' + escapeHtml(specs.torque) + '</span>');
    }
    if (specs.bodyType && bits.length < 6) {
      bits.push('<span class="catalog-card__spec">' + escapeHtml(specs.bodyType) + '</span>');
    }
    if (specs.priceUSD && bits.length < 6) {
      bits.push('<span class="catalog-card__spec">$' + escapeHtml(String(specs.priceUSD).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + '</span>');
    }
    if (!bits.length) return '';
    return '<div class="catalog-card__specs">' + bits.join('') + '</div>';
  }

  /* --- Skeleton --- */
  function showSkeleton() {
    hideState();
    resultsContainer.style.display = 'none';
    hidePagination();
    resultsCount.parentElement.style.display = 'none';
    btnRetry.style.display = 'none';

    var html = '';
    for (var i = 0; i < pageSize; i++) {
      html += '<div class="catalog-skeleton-card">';
      html += '  <div class="catalog-skeleton-card__media skeleton-shimmer"></div>';
      html += '  <div class="catalog-skeleton-card__body">';
      html += '    <div class="catalog-skeleton-card__line skeleton-shimmer" style="width:40%;"></div>';
      html += '    <div class="catalog-skeleton-card__line skeleton-shimmer" style="width:75%;"></div>';
      html += '    <div class="catalog-skeleton-card__line skeleton-shimmer" style="width:55%;"></div>';
      html += '  </div>';
      html += '</div>';
    }
    skeletonContainer.innerHTML = html;
    skeletonContainer.classList.toggle('is-list', viewMode === 'list');
    skeletonContainer.style.display = '';
  }

  function hideSkeleton() {
    skeletonContainer.style.display = 'none';
    skeletonContainer.innerHTML = '';
  }

  /* --- State UI --- */
  function showState(type, message) {
    if (!selectMake.value) return;
    showCatalogView();
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    resultsCount.parentElement.style.display = 'none';
    hideSkeleton();
    hidePagination();

    var html = '';

    if (type === 'loading') {
      html += '<div class="spinner"></div>';
      html += '<p class="catalog-state__title">' + _t('catalog.state_loading_title') + '</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = 'none';
    } else if (type === 'error') {
      html += '<div class="catalog-state__icon">⚠️</div>';
      html += '<p class="catalog-state__title">' + _t('catalog.state_error_title') + '</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = '';
    } else if (type === 'empty') {
      html += '<div class="catalog-state__icon">🔍</div>';
      html += '<p class="catalog-state__title">' + _t('catalog.state_empty_title') + '</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = 'none';
    } else if (type === 'guide') {
      html += '<div class="catalog-state__icon">🏎️</div>';
      html += '<p class="catalog-state__title">' + _t('catalog.state_guide_title') + '</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = 'none';
    }

    stateContainer.innerHTML = html;
    stateContainer.style.display = 'flex';
  }

  function hideState() {
    stateContainer.style.display = 'none';
    stateContainer.innerHTML = '';
  }

  /* --- Image helpers --- */
  function onImageError(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.hasAttribute('data-fallbacks')) return;
    var list = [];
    try { list = JSON.parse(img.getAttribute('data-fallbacks') || '[]'); } catch (_e) { list = []; }
    var next = list.shift();
    img.setAttribute('data-fallbacks', JSON.stringify(list));
    if (next) {
      img.src = next;
    } else {
      img.removeAttribute('data-fallbacks');
    }
  }

  function buildImageFallbacks(model) {
    return resolveCarImage(model.makeName, model.name);
  }

  function resolveCarImage(make, model) {
    if (typeof CarImagePaths !== 'undefined' && CarImagePaths && typeof CarImagePaths.resolveImage === 'function') {
      return CarImagePaths.resolveImage(make, model, { placeholder: getPlaceholderImageSafe() });
    }

    var placeholder = getPlaceholderImageSafe();
    return { primary: placeholder, fallbacks: [], candidates: [placeholder] };
  }

  function getLocalCar(make, model) {
    if (typeof getCarByMakeModel !== 'function') return null;
    try {
      return getCarByMakeModel(make, model);
    } catch (e) {
      return null;
    }
  }

  function getPlaceholderImageSafe() {
    if (typeof getPlaceholderImage === 'function') return getPlaceholderImage();
    if (typeof PLACEHOLDER_IMAGE !== 'undefined') return PLACEHOLDER_IMAGE;
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=60';
  }

  /* --- Animations (progressive enhancement) --- */
  function revealPageChrome() {
    var hero = document.querySelector('.catalog-hero');
    var toolbar = document.querySelector('.catalog-toolbar');
    var targets = [];
    if (hero) targets.push(hero);
    if (toolbar) targets.push(toolbar);
    if (!targets.length) return;

    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function markRevealed() {
      for (var i = 0; i < targets.length; i++) {
        targets[i].classList.add('is-revealed');
      }
    }

    if (prefersReduced || !window.gsap) {
      markRevealed();
      return;
    }

    window.gsap.fromTo(targets,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0.06,
        onComplete: markRevealed
      }
    );
  }

  function revealCards() {
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cards = resultsContainer.querySelectorAll('[data-reveal]');

    if (prefersReduced || !window.gsap) {
      for (var i = 0; i < cards.length; i++) {
        cards[i].style.opacity = '1';
        cards[i].style.transform = 'none';
      }
      return;
    }

    window.gsap.fromTo(cards,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05, clearProps: 'transform' }
    );
  }

  /* --- Availability (marketplace cross-reference) --- */
  function buildAvailableListingCountMap() {
    var posts = Storage.get('autoluxe_market_posts', []);
    var list = Array.isArray(posts) ? posts : [];
    var map = {};

    for (var i = 0; i < list.length; i++) {
      var post = list[i];
      if (!isApprovedAndAvailable(post)) continue;

      var key = buildPairKey(post.brand, post.model);
      if (!key) continue;
      map[key] = (map[key] || 0) + 1;
    }

    return map;
  }

  function getAvailableListingCount(makeName, modelName) {
    if (!availabilityMap) return 0;
    var key = buildPairKey(makeName, modelName);
    if (!key) return 0;
    return availabilityMap[key] || 0;
  }

  function isApprovedAndAvailable(post) {
    if (!post || typeof post !== 'object') return false;

    var moderation = normalizeModeration(post.moderation);
    if (moderation !== 'approved') return false;

    var availabilitySource = post.availability;
    if (availabilitySource === undefined || availabilitySource === null || availabilitySource === '') {
      availabilitySource = post.status;
    }
    var availability = normalizeAvailability(availabilitySource);
    return availability === 'available';
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

  function buildPairKey(makeName, modelName) {
    var makeToken = normalizeToken(makeName);
    var modelToken = normalizeToken(modelName);
    if (!makeToken || !modelToken) return '';
    return makeToken + '||' + modelToken;
  }

  function normalizeToken(value) {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function parseCatalogQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      var page = parseInt(params.get('page') || '1', 10);
      return {
        make: String(params.get('make') || '').trim(),
        year: String(params.get('year') || '').trim(),
        q: String(params.get('q') || '').trim(),
        sort: String(params.get('sort') || '').trim(),
        page: page > 0 ? page : 1,
        view: String(params.get('view') || '').trim()
      };
    } catch (e) {
      return { make: '', year: '', q: '', sort: '', page: 1, view: '' };
    }
  }

  function findMatchingMakeValue(makeName, makes) {
    if (!makeName || !Array.isArray(makes)) return '';
    var normalizedTarget = normalizeToken(makeName);
    for (var i = 0; i < makes.length; i++) {
      var value = makes[i] && makes[i].name ? makes[i].name : '';
      if (normalizeToken(value) === normalizedTarget) {
        return value;
      }
    }
    return '';
  }

  /* --- Utility --- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str === undefined || str === null ? '' : String(str)));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }
})();
