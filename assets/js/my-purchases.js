/* =============================================
  MY-PURCHASES.JS - AutoLuxe Supercar Web
  Purchase history, 7-day cancel window, auto delivered on page visit
  ============================================= */

var MyPurchases = (function () {
  'use strict';

  var KEYS = {
    orders: 'autoluxe_orders',
    posts: 'autoluxe_market_posts',
    guestId: 'autoluxe_guest_id'
  };

  var DEFAULT_CANCEL_WINDOW_DAYS = 7;
  var CANCELABLE_STATUSES = {
    confirmed: true,
    pending: true,
    new: true,
    shipping: true
  };

  var currentViewer = null;
  var activeFilter = 'all';
  var countdownTimer = null;
  var focusOrderId = '';

  /* ===========================
     HELPERS
     =========================== */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function normalizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  function normalizeEmail(value) {
    return normalizeText(value);
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function getLocale() {
    if (typeof I18n !== 'undefined' && typeof I18n.getLocale === 'function') {
      return I18n.getLocale();
    }
    return 'vi';
  }

  function getLocaleTag() {
    if (typeof I18n !== 'undefined' && typeof I18n.getLocaleTag === 'function') {
      return I18n.getLocaleTag(getLocale());
    }
    return getLocale() === 'en' ? 'en-US' : 'vi-VN';
  }

  function formatDateTime(iso) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatDateTime === 'function') {
      return I18n.formatDateTime(iso);
    }
    if (!iso) return '-';
    try {
      var date = new Date(iso);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat(getLocaleTag(), {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return '-';
    }
  }

  function formatPrice(price) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatCurrency === 'function') {
      return I18n.formatCurrency(price || 0);
    }
    var n = Number(price || 0);
    return '$' + n.toLocaleString('en-US');
  }

  function formatDurationClock(ms) {
    var totalSeconds = Math.max(0, Math.floor(ms / 1000));
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;

    function pad(v) {
      return v < 10 ? '0' + v : String(v);
    }

    return _t('common.countdown_clock', {
      days: days,
      hh: pad(hours),
      mm: pad(mins),
      ss: pad(secs)
    });
  }

  function formatDuration(ms) {
    if (ms <= 0) return _t('purchases.countdown_closed');
    return _t('purchases.cancel_countdown_prefix', { time: formatDurationClock(ms) });
  }

  function getSessionSafe() {
    try {
      return Auth.getSession();
    } catch (e) {
      return null;
    }
  }

  function getGuestId() {
    try {
      return localStorage.getItem(KEYS.guestId) || '';
    } catch (e) {
      return '';
    }
  }

  function getViewerContext() {
    var session = getSessionSafe();
    if (session && session.userId) {
      return {
        type: 'user',
        userId: session.userId,
        email: normalizeEmail(session.email)
      };
    }

    return {
      type: 'guest',
      guestId: getGuestId()
    };
  }

  function getAllOrders() {
    try {
      var orders = Storage.get(KEYS.orders, []);
      return Array.isArray(orders) ? orders : [];
    } catch (e) {
      return [];
    }
  }

  function saveAllOrders(orders) {
    return Storage.set(KEYS.orders, Array.isArray(orders) ? orders : []);
  }

  function getAllPosts() {
    try {
      var posts = Storage.get(KEYS.posts, []);
      return Array.isArray(posts) ? posts : [];
    } catch (e) {
      return [];
    }
  }

  function saveAllPosts(posts) {
    return Storage.set(KEYS.posts, Array.isArray(posts) ? posts : []);
  }

  function getOrderPrimaryStatus(order) {
    var status = normalizeText(order.orderStatus || order.status);
    if (!status) return 'confirmed';

    if (status === 'canceled') return 'cancelled';

    if (
      status === 'new' ||
      status === 'confirmed' ||
      status === 'rejected' ||
      status === 'pending' ||
      status === 'shipping' ||
      status === 'delivered' ||
      status === 'cancelled'
    ) {
      return status;
    }

    return 'confirmed';
  }

  function getOrderStatusLabel(status) {
    if (status === 'new') return _t('purchases.status_new');
    if (status === 'rejected') return _t('purchases.status_rejected');
    if (status === 'delivered') return _t('purchases.status_delivered');
    if (status === 'cancelled') return _t('purchases.status_cancelled');
    if (status === 'shipping') return _t('purchases.status_shipping');
    if (status === 'pending') return _t('purchases.status_pending');
    return _t('purchases.status_confirmed');
  }

  function getCancelUnavailableLabel(status, remainMs) {
    if (status === 'delivered') return _t('purchases.cancel_unavailable_delivered');
    if (status === 'cancelled') return _t('purchases.cancel_unavailable_cancelled');
    if (status === 'rejected') return _t('purchases.status_rejected');
    if (remainMs <= 0) return _t('purchases.cancel_expired');
    return _t('purchases.cancel_unavailable');
  }

  function buildCancelWindowHtml(order, status, canCancel, remainMs) {
    if (status === 'delivered' || status === 'cancelled' || status === 'rejected') {
      return '';
    }

    if (canCancel) {
      return (
        '<div class="purchase-card__timeline">' +
          '<strong>' + _t('purchases.cancel_window_label') + '</strong> ' +
          '<span class="js-cancel-countdown" data-order-id="' + escapeHtml(order.orderId) + '" data-deadline="' + getCancelDeadlineMs(order) + '">' +
            escapeHtml(formatDuration(remainMs)) +
          '</span>' +
        '</div>'
      );
    }

    if (remainMs <= 0 && status !== 'delivered') {
      return '<p class="purchase-card__hint purchase-card__hint--muted">' + escapeHtml(_t('purchases.cancel_expired')) + '</p>';
    }

    return '';
  }

  function getTimelineEntryLabel(entry) {
    if (!entry || !entry.message) return '';

    var msg = entry.message;
    var meta = entry.metadata || {};
    var status = normalizeText(entry.status);

    if (msg === 'admin_status_update') {
      var statusLabel = getOrderStatusLabel(status);
      var line = _t('purchases.timeline_admin_status', { status: statusLabel });
      if (meta.adminNote) {
        line += '<span class="purchase-timeline__note">' + escapeHtml(_t('purchases.timeline_admin_note', { note: meta.adminNote })) + '</span>';
      }
      return line;
    }

    if (msg === 'payment_success') return _t('purchases.timeline_payment_success');
    if (msg === 'cancelled_by_buyer') return _t('purchases.timeline_cancelled');
    if (msg === 'auto_delivered_on_purchases_visit') return _t('purchases.timeline_auto_delivered');
    if (msg === 'guest_merged_after_login') return _t('purchases.timeline_guest_merged');

    return escapeHtml(msg);
  }

  function buildOrderTimelineHtml(order) {
    if (!order || !Array.isArray(order.timeline) || order.timeline.length === 0) {
      return '';
    }

    var items = order.timeline.slice().sort(function (a, b) {
      return new Date(a.at || 0) - new Date(b.at || 0);
    });

    var listHtml = '';
    for (var i = 0; i < items.length; i++) {
      var entry = items[i];
      listHtml +=
        '<li class="purchase-timeline__item">' +
          '<strong>' + escapeHtml(formatDateTime(entry.at)) + '</strong> — ' +
          getTimelineEntryLabel(entry) +
        '</li>';
    }

    return (
      '<div class="purchase-timeline">' +
        '<p class="purchase-timeline__title">' + escapeHtml(_t('purchases.timeline_title')) + '</p>' +
        '<ul class="purchase-timeline__list">' + listHtml + '</ul>' +
      '</div>'
    );
  }

  function buildDeliveredBannerHtml(status, postId) {
    if (status !== 'delivered') return '';

    var reviewBtn = postId
      ? '<a href="./market-detail.html?id=' + encodeURIComponent(postId) + '#mdReviews" class="btn btn--primary btn--sm">' + _t('purchases.review_cta') + '</a>'
      : '';

    return (
      '<div class="purchase-review-banner" role="status">' +
        '<p class="purchase-review-banner__title">' + escapeHtml(_t('purchases.delivered_banner')) + '</p>' +
        '<p class="purchase-review-banner__desc">' + escapeHtml(_t('purchases.review_reminder')) + '</p>' +
        reviewBtn +
      '</div>'
    );
  }

  function orderBelongsToViewer(order, viewer) {
    if (!isObject(order) || !viewer) return false;

    if (viewer.type === 'user') {
      if (order.buyerUserId && order.buyerUserId === viewer.userId) return true;
      if (viewer.email && normalizeEmail(order.buyerUserEmail) === viewer.email) return true;
      return false;
    }

    if (!viewer.guestId) return false;
    return order.buyerGuestId === viewer.guestId;
  }

  function getCancelWindowDays(order) {
    var days = Number(order.cancelWindowDays || DEFAULT_CANCEL_WINDOW_DAYS);
    if (!days || days <= 0) return DEFAULT_CANCEL_WINDOW_DAYS;
    return days;
  }

  function getCancelDeadlineMs(order) {
    if (!isObject(order)) return 0;

    var explicit = Date.parse(order.cancelDeadlineAt || '');
    if (!isNaN(explicit) && explicit > 0) return explicit;

    var createdMs = Date.parse(order.createdAt || '');
    if (isNaN(createdMs)) return 0;

    return createdMs + (getCancelWindowDays(order) * 24 * 60 * 60 * 1000);
  }

  function getRemainingCancelMs(order, nowMs) {
    var deadline = getCancelDeadlineMs(order);
    if (!deadline) return 0;
    return deadline - (nowMs || Date.now());
  }

  function canCancelOrder(order, nowMs) {
    var status = getOrderPrimaryStatus(order);
    if (!CANCELABLE_STATUSES[status]) return false;
    return getRemainingCancelMs(order, nowMs) > 0;
  }

  function isAutoDeliverCandidate(order, nowMs) {
    var status = getOrderPrimaryStatus(order);
    if (status === 'delivered' || status === 'cancelled') return false;
    if (!CANCELABLE_STATUSES[status]) return false;
    return getRemainingCancelMs(order, nowMs) <= 0;
  }

  function getListingTitle(order) {
    if (order.listingSnapshot && order.listingSnapshot.title) return order.listingSnapshot.title;
    return _t('purchases.listing_unknown');
  }

  function getListingPrice(order) {
    if (order.listingSnapshot && order.listingSnapshot.price !== undefined) {
      return Number(order.listingSnapshot.price || 0);
    }
    return Number(order.priceSnapshot || 0);
  }

  function getListingImage(order) {
    if (order.listingSnapshot && order.listingSnapshot.image) return order.listingSnapshot.image;
    return '';
  }

  function getListingOwnerEmail(order) {
    var ownerEmail = '';
    if (order.listingSnapshot && order.listingSnapshot.ownerEmail) {
      ownerEmail = order.listingSnapshot.ownerEmail;
    }
    return normalizeEmail(ownerEmail);
  }

  function getOrderPostId(order) {
    if (order.postId) return order.postId;
    if (order.listingSnapshot && order.listingSnapshot.id) return order.listingSnapshot.id;
    return '';
  }

  function pushTimeline(order, status, message, metadata) {
    if (!Array.isArray(order.timeline)) {
      order.timeline = [];
    }
    order.timeline.push({
      status: status,
      message: message || '',
      metadata: metadata || {},
      at: new Date().toISOString()
    });
  }

  function getVisibleOrders() {
    var viewer = currentViewer || getViewerContext();
    var list = getAllOrders().filter(function (order) {
      return orderBelongsToViewer(order, viewer);
    });

    if (activeFilter !== 'all') {
      list = list.filter(function (order) {
        var status = getOrderPrimaryStatus(order);
        if (activeFilter === 'confirmed') {
          return status === 'confirmed' || status === 'new';
        }
        if (activeFilter === 'pending') {
          return status === 'pending';
        }
        return status === activeFilter;
      });
    }

    list.sort(function (a, b) {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }

  function readFocusOrderIdFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      return String(params.get('orderId') || '').trim();
    } catch (e) {
      return '';
    }
  }

  function focusOrderCardIfNeeded() {
    if (!focusOrderId) return;
    var selector = '.purchase-card[data-order-id="' + focusOrderId.replace(/"/g, '\\"') + '"]';
    var card = document.querySelector(selector);
    if (!card) return;

    card.classList.add('purchase-card--focus');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      card.classList.remove('purchase-card--focus');
    }, 2200);
  }

  function notifyEvent(eventType, payload) {
    if (!eventType || !payload) return;
    if (typeof Notifications === 'undefined' || typeof Notifications.emitEvent !== 'function') return;
    Notifications.emitEvent(eventType, payload);
  }

  function restoreListingToAvailable(order) {
    var postId = getOrderPostId(order);
    if (!postId) return false;

    if (typeof Marketplace !== 'undefined' && typeof Marketplace.updatePost === 'function') {
      return Marketplace.updatePost(postId, {
        status: 'available',
        availability: 'available'
      });
    }

    var posts = getAllPosts();
    var updated = false;

    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === postId) {
        posts[i].status = 'available';
        posts[i].availability = 'available';
        posts[i].updatedAt = new Date().toISOString();
        updated = true;
        break;
      }
    }

    if (!updated) return false;
    return saveAllPosts(posts);
  }

  function applyAutoDeliveredTransitions() {
    var viewer = currentViewer || getViewerContext();
    var orders = getAllOrders();
    var nowMs = Date.now();
    var changed = false;
    var deliveredCount = 0;

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      if (!orderBelongsToViewer(order, viewer)) continue;
      if (!isAutoDeliverCandidate(order, nowMs)) continue;

      var prevStatus = getOrderPrimaryStatus(order);
      order.orderStatus = 'delivered';
      order.status = 'delivered';
      if (!order.deliveredAt) {
        order.deliveredAt = new Date().toISOString();
      }
      order.updatedAt = new Date().toISOString();
      pushTimeline(order, 'delivered', 'auto_delivered_on_purchases_visit', {
        previousStatus: prevStatus
      });

      if (!order.deliveryReminderSent) {
        var buyerEmail = normalizeEmail(order.buyerUserEmail || (order.buyer && order.buyer.email));
        var postId = getOrderPostId(order);
        var eventMeta = { orderId: order.orderId, postId: postId };
        if (buyerEmail) {
          notifyEvent('order_delivered', {
            userKey: buyerEmail,
            orderId: order.orderId,
            postId: postId,
            params: {
              orderId: order.orderId,
              title: getListingTitle(order)
            },
            metadata: eventMeta
          });

          notifyEvent('review_reminder', {
            userKey: buyerEmail,
            orderId: order.orderId,
            postId: postId,
            params: {
              title: getListingTitle(order)
            },
            metadata: eventMeta
          });
        }
        order.deliveryReminderSent = true;
      }

      deliveredCount += 1;
      changed = true;
    }

    if (changed) {
      saveAllOrders(orders);
    }

    return deliveredCount;
  }

  function cancelOrder(orderId) {
    if (!orderId) return;

    var viewer = currentViewer || getViewerContext();
    var orders = getAllOrders();
    var found = null;
    var foundIndex = -1;

    for (var i = 0; i < orders.length; i++) {
      if (orders[i] && orders[i].orderId === orderId) {
        found = orders[i];
        foundIndex = i;
        break;
      }
    }

    if (!found || foundIndex === -1) {
      showToast(_t('purchases.cancel_not_found'), 'error');
      return;
    }

    if (!orderBelongsToViewer(found, viewer)) {
      showToast(_t('purchases.cancel_no_permission'), 'error');
      return;
    }

    if (!canCancelOrder(found, Date.now())) {
      showToast(_t('purchases.cancel_window_closed'), 'error');
      renderOrders();
      return;
    }

    var confirmed = confirm(_t('purchases.cancel_confirm', { orderId: found.orderId }));
    if (!confirmed) return;

    found.orderStatus = 'cancelled';
    found.status = 'cancelled';
    found.cancelledAt = new Date().toISOString();
    found.updatedAt = new Date().toISOString();
    pushTimeline(found, 'cancelled', 'cancelled_by_buyer', {});

    var listingRestored = restoreListingToAvailable(found);

    var buyerEmail = normalizeEmail(found.buyerUserEmail || (found.buyer && found.buyer.email));
    var sellerEmail = getListingOwnerEmail(found);
    var adminEmail = (typeof Auth !== 'undefined' && Auth.ADMIN_EMAIL)
      ? normalizeEmail(Auth.ADMIN_EMAIL)
      : '';
    var postId = getOrderPostId(found);
    var eventMeta = {
      orderId: found.orderId,
      postId: postId
    };

    if (buyerEmail) {
      notifyEvent('order_cancelled_buyer', {
        userKey: buyerEmail,
        orderId: found.orderId,
        postId: postId,
        params: {
          orderId: found.orderId
        },
        metadata: eventMeta
      });
    }

    if (sellerEmail && sellerEmail !== buyerEmail) {
      notifyEvent('order_cancelled_seller', {
        userKey: sellerEmail,
        orderId: found.orderId,
        postId: postId,
        params: {
          title: getListingTitle(found),
          orderId: found.orderId
        },
        metadata: eventMeta
      });
    }

    if (adminEmail && adminEmail !== buyerEmail && adminEmail !== sellerEmail) {
      notifyEvent('order_cancelled_admin', {
        userKey: adminEmail,
        orderId: found.orderId,
        postId: postId,
        params: {
          orderId: found.orderId,
          title: getListingTitle(found),
          buyer: found.buyer && found.buyer.fullName ? found.buyer.fullName : buyerEmail
        },
        metadata: eventMeta
      });
    }

    saveAllOrders(orders);

    if (listingRestored) {
      showToast(_t('purchases.cancel_success'), 'success');
    } else {
      showToast(_t('purchases.cancel_success_listing_warn'), 'info');
    }

    renderOrders();
  }

  /* ===========================
     RENDER
     =========================== */

  function renderContextNote() {
    var contextEl = document.getElementById('purchaseContext');
    if (!contextEl) return;

    if (!currentViewer) {
      contextEl.textContent = '';
      return;
    }

    if (currentViewer.type === 'user') {
      contextEl.textContent = _t('purchases.context_user');
      return;
    }

    if (!currentViewer.guestId) {
      contextEl.textContent = _t('purchases.context_guest_empty');
    } else {
      contextEl.textContent = _t('purchases.context_guest');
    }
  }

  function renderOrders() {
    var container = document.getElementById('purchaseList');
    if (!container) return;

    var orders = getVisibleOrders();

    if (orders.length === 0) {
      container.innerHTML =
        '<div class="purchase-empty">' +
          '<div class="purchase-empty__icon">🧾</div>' +
          '<h3 class="purchase-empty__title">' + _t('purchases.empty_title') + '</h3>' +
          '<p class="purchase-empty__desc">' + _t('purchases.empty_desc') + '</p>' +
          '<div class="purchase-empty__actions">' +
            '<a href="./marketplace.html" class="btn btn--primary">' + _t('purchases.browse_market') + '</a>' +
          '</div>' +
        '</div>';
      stopCountdown();
      return;
    }

    var now = Date.now();
    var html = '';

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      var status = getOrderPrimaryStatus(order);
      var canCancel = canCancelOrder(order, now);
      var remainMs = getRemainingCancelMs(order, now);
      var postId = getOrderPostId(order);
      var cancelWindowHtml = buildCancelWindowHtml(order, status, canCancel, remainMs);
      var deliveredBannerHtml = buildDeliveredBannerHtml(status, postId);
      var timelineHtml = buildOrderTimelineHtml(order);
      var image = getListingImage(order);
      var imageHtml = image
        ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(getListingTitle(order)) + '">'
        : '<div class="purchase-card__image--fallback">🏎️</div>';

      html +=
        '<article class="purchase-card" data-order-id="' + escapeHtml(order.orderId) + '">' +
          '<div class="purchase-card__image">' + imageHtml + '</div>' +
          '<div class="purchase-card__body">' +
            '<div class="purchase-card__header">' +
              '<div>' +
                '<h3 class="purchase-card__title">' + escapeHtml(getListingTitle(order)) + '</h3>' +
                '<p class="purchase-card__meta">' + _t('purchases.order_id', { orderId: order.orderId }) + '</p>' +
                '<p class="purchase-card__meta">' + _t('purchases.created_at', { date: formatDateTime(order.createdAt) }) + '</p>' +
              '</div>' +
              '<span class="purchase-status purchase-status--' + escapeHtml(status) + '">' + escapeHtml(getOrderStatusLabel(status)) + '</span>' +
            '</div>' +

            '<div class="purchase-card__price">' + formatPrice(getListingPrice(order)) + '</div>' +
            deliveredBannerHtml +
            cancelWindowHtml +
            timelineHtml +

            '<div class="purchase-card__actions">' +
              (postId
                ? '<a href="./market-detail.html?id=' + encodeURIComponent(postId) + '" class="btn btn--secondary btn--sm">' + _t('purchases.view_listing') + '</a>'
                : '') +
              (canCancel
                ? '<button type="button" class="btn btn--danger btn--sm" data-action="cancel" data-order-id="' + escapeHtml(order.orderId) + '">' + _t('purchases.cancel_order') + '</button>'
                : (status !== 'delivered' && status !== 'cancelled' && status !== 'rejected'
                  ? '<button type="button" class="btn btn--secondary btn--sm" disabled title="' + escapeHtml(getCancelUnavailableLabel(status, remainMs)) + '">' + _t('purchases.cancel_unavailable') + '</button>'
                  : '')) +
            '</div>' +
          '</div>' +
        '</article>';
    }

    container.innerHTML = html;
    bindOrderActions();
    startCountdown();
    focusOrderCardIfNeeded();

    if (window.AutoLuxeMotion && typeof window.AutoLuxeMotion.pulseList === 'function') {
      window.AutoLuxeMotion.pulseList(container);
    } else {
      container.classList.remove('list-surface--refresh');
      void container.offsetWidth;
      container.classList.add('list-surface--refresh');
    }

    if (window.AutoLuxeMotion && typeof window.AutoLuxeMotion.initScrollReveal === 'function') {
      window.AutoLuxeMotion.initScrollReveal();
    }
  }

  function bindFilters() {
    var filter = document.getElementById('purchaseStatusFilter');
    if (!filter) return;

    filter.addEventListener('change', function () {
      activeFilter = normalizeText(filter.value) || 'all';
      renderOrders();
    });
  }

  function bindOrderActions() {
    var buttons = document.querySelectorAll('[data-action="cancel"]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var orderId = this.getAttribute('data-order-id') || '';
        cancelOrder(orderId);
      });
    }
  }

  function updateCountdownNodes() {
    var nodes = document.querySelectorAll('.js-cancel-countdown');
    var now = Date.now();

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var deadline = Number(node.getAttribute('data-deadline') || 0);
      if (!deadline) {
        node.textContent = _t('purchases.countdown_closed');
        continue;
      }
      var remain = deadline - now;
      node.textContent = remain > 0 ? formatDuration(remain) : _t('purchases.countdown_closed');
    }
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function startCountdown() {
    stopCountdown();
    updateCountdownNodes();
    countdownTimer = setInterval(function () {
      updateCountdownNodes();
    }, 1000);
  }

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

    currentViewer = getViewerContext();
    focusOrderId = readFocusOrderIdFromQuery();
    renderContextNote();
    bindFilters();

    var deliveredCount = applyAutoDeliveredTransitions();
    if (deliveredCount > 0) {
      showToast(_t('purchases.auto_delivered_notice', { count: deliveredCount }), 'info');
    }

    renderOrders();

    document.addEventListener('autoluxe:locale-changed', function () {
      renderContextNote();
      renderOrders();
    });
  }

  return {
    init: init
  };
})();
