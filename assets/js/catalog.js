/* =============================================
   CATALOG.JS - AutoLuxe Supercar Web
   Catalog page logic: fetch, filter, render
   ============================================= */

(function () {
  'use strict';

  /* --- DOM References --- */
  var selectMake = document.getElementById('filterMake');
  var inputSearch = document.getElementById('searchModel');
  var btnRetry = document.getElementById('btnRetry');
  var resultsContainer = document.getElementById('catalogResults');
  var resultsCount = document.getElementById('resultsCount');
  var stateContainer = document.getElementById('catalogState');

  /* --- State --- */
  var allMakes = [];
  var currentModels = [];
  var filteredModels = [];

  /* --- Init --- */
  init();

  function init() {
    loadMakes();
    bindEvents();
    if (typeof Wishlist !== 'undefined') {
      Wishlist.bindDelegatedWishlistButtons(resultsContainer);
    }
  }

  /* --- Event Binding --- */
  function bindEvents() {
    selectMake.addEventListener('change', onMakeChange);
    inputSearch.addEventListener('input', onSearchInput);
    btnRetry.addEventListener('click', onRetry);
  }

  /* --- Load Makes into Select --- */
  async function loadMakes() {
    showState('loading', 'Đang tải danh sách hãng xe...');

    try {
      allMakes = await fetchAllMakes();

      /* Filter for supercar-related makes to keep the list manageable */
      var supercarMakes = [
        'FERRARI', 'LAMBORGHINI', 'MCLAREN', 'PORSCHE', 'BUGATTI',
        'ASTON MARTIN', 'BENTLEY', 'ROLLS-ROYCE', 'MASERATI',
        'LOTUS', 'PAGANI', 'KOENIGSEGG', 'MERCEDES-BENZ', 'BMW',
        'AUDI', 'JAGUAR', 'ALFA ROMEO', 'FORD', 'CHEVROLET',
        'DODGE', 'NISSAN', 'TOYOTA', 'HONDA', 'MAZDA', 'SUBARU',
        'LEXUS', 'ACURA', 'INFINITI', 'GENESIS', 'VOLVO',
        'LAND ROVER', 'TESLA', 'RIVIAN', 'LUCID'
      ];

      var filteredMakes = allMakes.filter(function (make) {
        return supercarMakes.indexOf(make.name.toUpperCase()) !== -1;
      });

      /* Sort alphabetically */
      filteredMakes.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });

      /* Populate select */
      selectMake.innerHTML = '<option value="">-- Chọn hãng xe --</option>';
      filteredMakes.forEach(function (make) {
        var option = document.createElement('option');
        option.value = make.name;
        option.textContent = make.name;
        selectMake.appendChild(option);
      });

      showState('guide', 'Hãy chọn một hãng xe để xem danh sách model.');
    } catch (err) {
      showState('error', err.message);
    }
  }

  /* --- Event Handlers --- */
  async function onMakeChange() {
    var makeName = selectMake.value;
    inputSearch.value = '';

    if (!makeName) {
      currentModels = [];
      filteredModels = [];
      showState('guide', 'Hãy chọn một hãng xe để xem danh sách model.');
      return;
    }

    showState('loading', 'Đang tải model của ' + makeName + '...');

    try {
      currentModels = await fetchModelsByMake(makeName);
      filteredModels = currentModels.slice();
      renderResults();
    } catch (err) {
      showState('error', err.message);
    }
  }

  function onSearchInput() {
    var keyword = inputSearch.value.trim().toLowerCase();

    if (!keyword) {
      filteredModels = currentModels.slice();
    } else {
      filteredModels = currentModels.filter(function (model) {
        return model.name.toLowerCase().indexOf(keyword) !== -1;
      });
    }

    renderResults();
  }

  function onRetry() {
    if (!selectMake.value) {
      loadMakes();
    } else {
      onMakeChange();
    }
  }

  /* --- Render --- */
  function renderResults() {
    if (filteredModels.length === 0) {
      if (currentModels.length === 0 && selectMake.value) {
        showState('empty', 'Không tìm thấy model nào cho hãng này.');
      } else if (inputSearch.value.trim()) {
        showState('empty', 'Không có model nào phù hợp với từ khóa "' + inputSearch.value.trim() + '".');
      } else {
        showState('empty', 'Không có dữ liệu.');
      }
      return;
    }

    hideState();
    resultsCount.innerHTML = 'Tìm thấy <strong>' + filteredModels.length + '</strong> model';
    resultsCount.parentElement.style.display = '';

    var html = '';
    filteredModels.forEach(function (model) {
      var detailUrl = './car-detail.html?make=' + encodeURIComponent(model.makeName) + '&model=' + encodeURIComponent(model.name);
      var cardId = (model.makeName + '-' + model.name).toLowerCase().replace(/\s+/g, '-');
      html += '<div class="catalog-card">';
      html += '  <a href="' + detailUrl + '" class="catalog-card--link" style="display:block;text-decoration:none;">';
      html += '    <p class="catalog-card__make">' + escapeHtml(model.makeName) + '</p>';
      html += '    <h3 class="catalog-card__name">' + escapeHtml(model.name) + '</h3>';
      html += '    <span class="catalog-card__cta">Xem chi tiết &rarr;</span>';
      html += '  </a>';
      if (typeof Wishlist !== 'undefined') {
        html += '  <div style="margin-top:var(--space-sm);">';
        html += Wishlist.renderWishlistBtnHTML({
          itemType: 'catalog',
          itemId: cardId,
          brand: model.makeName,
          title: model.makeName + ' ' + model.name,
          image: '',
          price: 0,
          sourceUrl: detailUrl
        });
        html += '  </div>';
      }
      html += '</div>';
    });

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = '';
  }

  /* --- State UI --- */
  function showState(type, message) {
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    resultsCount.parentElement.style.display = 'none';

    var html = '';

    if (type === 'loading') {
      html += '<div class="spinner"></div>';
      html += '<p class="catalog-state__title">Đang tải...</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = 'none';
    } else if (type === 'error') {
      html += '<div class="catalog-state__icon">⚠️</div>';
      html += '<p class="catalog-state__title">Đã xảy ra lỗi</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = '';
    } else if (type === 'empty') {
      html += '<div class="catalog-state__icon">🔍</div>';
      html += '<p class="catalog-state__title">Không có kết quả</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = 'none';
    } else if (type === 'guide') {
      html += '<div class="catalog-state__icon">🏎️</div>';
      html += '<p class="catalog-state__title">Chào mừng đến Catalog</p>';
      html += '<p class="catalog-state__desc">' + escapeHtml(message) + '</p>';
      btnRetry.style.display = 'none';
    }

    stateContainer.innerHTML = html;
    stateContainer.style.display = '';
  }

  function hideState() {
    stateContainer.style.display = 'none';
    stateContainer.innerHTML = '';
  }

  /* --- Utility --- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
