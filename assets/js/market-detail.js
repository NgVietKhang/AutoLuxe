/* =============================================
   MARKET-DETAIL.JS - AutoLuxe Supercar Web
   Post detail view + showroom reviews (Phase 7)
   ============================================= */

var MarketDetail = (function () {
  'use strict';

  var KEYS = {
    reviews: 'autoluxe_reviews'
  };

  var MAX_REVIEW_LENGTH = 500;
  var currentPostId = null;
  var currentPost = null;
  var currentSort = 'newest';
  var selectedRating = 0;

  /* ===========================
     HELPERS
     =========================== */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function formatPrice(price) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatCurrency === 'function') {
      return I18n.formatCurrency(price || 0);
    }
    if (!price && price !== 0) return '$0';
    return '$' + Number(price).toLocaleString('en-US');
  }

  function formatNumber(num) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatNumber === 'function') {
      return I18n.formatNumber(num || 0, { maximumFractionDigits: 0 });
    }
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('en-US');
  }

  function translateFuel(val) {
    if (!val) return '';
    var map = { 'Xăng': 'data.fuel_gasoline', 'Dầu': 'data.fuel_diesel', 'Hybrid': 'data.fuel_hybrid', 'Điện': 'data.fuel_electric' };
    return map[val] ? _t(map[val]) : val;
  }

  function translateTransmission(val) {
    if (!val) return '';
    var map = { 'Tự động': 'data.trans_auto', 'Số sàn': 'data.trans_manual', 'PDK': 'data.trans_pdk', 'DCT': 'data.trans_dct' };
    return map[val] ? _t(map[val]) : val;
  }

  function formatDate(isoStr) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatDateTime === 'function') {
      return I18n.formatDateTime(isoStr, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      var day = ('0' + d.getDate()).slice(-2);
      var month = ('0' + (d.getMonth() + 1)).slice(-2);
      var hours = ('0' + d.getHours()).slice(-2);
      var mins = ('0' + d.getMinutes()).slice(-2);
      return day + '/' + month + '/' + d.getFullYear() + ' ' + hours + ':' + mins;
    } catch (e) {
      return '';
    }
  }

  function generateReviewId() {
    return 'rev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function parseQueryId() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('id') || null;
    } catch (e) {
      return null;
    }
  }

  function renderStars(rating, maxStars) {
    maxStars = maxStars || 5;
    var filled = Math.round(rating);
    var html = '';
    for (var i = 1; i <= maxStars; i++) {
      html += i <= filled ? '★' : '☆';
    }
    return html;
  }

  /* ===========================
     REVIEW DATA ACCESS
     =========================== */

  function getAllReviews() {
    try {
      var reviews = Storage.get(KEYS.reviews, []);
      return Array.isArray(reviews) ? reviews : [];
    } catch (e) {
      return [];
    }
  }

  function getReviewsByPostId(postId) {
    return getAllReviews().filter(function (r) {
      return r.postId === postId;
    });
  }

  function saveReview(review) {
    try {
      var reviews = getAllReviews();
      reviews.push(review);
      return Storage.set(KEYS.reviews, reviews);
    } catch (e) {
      return false;
    }
  }

  /* ===========================
     PERMISSION CHECK
     =========================== */

  function getPermissionStatus() {
    var session = null;
    try {
      session = Auth.getSession();
    } catch (e) {
      session = null;
    }

    if (!session) {
      return { allowed: false, reason: 'not_logged_in' };
    }

    if (!currentPost) {
      return { allowed: false, reason: 'no_post' };
    }

    if (session.email && currentPost.ownerEmail && session.email === currentPost.ownerEmail) {
      return { allowed: false, reason: 'is_owner' };
    }

    return { allowed: true, session: session };
  }

  /* ===========================
     RENDER: NOT FOUND
     =========================== */

  function renderNotFound() {
    var content = document.getElementById('mdContent');
    if (!content) return;
    content.innerHTML =
      '<div class="md-not-found">' +
        '<div class="md-not-found__icon">🔍</div>' +
        '<h2 class="md-not-found__title">' + _t('md.notfound_title') + '</h2>' +
        '<p class="md-not-found__desc">' + _t('md.notfound_desc') + '</p>' +
        '<a href="./marketplace.html" class="btn btn--primary">' + _t('md.back') + '</a>' +
      '</div>';
  }

  function renderNotAvailable() {
    var content = document.getElementById('mdContent');
    if (!content) return;

    var moderation = 'pending_approval';
    if (typeof Marketplace !== 'undefined' && typeof Marketplace.getPostModeration === 'function') {
      moderation = Marketplace.getPostModeration(currentPost);
    }

    var descKey = moderation === 'rejected' ? 'md.not_available_rejected' : 'md.not_available_pending';

    content.innerHTML =
      '<div class="md-not-found">' +
        '<div class="md-not-found__icon">⏳</div>' +
        '<h2 class="md-not-found__title">' + _t('md.not_available_title') + '</h2>' +
        '<p class="md-not-found__desc">' + _t(descKey) + '</p>' +
        '<a href="./marketplace.html" class="btn btn--primary">' + _t('md.back') + '</a>' +
      '</div>';
  }

  /* ===========================
     RENDER: POST DETAIL
     =========================== */

  function renderDetail(post) {
    var content = document.getElementById('mdContent');
    if (!content) return;

    var imageHtml = buildImageSection(post);

    var specs = [
      { label: _t('md.spec_brand'), value: post.brand },
      { label: _t('md.spec_model'), value: post.model },
      { label: _t('md.spec_year'), value: post.year ? String(post.year) : null },
      { label: _t('md.spec_mileage'), value: (post.mileage || post.mileage === 0) ? formatNumber(post.mileage) + ' km' : null },
      { label: _t('md.spec_fuel'), value: translateFuel(post.fuel) },
      { label: _t('md.spec_transmission'), value: translateTransmission(post.transmission) },
      { label: _t('md.spec_location'), value: post.location },
      { label: _t('md.spec_date'), value: formatDate(post.createdAt) },
      { label: _t('md.spec_views'), value: String(Number(post.viewCount) || 0) }
    ];

    var specsHtml = '';
    for (var i = 0; i < specs.length; i++) {
      var val = specs[i].value;
      specsHtml +=
        '<div class="md-specs__item">' +
          '<span class="md-specs__label">' + escapeHtml(specs[i].label) + '</span>' +
          '<span class="md-specs__value">' + escapeHtml(val || _t('md.spec_updating')) + '</span>' +
        '</div>';
    }

    var ownerInitial = (post.ownerName || 'A').charAt(0).toUpperCase();
    var sellerAvatarHtml = buildSellerAvatarHtml(post, ownerInitial);

    var html =
      '<a href="./marketplace.html" class="md-back">' + _t('md.back') + '</a>' +
      '<div class="md-detail">' +
        imageHtml +
        '<div class="md-detail__info">' +
          '<span class="badge md-detail__badge">' + escapeHtml(post.brand || _t('common.na')) + '</span>' +
          '<h1 class="md-detail__title">' + escapeHtml(post.title) + '</h1>' +
          '<p class="md-detail__price">' + formatPrice(post.price) + '</p>' +
          '<div class="md-specs">' + specsHtml + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="md-description">' +
        '<h2 class="md-description__title">' + _t('md.desc_title') + '</h2>' +
        '<p class="md-description__text">' + escapeHtml(post.description || _t('md.no_desc')) + '</p>' +
      '</div>' +

      '<div class="md-seller">' +
        sellerAvatarHtml +
        '<div>' +
          '<div class="md-seller__name">' + escapeHtml(post.ownerName || _t('market.anonymous')) + '</div>' +
          '<div class="md-seller__email">' + escapeHtml(post.ownerEmail || _t('md.no_contact')) + '</div>' +
        '</div>' +
      '</div>' +

      renderBuyNowSection(post) +

      '<div class="md-reviews" id="mdReviews"></div>';

    content.innerHTML = html;
    bindGallery(post);
  }

  function buildSellerAvatarHtml(post, ownerInitial) {
    var avatarUrl = '';
    if (typeof Account !== 'undefined' && typeof Account.getAvatarByEmail === 'function') {
      avatarUrl = Account.getAvatarByEmail(post.ownerEmail);
    }

    if (avatarUrl) {
      return '<div class="md-seller__avatar md-seller__avatar--img">' +
        '<img src="' + escapeHtml(avatarUrl) + '" alt="' + escapeHtml(post.ownerName || '') + '">' +
      '</div>';
    }

    return '<div class="md-seller__avatar">' + escapeHtml(ownerInitial) + '</div>';
  }

  function buildImageSection(post) {
    var images = [];
    if (typeof Marketplace !== 'undefined' && typeof Marketplace.getPostImages === 'function') {
      images = Marketplace.getPostImages(post);
    } else if (post.image) {
      images = [post.image];
    }

    if (!images.length) {
      return '<div class="md-detail__image-wrap"><div class="md-detail__image--fallback">🏎️</div></div>';
    }

    if (images.length === 1) {
      return '<div class="md-detail__image-wrap">' +
        '<img class="md-detail__image" src="' + escapeHtml(images[0]) + '" alt="' + escapeHtml(post.title) + '" onerror="this.parentElement.innerHTML=\'<div class=md-detail__image--fallback>🏎️</div>\'">' +
      '</div>';
    }

    var thumbsHtml = '';
    for (var i = 0; i < images.length; i++) {
      thumbsHtml +=
        '<button type="button" class="md-gallery__thumb' + (i === 0 ? ' is-active' : '') + '" data-index="' + i + '">' +
          '<img src="' + escapeHtml(images[i]) + '" alt="">' +
        '</button>';
    }

    return '<div class="md-gallery">' +
      '<div class="md-detail__image-wrap md-gallery__main-wrap">' +
        '<img class="md-detail__image md-gallery__main" id="mdGalleryMain" src="' + escapeHtml(images[0]) + '" alt="' + escapeHtml(post.title) + '" onerror="this.parentElement.innerHTML=\'<div class=md-detail__image--fallback>🏎️</div>\'">' +
      '</div>' +
      '<div class="md-gallery__thumbs" id="mdGalleryThumbs">' + thumbsHtml + '</div>' +
    '</div>';
  }

  function bindGallery(post) {
    var main = document.getElementById('mdGalleryMain');
    var thumbsWrap = document.getElementById('mdGalleryThumbs');
    if (!main || !thumbsWrap) return;

    var images = [];
    if (typeof Marketplace !== 'undefined' && typeof Marketplace.getPostImages === 'function') {
      images = Marketplace.getPostImages(post);
    } else if (post.image) {
      images = [post.image];
    }
    if (images.length <= 1) return;

    var thumbs = thumbsWrap.querySelectorAll('.md-gallery__thumb');
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        if (isNaN(idx) || !images[idx]) return;
        main.src = images[idx];
        for (var j = 0; j < thumbs.length; j++) {
          thumbs[j].classList.toggle('is-active', j === idx);
        }
      });
    }
  }

  /* ===========================
     RENDER: BUY NOW CTA (Phase 8)
     =========================== */

  function renderBuyNowSection(post) {
    if (typeof Marketplace !== 'undefined' && typeof Marketplace.isPostPubliclyVisible === 'function') {
      if (!Marketplace.isPostPubliclyVisible(post)) {
        return (
          '<div class="md-buy-section md-buy-section--pending">' +
            '<span class="md-buy-section__status">' + _t('md.not_available_pending') + '</span>' +
          '</div>'
        );
      }
    }

    var status = post.status || 'available';
    var availability = post.availability || status;
    if (availability === 'sold' || status === 'sold') {
      return (
        '<div class="md-buy-section md-buy-section--pending">' +
          '<span class="md-buy-section__status">' + _t('md.sold_status') + '</span>' +
        '</div>'
      );
    }

    var wishlistBtnHtml = '';
    if (typeof Wishlist !== 'undefined') {
      wishlistBtnHtml = Wishlist.renderWishlistBtnHTML({
        itemType: 'market',
        itemId: post.id,
        brand: post.brand || '',
        title: post.title || '',
        image: post.image || '',
        price: post.price || 0,
        sourceUrl: './market-detail.html?id=' + encodeURIComponent(post.id)
      });
    }

    if (status === 'pending') {
      return (
        '<div class="md-buy-section md-buy-section--pending">' +
          '<span class="md-buy-section__status">' + _t('md.pending_status') + '</span>' +
          wishlistBtnHtml +
        '</div>'
      );
    }

    var session = null;
    try {
      session = Auth.getSession();
    } catch (e) {
      session = null;
    }

    if (
      typeof Marketplace !== 'undefined' &&
      typeof Marketplace.isPostOwner === 'function' &&
      Marketplace.isPostOwner(post, session)
    ) {
      return (
        '<div class="md-buy-section md-buy-section--pending">' +
          '<span class="md-buy-section__status">' + _t('md.owner_cannot_buy') + '</span>' +
          wishlistBtnHtml +
        '</div>'
      );
    }

    var consultBtn =
      '<button type="button" class="btn btn--secondary btn--lg" id="btnContactConsult">' +
      _t('contact.consult_btn') +
      '</button>';

    return (
      '<div class="md-buy-section">' +
        '<a href="./checkout.html?postId=' + encodeURIComponent(post.id) + '" class="btn btn--primary btn--lg md-buy-section__btn" id="btnBuyNow">' + _t('md.buy_now') + '</a>' +
        consultBtn +
        wishlistBtnHtml +
      '</div>'
    );
  }

  function incrementViewCount(post) {
    if (!post || !post.id) return;
    var sessionKey = 'autoluxe_view_' + post.id;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, '1');
    } catch (e) { /* ignore */ }
    var next = (Number(post.viewCount) || 0) + 1;
    if (typeof Marketplace !== 'undefined' && Marketplace.updatePost) {
      Marketplace.updatePost(post.id, { viewCount: next });
      post.viewCount = next;
    }
  }

  function bindContactConsult(post) {
    var btn = document.getElementById('btnContactConsult');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var sellerEmail = post && post.ownerEmail ? post.ownerEmail : '';
      if (typeof window.AutoLuxeContact !== 'undefined' && typeof window.AutoLuxeContact.open === 'function') {
        window.AutoLuxeContact.open(sellerEmail);
        return;
      }
      if (sellerEmail) {
        window.location.href = 'mailto:' + encodeURIComponent(sellerEmail);
        return;
      }
      showToast(_t('contact.not_configured'), 'warning');
    });
  }

  /* ===========================
     RENDER: REVIEWS SECTION
     =========================== */

  function renderReviewsSection() {
    var container = document.getElementById('mdReviews');
    if (!container) return;

    var reviews = getReviewsByPostId(currentPostId);

    var html =
      '<div class="md-reviews__header">' +
        '<h2 class="md-reviews__title">' + _t('review.title') + '</h2>' +
      '</div>';

    html += renderRatingSummary(reviews);
    html += renderReviewForm();

    if (reviews.length > 0) {
      html +=
        '<div class="md-reviews__sort">' +
          '<span class="md-reviews__sort-label">' + _t('review.sort_label') + '</span>' +
          '<select class="input md-reviews__sort-select" id="reviewSort">' +
            '<option value="newest"' + (currentSort === 'newest' ? ' selected' : '') + '>' + _t('review.sort_newest') + '</option>' +
            '<option value="highest"' + (currentSort === 'highest' ? ' selected' : '') + '>' + _t('review.sort_highest') + '</option>' +
          '</select>' +
        '</div>';
    }

    html += '<div class="md-review-list" id="reviewList"></div>';
    container.innerHTML = html;

    renderReviewList(reviews);
    bindReviewEvents();
  }

  /* ===========================
     RENDER: RATING SUMMARY
     =========================== */

  function renderRatingSummary(reviews) {
    if (!reviews || reviews.length === 0) {
      return '';
    }

    var total = 0;
    for (var i = 0; i < reviews.length; i++) {
      total += (reviews[i].rating || 0);
    }
    var avg = total / reviews.length;
    var avgRounded = Math.round(avg * 10) / 10;

    return (
      '<div class="md-rating-summary">' +
        '<div class="md-rating-summary__score">' + avgRounded + '/5</div>' +
        '<div>' +
          '<div class="md-rating-summary__stars">' + renderStars(avg) + '</div>' +
          '<div class="md-rating-summary__count">' + _t('review.count', { count: reviews.length }) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  /* ===========================
     RENDER: REVIEW FORM
     =========================== */

  function renderReviewForm() {
    var perm = getPermissionStatus();

    if (!perm.allowed) {
      if (perm.reason === 'not_logged_in') {
        return (
          '<div class="md-review-form">' +
            '<h3 class="md-review-form__title">' + _t('review.form_title') + '</h3>' +
            '<div class="md-review-form__notice">' +
              _t('review.login_notice') +
            '</div>' +
          '</div>'
        );
      }
      if (perm.reason === 'is_owner') {
        return (
          '<div class="md-review-form">' +
            '<h3 class="md-review-form__title">' + _t('review.form_title') + '</h3>' +
            '<div class="md-review-form__notice">' +
              _t('review.owner_notice') +
            '</div>' +
          '</div>'
        );
      }
      return '';
    }

    return (
      '<div class="md-review-form" id="reviewFormWrap">' +
        '<h3 class="md-review-form__title">' + _t('review.form_title') + '</h3>' +
        '<form id="reviewForm">' +
          '<div class="input-group">' +
            '<label class="label">' + _t('review.star_label') + ' <span style="color:var(--color-accent)">*</span></label>' +
            '<div class="md-star-input" id="starInput">' +
              '<button type="button" class="md-star-input__btn" data-star="1">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="2">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="3">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="4">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="5">☆</button>' +
              '<span class="md-star-input__label" id="starLabel">' + _t('review.star_placeholder') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="input-group">' +
            '<label class="label" for="reviewContent">' + _t('review.content_label') + ' <span style="color:var(--color-accent)">*</span></label>' +
            '<textarea class="input" id="reviewContent" placeholder="' + _t('review.content_placeholder') + '" maxlength="' + MAX_REVIEW_LENGTH + '" rows="4"></textarea>' +
            '<span class="md-review-form__charcount" id="charCount">0/' + MAX_REVIEW_LENGTH + '</span>' +
          '</div>' +
          '<div class="md-review-form__actions">' +
            '<button type="submit" class="btn btn--primary" id="reviewSubmitBtn">' + _t('review.submit') + '</button>' +
          '</div>' +
        '</form>' +
      '</div>'
    );
  }

  /* ===========================
     RENDER: REVIEW LIST
     =========================== */

  function renderReviewList(reviews) {
    var listEl = document.getElementById('reviewList');
    if (!listEl) return;

    if (!reviews || reviews.length === 0) {
      listEl.innerHTML =
        '<div class="md-reviews__empty">' +
          '<div class="md-reviews__empty-icon">💬</div>' +
          '<p class="md-reviews__empty-text">' + _t('review.empty_text') + '</p>' +
        '</div>';
      return;
    }

    var sorted = reviews.slice();
    if (currentSort === 'highest') {
      sorted.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    } else {
      sorted.sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    }

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
      var r = sorted[i];
      html +=
        '<div class="md-review-item">' +
          '<div class="md-review-item__header">' +
            '<span class="md-review-item__author">' + escapeHtml(r.reviewerName || _t('market.anonymous')) + '</span>' +
            '<span class="md-review-item__date">' + formatDate(r.createdAt) + '</span>' +
          '</div>' +
          '<div class="md-review-item__stars">' + renderStars(r.rating) + '</div>' +
          '<p class="md-review-item__content">' + escapeHtml(r.content) + '</p>' +
        '</div>';
    }

    listEl.innerHTML = html;
  }

  /* ===========================
     EVENT BINDINGS
     =========================== */

  function bindReviewEvents() {
    bindStarInput();
    bindReviewForm();
    bindSortSelect();
    bindCharCount();
  }

  function bindStarInput() {
    var starInput = document.getElementById('starInput');
    if (!starInput) return;

    var buttons = starInput.querySelectorAll('.md-star-input__btn');
    var label = document.getElementById('starLabel');
    var labels = ['', _t('review.star_1'), _t('review.star_2'), _t('review.star_3'), _t('review.star_4'), _t('review.star_5')];

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var star = parseInt(this.getAttribute('data-star'), 10);
        selectedRating = star;
        updateStarDisplay(buttons, star);
        if (label) label.textContent = labels[star] || '';
      });
    }
  }

  function updateStarDisplay(buttons, rating) {
    for (var i = 0; i < buttons.length; i++) {
      var star = parseInt(buttons[i].getAttribute('data-star'), 10);
      if (star <= rating) {
        buttons[i].textContent = '★';
        buttons[i].classList.add('is-active');
      } else {
        buttons[i].textContent = '☆';
        buttons[i].classList.remove('is-active');
      }
    }
  }

  function bindCharCount() {
    var textarea = document.getElementById('reviewContent');
    var charCount = document.getElementById('charCount');
    if (!textarea || !charCount) return;

    textarea.addEventListener('input', function () {
      charCount.textContent = textarea.value.length + '/' + MAX_REVIEW_LENGTH;
    });
  }

  function bindSortSelect() {
    var sortEl = document.getElementById('reviewSort');
    if (!sortEl) return;

    sortEl.addEventListener('change', function () {
      currentSort = sortEl.value;
      var reviews = getReviewsByPostId(currentPostId);
      renderReviewList(reviews);
    });
  }

  function bindReviewForm() {
    var form = document.getElementById('reviewForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmitReview();
    });
  }

  /* ===========================
     SUBMIT REVIEW
     =========================== */

  function handleSubmitReview() {
    var perm = getPermissionStatus();
    if (!perm.allowed) {
      showToast(_t('review.no_perm'), 'error');
      return;
    }

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      showToast(_t('review.select_star'), 'error');
      return;
    }

    var contentEl = document.getElementById('reviewContent');
    var content = contentEl ? contentEl.value.trim() : '';

    if (!content) {
      showToast(_t('review.enter_content'), 'error');
      return;
    }

    if (content.length > MAX_REVIEW_LENGTH) {
      showToast(_t('review.max_length', { max: MAX_REVIEW_LENGTH }), 'error');
      return;
    }

    var review = {
      reviewId: generateReviewId(),
      postId: currentPostId,
      rating: selectedRating,
      content: content,
      reviewerId: perm.session.userId,
      reviewerName: perm.session.fullName || perm.session.email,
      createdAt: new Date().toISOString()
    };

    var ok = saveReview(review);
    if (ok) {
      showToast(_t('review.success'), 'success');
      selectedRating = 0;
      renderReviewsSection();

      // --- Phase 10: Trigger notification for post owner ---
      if (
        typeof Notifications !== 'undefined' &&
        typeof Notifications.emitEvent === 'function' &&
        currentPost &&
        currentPost.ownerEmail
      ) {
        if (perm.session.email !== currentPost.ownerEmail) {
          Notifications.emitEvent('new_review', {
            userKey: currentPost.ownerEmail,
            postId: currentPostId,
            params: {
              reviewer: perm.session.fullName || _t('market.anonymous'),
              title: currentPost.title || ''
            },
            metadata: {
              reviewId: review.reviewId,
              postId: currentPostId
            }
          });
        }
      }
    } else {
      showToast(_t('review.fail'), 'error');
    }
  }

  /* ===========================
     TOAST (reuse pattern from marketplace)
     =========================== */

  function showToast(message, type) {
    if (typeof Toast !== 'undefined') {
      Toast.show({ message: message, type: type || 'success' });
    }
  }

  /* ===========================
     INIT
     =========================== */

  function init() {
    Seed.run();

    currentPostId = parseQueryId();
    if (!currentPostId) {
      renderNotFound();
      return;
    }

    try {
      currentPost = Marketplace.getPostById(currentPostId);
    } catch (e) {
      currentPost = null;
    }

    if (!currentPost) {
      renderNotFound();
      return;
    }

    var session = null;
    try {
      session = Auth.getSession();
    } catch (e) {
      session = null;
    }

    if (typeof Marketplace !== 'undefined' && typeof Marketplace.canViewPost === 'function') {
      if (!Marketplace.canViewPost(currentPost, session)) {
        renderNotAvailable();
        return;
      }
    }

    incrementViewCount(currentPost);
    renderDetail(currentPost);
    renderReviewsSection();
    bindContactConsult(currentPost);

    if (typeof Wishlist !== 'undefined') {
      var mdContent = document.getElementById('mdContent');
      if (mdContent) Wishlist.bindDelegatedWishlistButtons(mdContent);
    }
  }

  return { init: init };
})();
