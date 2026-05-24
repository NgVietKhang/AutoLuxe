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
    if (!price && price !== 0) return '$0';
    return '$' + Number(price).toLocaleString('en-US');
  }

  function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('en-US');
  }

  function formatDate(isoStr) {
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
        '<h2 class="md-not-found__title">Không tìm thấy tin rao</h2>' +
        '<p class="md-not-found__desc">Tin rao này không tồn tại hoặc đã bị xóa.</p>' +
        '<a href="./marketplace.html" class="btn btn--primary">← Quay lại Marketplace</a>' +
      '</div>';
  }

  /* ===========================
     RENDER: POST DETAIL
     =========================== */

  function renderDetail(post) {
    var content = document.getElementById('mdContent');
    if (!content) return;

    var imageHtml;
    if (post.image) {
      imageHtml = '<img class="md-detail__image" src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" onerror="this.parentElement.innerHTML=\'<div class=md-detail__image--fallback>🏎️</div>\'">';
    } else {
      imageHtml = '<div class="md-detail__image--fallback">🏎️</div>';
    }

    var specs = [
      { label: 'Hãng xe', value: post.brand },
      { label: 'Model', value: post.model },
      { label: 'Năm SX', value: post.year ? String(post.year) : null },
      { label: 'Số km', value: (post.mileage || post.mileage === 0) ? formatNumber(post.mileage) + ' km' : null },
      { label: 'Nhiên liệu', value: post.fuel },
      { label: 'Hộp số', value: post.transmission },
      { label: 'Khu vực', value: post.location },
      { label: 'Ngày đăng', value: formatDate(post.createdAt) }
    ];

    var specsHtml = '';
    for (var i = 0; i < specs.length; i++) {
      var val = specs[i].value;
      specsHtml +=
        '<div class="md-specs__item">' +
          '<span class="md-specs__label">' + escapeHtml(specs[i].label) + '</span>' +
          '<span class="md-specs__value">' + escapeHtml(val || 'Đang cập nhật') + '</span>' +
        '</div>';
    }

    var ownerInitial = (post.ownerName || 'A').charAt(0).toUpperCase();

    var html =
      '<a href="./marketplace.html" class="md-back">← Quay lại Marketplace</a>' +
      '<div class="md-detail">' +
        '<div class="md-detail__image-wrap">' + imageHtml + '</div>' +
        '<div class="md-detail__info">' +
          '<span class="badge md-detail__badge">' + escapeHtml(post.brand || 'N/A') + '</span>' +
          '<h1 class="md-detail__title">' + escapeHtml(post.title) + '</h1>' +
          '<p class="md-detail__price">' + formatPrice(post.price) + '</p>' +
          '<div class="md-specs">' + specsHtml + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="md-description">' +
        '<h2 class="md-description__title">Mô tả chi tiết</h2>' +
        '<p class="md-description__text">' + escapeHtml(post.description || 'Chưa có mô tả.') + '</p>' +
      '</div>' +

      '<div class="md-seller">' +
        '<div class="md-seller__avatar">' + escapeHtml(ownerInitial) + '</div>' +
        '<div>' +
          '<div class="md-seller__name">' + escapeHtml(post.ownerName || 'Ẩn danh') + '</div>' +
          '<div class="md-seller__email">' + escapeHtml(post.ownerEmail || 'Không có thông tin liên hệ') + '</div>' +
        '</div>' +
      '</div>' +

      renderBuyNowSection(post) +

      '<div class="md-reviews" id="mdReviews"></div>';

    content.innerHTML = html;
  }

  /* ===========================
     RENDER: BUY NOW CTA (Phase 8)
     =========================== */

  function renderBuyNowSection(post) {
    var status = post.status || 'available';
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
          '<span class="md-buy-section__status">⏳ Đang chờ xử lý - Không khả dụng</span>' +
          wishlistBtnHtml +
        '</div>'
      );
    }

    return (
      '<div class="md-buy-section">' +
        '<a href="./checkout.html?postId=' + encodeURIComponent(post.id) + '" class="btn btn--primary btn--lg md-buy-section__btn" id="btnBuyNow">🛒 Mua ngay</a>' +
        wishlistBtnHtml +
      '</div>'
    );
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
        '<h2 class="md-reviews__title">Đánh giá showroom</h2>' +
      '</div>';

    html += renderRatingSummary(reviews);
    html += renderReviewForm();

    if (reviews.length > 0) {
      html +=
        '<div class="md-reviews__sort">' +
          '<span class="md-reviews__sort-label">Sắp xếp:</span>' +
          '<select class="input md-reviews__sort-select" id="reviewSort">' +
            '<option value="newest"' + (currentSort === 'newest' ? ' selected' : '') + '>Mới nhất</option>' +
            '<option value="highest"' + (currentSort === 'highest' ? ' selected' : '') + '>Điểm cao</option>' +
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
          '<div class="md-rating-summary__count">' + reviews.length + ' lượt đánh giá</div>' +
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
            '<h3 class="md-review-form__title">Viết đánh giá</h3>' +
            '<div class="md-review-form__notice">' +
              'Bạn cần <a href="./auth.html">đăng nhập</a> để gửi đánh giá.' +
            '</div>' +
          '</div>'
        );
      }
      if (perm.reason === 'is_owner') {
        return (
          '<div class="md-review-form">' +
            '<h3 class="md-review-form__title">Viết đánh giá</h3>' +
            '<div class="md-review-form__notice">' +
              'Bạn không thể tự đánh giá tin rao của chính mình.' +
            '</div>' +
          '</div>'
        );
      }
      return '';
    }

    return (
      '<div class="md-review-form" id="reviewFormWrap">' +
        '<h3 class="md-review-form__title">Viết đánh giá</h3>' +
        '<form id="reviewForm">' +
          '<div class="input-group">' +
            '<label class="label">Đánh giá sao <span style="color:var(--color-accent)">*</span></label>' +
            '<div class="md-star-input" id="starInput">' +
              '<button type="button" class="md-star-input__btn" data-star="1">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="2">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="3">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="4">☆</button>' +
              '<button type="button" class="md-star-input__btn" data-star="5">☆</button>' +
              '<span class="md-star-input__label" id="starLabel">Chọn số sao</span>' +
            '</div>' +
          '</div>' +
          '<div class="input-group">' +
            '<label class="label" for="reviewContent">Nội dung đánh giá <span style="color:var(--color-accent)">*</span></label>' +
            '<textarea class="input" id="reviewContent" placeholder="Chia sẻ trải nghiệm của bạn..." maxlength="' + MAX_REVIEW_LENGTH + '" rows="4"></textarea>' +
            '<span class="md-review-form__charcount" id="charCount">0/' + MAX_REVIEW_LENGTH + '</span>' +
          '</div>' +
          '<div class="md-review-form__actions">' +
            '<button type="submit" class="btn btn--primary" id="reviewSubmitBtn">Gửi đánh giá</button>' +
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
          '<p class="md-reviews__empty-text">Chưa có đánh giá nào cho tin này. Hãy là người đầu tiên!</p>' +
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
            '<span class="md-review-item__author">' + escapeHtml(r.reviewerName || 'Ẩn danh') + '</span>' +
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
    var labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

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
      showToast('Bạn không có quyền đánh giá tin này.', 'error');
      return;
    }

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      showToast('Vui lòng chọn số sao đánh giá (1-5).', 'error');
      return;
    }

    var contentEl = document.getElementById('reviewContent');
    var content = contentEl ? contentEl.value.trim() : '';

    if (!content) {
      showToast('Vui lòng nhập nội dung đánh giá.', 'error');
      return;
    }

    if (content.length > MAX_REVIEW_LENGTH) {
      showToast('Nội dung đánh giá tối đa ' + MAX_REVIEW_LENGTH + ' ký tự.', 'error');
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
      showToast('Đánh giá đã được gửi thành công!', 'success');
      selectedRating = 0;
      renderReviewsSection();

      // --- Phase 10: Trigger notification for post owner ---
      if (typeof Notifications !== 'undefined' && currentPost && currentPost.ownerEmail) {
        if (perm.session.email !== currentPost.ownerEmail) {
          Notifications.addNotification({
            userKey: currentPost.ownerEmail,
            type: 'new_review',
            title: 'Đánh giá mới',
            message: (perm.session.fullName || 'Ai đó') + ' đã đánh giá tin "' + (currentPost.title || '') + '".',
            link: './market-detail.html?id=' + encodeURIComponent(currentPostId),
            metadata: { reviewId: review.reviewId, postId: currentPostId }
          });
        }
      }
    } else {
      showToast('Gửi đánh giá thất bại. Vui lòng thử lại.', 'error');
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

    renderDetail(currentPost);
    renderReviewsSection();

    if (typeof Wishlist !== 'undefined') {
      var mdContent = document.getElementById('mdContent');
      if (mdContent) Wishlist.bindDelegatedWishlistButtons(mdContent);
    }
  }

  return { init: init };
})();
