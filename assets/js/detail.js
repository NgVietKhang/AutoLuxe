/* =============================================
   DETAIL.JS - AutoLuxe Supercar Web
   Car detail page logic: parse params, render
   ============================================= */

(function () {
  'use strict';

  var contentEl = document.getElementById('detailContent');
  if (!contentEl) return;

  /* --- Parse query params --- */
  var params = new URLSearchParams(window.location.search);
  var carId = params.get('id');
  var carMake = params.get('make');
  var carModel = params.get('model');

  /* --- Find car --- */
  var car = null;
  if (carId) {
    car = getCarById(carId);
  }
  if (!car && (carMake || carModel)) {
    car = getCarByMakeModel(carMake, carModel);
  }

  /* --- Render --- */
  if (car) {
    renderDetail(car);
    document.title = car.make + ' ' + car.model + ' - AutoLuxe';
  } else {
    renderNotFound();
  }

  /* === Render detail page === */
  function renderDetail(car) {
    var heroSrc = car.heroImage || getPlaceholderImage();
    var specs = buildSpecs(car);
    var gallery = car.gallery && car.gallery.length > 0 ? car.gallery : [heroSrc];
    var related = getRelatedCars(car, 4);

    var html = '';

    /* Breadcrumb */
    html += '<nav class="detail-breadcrumb" aria-label="Breadcrumb">';
    html += '<a href="./catalog.html">Catalog</a> &rarr; ';
    html += '<span>' + esc(car.make) + ' ' + esc(car.model) + '</span>';
    html += '</nav>';

    /* Header */
    html += '<div class="detail-header">';
    html += '<h1 class="detail-header__title">' + esc(car.make) + ' ' + esc(car.model) + '</h1>';
    html += '<p class="detail-header__meta"><span>' + esc(car.make) + '</span> &bull; ' + (car.year || 'N/A') + '</p>';
    html += '</div>';

    /* Divider */
    html += '<div class="divider"></div>';

    /* Hero Image */
    html += '<div class="detail-hero">';
    html += '<img class="detail-hero__img" id="heroImg" src="' + esc(heroSrc) + '" alt="' + esc(car.make + ' ' + car.model) + '" onerror="this.src=\'' + getPlaceholderImage() + '\'">';
    html += '</div>';

    /* Gallery Thumbnails */
    if (gallery.length > 1) {
      html += '<div class="detail-gallery" id="galleryContainer">';
      gallery.forEach(function (img, index) {
        var activeClass = index === 0 ? ' is-active' : '';
        html += '<img class="detail-gallery__thumb' + activeClass + '" src="' + esc(img) + '" alt="' + esc(car.model + ' ảnh ' + (index + 1)) + '" data-index="' + index + '" onerror="this.src=\'' + getPlaceholderImage() + '\'">';
      });
      html += '</div>';
    }

    /* Specs Grid */
    html += '<div class="detail-specs">';
    html += '<h2 class="detail-specs__title">Thông Số Kỹ Thuật</h2>';
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
    html += '<h2 class="detail-description__title">Mô Tả</h2>';
    if (car.shortDescription) {
      html += '<p class="detail-description__short">' + esc(car.shortDescription) + '</p>';
    }
    if (car.longDescription) {
      html += '<p class="detail-description__long">' + esc(car.longDescription) + '</p>';
    }
    if (!car.shortDescription && !car.longDescription) {
      html += '<p class="detail-description__long">Thông tin mô tả đang được cập nhật.</p>';
    }
    html += '</div>';

    /* Actions */
    html += '<div class="detail-actions">';
    html += '<a href="./catalog.html" class="btn btn--secondary">&#8592; Quay lại Catalog</a>';
    html += '<a href="./marketplace.html" class="btn btn--primary">Xem Marketplace</a>';
    if (typeof Wishlist !== 'undefined') {
      html += Wishlist.renderWishlistBtnHTML({
        itemType: 'catalog',
        itemId: car.id,
        brand: car.make,
        title: car.make + ' ' + car.model,
        image: car.heroImage || '',
        price: 0,
        sourceUrl: './car-detail.html?id=' + encodeURIComponent(car.id)
      });
    }
    html += '</div>';

    /* Related Cars */
    if (related.length > 0) {
      html += '<div class="detail-related">';
      html += '<h2 class="detail-related__title">Xe Liên Quan</h2>';
      html += '<div class="divider"></div>';
      html += '<div class="detail-related__grid" style="margin-top:var(--space-lg);">';
      related.forEach(function (r) {
        var rImg = r.heroImage || getPlaceholderImage();
        html += '<a href="./car-detail.html?id=' + esc(r.id) + '" class="detail-related__card">';
        html += '<img class="detail-related__card-img" src="' + esc(rImg) + '" alt="' + esc(r.make + ' ' + r.model) + '" onerror="this.src=\'' + getPlaceholderImage() + '\'">';
        html += '<div class="detail-related__card-body">';
        html += '<p class="detail-related__card-title">' + esc(r.make) + ' ' + esc(r.model) + '</p>';
        html += '<p class="detail-related__card-meta">' + esc(r.engine || 'N/A') + ' &bull; ' + (r.horsepower || '?') + ' HP</p>';
        html += '</div>';
        html += '</a>';
      });
      html += '</div>';
      html += '</div>';
    }

    contentEl.innerHTML = html;

    /* Bind gallery click */
    bindGallery(gallery);

    /* Bind wishlist buttons */
    if (typeof Wishlist !== 'undefined') {
      Wishlist.bindDelegatedWishlistButtons(contentEl);
    }
  }

  /* === Render not found === */
  function renderNotFound() {
    var html = '';
    html += '<div class="detail-notfound">';
    html += '<div class="detail-notfound__icon">🔍</div>';
    html += '<h1 class="detail-notfound__title">Không tìm thấy xe</h1>';
    html += '<p class="detail-notfound__desc">Xe bạn đang tìm không tồn tại trong hệ thống hoặc đường dẫn không hợp lệ.</p>';
    html += '<a href="./catalog.html" class="btn btn--primary">Quay lại Catalog</a>';
    html += '</div>';
    contentEl.innerHTML = html;
  }

  /* === Gallery interaction === */
  function bindGallery(gallery) {
    var container = document.getElementById('galleryContainer');
    var heroImg = document.getElementById('heroImg');
    if (!container || !heroImg) return;

    container.addEventListener('click', function (e) {
      var thumb = e.target.closest('.detail-gallery__thumb');
      if (!thumb) return;

      var index = parseInt(thumb.getAttribute('data-index'), 10);
      if (isNaN(index) || !gallery[index]) return;

      heroImg.src = gallery[index];

      var allThumbs = container.querySelectorAll('.detail-gallery__thumb');
      allThumbs.forEach(function (t) { t.classList.remove('is-active'); });
      thumb.classList.add('is-active');
    });
  }

  /* === Build specs array === */
  function buildSpecs(car) {
    var fallback = 'Đang cập nhật';
    return [
      { label: 'Công suất', value: car.horsepower ? car.horsepower + ' HP' : fallback },
      { label: 'Tốc độ tối đa', value: car.topSpeed || fallback },
      { label: '0-100 km/h', value: car.zeroToHundred || fallback },
      { label: 'Động cơ', value: car.engine || fallback },
      { label: 'Hệ dẫn động', value: car.drivetrain || fallback },
      { label: 'Năm sản xuất', value: car.year ? String(car.year) : fallback }
    ];
  }

  /* === Escape HTML === */
  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

})();
