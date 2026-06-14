/* =============================================
   ADMIN.JS - AutoLuxe Supercar Web
   Phase 3: post moderation queue + order management
   ============================================= */

var Admin = (function () {
  'use strict';

  var KEYS = {
    orders: 'autoluxe_orders',
    posts: 'autoluxe_market_posts'
  };

  var ORDER_STATUSES = ['new', 'confirmed', 'rejected', 'shipping', 'delivered'];

  var activeTab = 'posts';
  var rejectPostId = null;
  var focusPostId = '';
  var focusOrderId = '';

  function t(key, params) {
    return (typeof I18n !== 'undefined') ? I18n.t(key, params) : key;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function formatDateTime(iso) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatDateTime === 'function') {
      return I18n.formatDateTime(iso);
    }
    if (!iso) return '-';
    try {
      var locale = (typeof I18n !== 'undefined' && I18n.getLocale() === 'en') ? 'en-US' : 'vi-VN';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(iso));
    } catch (e) {
      return '-';
    }
  }

  function formatPrice(price) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatCurrency === 'function') {
      return I18n.formatCurrency(price || 0);
    }
    return '$' + Number(price || 0).toLocaleString('en-US');
  }

  function getSession() {
    try {
      return Auth.getSession();
    } catch (e) {
      return null;
    }
  }

  function ensureAdminAccess() {
    var session = getSession();
    if (!session || !Auth.isAdmin(session)) {
      return false;
    }
    return true;
  }

  function showToast(message, type) {
    if (typeof Toast !== 'undefined') {
      Toast.show({ message: message, type: type || 'success' });
    }
  }

  function getAllOrders() {
    var orders = Storage.get(KEYS.orders, []);
    return Array.isArray(orders) ? orders : [];
  }

  function saveAllOrders(orders) {
    return Storage.set(KEYS.orders, orders);
  }

  function getOrderStatusLabel(status) {
    var key = 'admin.order_status_' + status;
    var translated = t(key);
    if (translated !== key) return translated;
    return t('purchases.status_' + status) || status;
  }

  function pushOrderTimeline(order, status, message, metadata) {
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

  function notifyEvent(eventType, payload) {
    if (!eventType || !payload) return;
    if (typeof Notifications === 'undefined' || typeof Notifications.emitEvent !== 'function') return;
    Notifications.emitEvent(eventType, payload);
  }

  function getOrderSellerEmail(order) {
    if (!isObject(order)) return '';
    var ownerEmail = '';
    if (order.listingSnapshot && order.listingSnapshot.ownerEmail) {
      ownerEmail = order.listingSnapshot.ownerEmail;
    }
    return normalizeEmail(ownerEmail);
  }

  function renderGate() {
    var gate = document.getElementById('adminGate');
    var app = document.getElementById('adminApp');
    if (!gate || !app) return;

    if (!ensureAdminAccess()) {
      app.hidden = true;
      gate.hidden = false;
      gate.innerHTML =
        '<div class="admin-gate">' +
          '<div class="admin-gate__icon">🛡️</div>' +
          '<h2>' + escapeHtml(t('admin.no_permission')) + '</h2>' +
          '<p>' + escapeHtml(t('admin.no_permission_desc')) + '</p>' +
          '<a href="./auth.html" class="btn btn--primary">' + escapeHtml(t('common.login')) + '</a>' +
        '</div>';
      return;
    }

    gate.hidden = true;
    app.hidden = false;
  }

  function updateAdminTabIndicator(activeTabBtn) {
    var strip = document.querySelector('.admin-tabs');
    if (!strip || !activeTabBtn) return;
    var stripRect = strip.getBoundingClientRect();
    var tabRect = activeTabBtn.getBoundingClientRect();
    var left = tabRect.left - stripRect.left + strip.scrollLeft;
    strip.style.setProperty('--tab-indicator-left', left + 'px');
    strip.style.setProperty('--tab-indicator-width', tabRect.width + 'px');
  }

  function switchTab(tabName) {
    activeTab = tabName === 'orders' ? 'orders' : 'posts';

    var tabPosts = document.getElementById('adminTabPosts');
    var tabOrders = document.getElementById('adminTabOrders');
    var panelPosts = document.getElementById('adminPanelPosts');
    var panelOrders = document.getElementById('adminPanelOrders');

    var isPosts = activeTab === 'posts';
    var motion = window.AutoLuxeMotion;

    if (tabPosts) {
      tabPosts.classList.toggle('is-active-tab', isPosts);
      tabPosts.setAttribute('aria-selected', isPosts ? 'true' : 'false');
    }
    if (tabOrders) {
      tabOrders.classList.toggle('is-active-tab', !isPosts);
      tabOrders.setAttribute('aria-selected', !isPosts ? 'true' : 'false');
    }

    if (panelPosts) {
      panelPosts.hidden = !isPosts;
      if (!isPosts) panelPosts.classList.remove('tab-panel--enter');
    }
    if (panelOrders) {
      panelOrders.hidden = isPosts;
      if (isPosts) panelOrders.classList.remove('tab-panel--enter');
    }

    var activePanel = isPosts ? panelPosts : panelOrders;
    var activeTabBtn = isPosts ? tabPosts : tabOrders;

    if (activePanel && !activePanel.hidden) {
      if (motion && typeof motion.animateTabPanel === 'function') {
        motion.animateTabPanel(activePanel);
      } else {
        activePanel.classList.add('tab-panel--enter');
        setTimeout(function () {
          activePanel.classList.remove('tab-panel--enter');
        }, 450);
      }
    }

    if (activeTabBtn) updateAdminTabIndicator(activeTabBtn);

    if (isPosts) {
      renderPostsQueue();
    } else {
      renderOrdersPanel();
    }

    if (window.location.hash !== '#' + activeTab) {
      window.location.hash = activeTab;
    }
  }

  function parseQueryContext() {
    try {
      var params = new URLSearchParams(window.location.search);
      var tab = normalizeText(params.get('tab') || '');
      focusPostId = String(params.get('postId') || '').trim();
      focusOrderId = String(params.get('orderId') || '').trim();

      if (tab === 'orders' || tab === 'posts') {
        activeTab = tab;
      } else if (focusOrderId) {
        activeTab = 'orders';
      } else if (focusPostId) {
        activeTab = 'posts';
      }
    } catch (e) {
      focusPostId = '';
      focusOrderId = '';
    }
  }

  function focusCard(selector, className) {
    if (!selector) return;
    var card = document.querySelector(selector);
    if (!card) return;
    card.classList.add(className);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      card.classList.remove(className);
    }, 2200);
  }

  function applyPostFocus() {
    if (!focusPostId) return;
    focusCard('.admin-post-card[data-post-id="' + focusPostId.replace(/"/g, '\\"') + '"]', 'admin-post-card--focus');
  }

  function applyOrderFocus() {
    if (!focusOrderId) return;
    focusCard('.admin-order-card[data-order-id="' + focusOrderId.replace(/"/g, '\\"') + '"]', 'admin-order-card--focus');
  }

  function renderPostsQueue() {
    var container = document.getElementById('adminPostsQueue');
    if (!container || typeof Marketplace === 'undefined') return;

    var pending = Marketplace.getPendingPosts();
    pending.sort(function (a, b) {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    if (pending.length === 0) {
      container.innerHTML =
        '<div class="admin-empty">' +
          '<p>' + escapeHtml(t('admin.queue_empty')) + '</p>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < pending.length; i++) {
      var post = pending[i];
      var imageStyle = post.image
        ? 'background-image:url(\'' + escapeHtml(post.image) + '\');'
        : '';

      html +=
        '<article class="admin-post-card" data-post-id="' + escapeHtml(post.id) + '">' +
          '<div class="admin-post-card__image" style="' + imageStyle + '"></div>' +
          '<div class="admin-post-card__body">' +
            '<h3 class="admin-post-card__title">' + escapeHtml(post.title) + '</h3>' +
            '<p class="admin-post-card__meta">' + escapeHtml(post.brand) + ' · ' + escapeHtml(post.model) + ' · ' + escapeHtml(String(post.year || '')) + '</p>' +
            '<p class="admin-post-card__meta">' + escapeHtml(t('admin.post_owner', { email: post.ownerEmail || '-' })) + '</p>' +
            '<p class="admin-post-card__price">' + formatPrice(post.price) + '</p>' +
            '<p class="admin-post-card__date">' + escapeHtml(t('admin.post_submitted', { date: formatDateTime(post.createdAt) })) + '</p>' +
          '</div>' +
          '<div class="admin-post-card__actions">' +
            '<button type="button" class="btn btn--primary btn--sm" data-action="approve-post" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('admin.approve_btn')) + '</button>' +
            '<button type="button" class="btn btn--danger btn--sm" data-action="reject-post" data-post-id="' + escapeHtml(post.id) + '">' + escapeHtml(t('admin.reject_btn')) + '</button>' +
          '</div>' +
        '</article>';
    }

    container.innerHTML = html;
    bindPostActions();
    applyPostFocus();
  }

  function bindPostActions() {
    var approveBtns = document.querySelectorAll('[data-action="approve-post"]');
    for (var i = 0; i < approveBtns.length; i++) {
      approveBtns[i].addEventListener('click', function () {
        approvePost(this.getAttribute('data-post-id'));
      });
    }

    var rejectBtns = document.querySelectorAll('[data-action="reject-post"]');
    for (var j = 0; j < rejectBtns.length; j++) {
      rejectBtns[j].addEventListener('click', function () {
        openRejectModal(this.getAttribute('data-post-id'));
      });
    }
  }

  function approvePost(postId) {
    if (!postId || typeof Marketplace === 'undefined') return;

    var post = Marketplace.getPostById(postId);
    if (!post) return;

    var ok = Marketplace.updatePost(postId, {
      moderation: 'approved',
      moderationReason: '',
      moderatedAt: new Date().toISOString()
    });

    if (!ok) {
      showToast(t('admin.update_fail'), 'error');
      return;
    }

    var ownerEmail = normalizeEmail(post.ownerEmail);
    if (ownerEmail) {
      notifyEvent('post_approved', {
        userKey: ownerEmail,
        postId: postId,
        params: { title: post.title || '' },
        metadata: {
          postId: postId,
          moderation: 'approved'
        }
      });
    }

    var approvedPost = Marketplace.getPostById(postId) || post;
    if (typeof SavedSearchService !== 'undefined' && SavedSearchService.notifyMatches) {
      SavedSearchService.notifyMatches(approvedPost, 'approve');
    }

    showToast(t('admin.approved_toast', { title: post.title || '' }), 'success');
    renderPostsQueue();
    renderAdminStats();
  }

  function renderAdminStats() {
    var el = document.getElementById('adminStats');
    if (!el || typeof Marketplace === 'undefined') return;
    var posts = Marketplace.getAllPosts();
    var orders = Storage.get(KEYS.orders, []);
    if (!Array.isArray(orders)) orders = [];
    var totalViews = 0;
    var totalInquiries = 0;
    for (var i = 0; i < posts.length; i++) {
      totalViews += Number(posts[i].viewCount) || 0;
      totalInquiries += Number(posts[i].inquiryCount) || 0;
    }
    el.innerHTML =
      '<div class="admin-stat-card"><span class="admin-stat-card__label">' + escapeHtml(t('admin.stat_views')) + '</span>' +
      '<strong class="admin-stat-card__value">' + totalViews + '</strong></div>' +
      '<div class="admin-stat-card"><span class="admin-stat-card__label">' + escapeHtml(t('admin.stat_orders')) + '</span>' +
      '<strong class="admin-stat-card__value">' + orders.length + '</strong></div>' +
      '<div class="admin-stat-card"><span class="admin-stat-card__label">' + escapeHtml(t('admin.stat_inquiries')) + '</span>' +
      '<strong class="admin-stat-card__value">' + totalInquiries + '</strong></div>';
  }

  function openRejectModal(postId) {
    rejectPostId = postId;
    var modal = document.getElementById('adminRejectModal');
    var reasonInput = document.getElementById('adminRejectReason');
    if (reasonInput) reasonInput.value = '';
    if (modal) {
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeRejectModal() {
    rejectPostId = null;
    var modal = document.getElementById('adminRejectModal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function confirmRejectPost() {
    if (!rejectPostId || typeof Marketplace === 'undefined') return;

    var reasonInput = document.getElementById('adminRejectReason');
    var reason = reasonInput ? reasonInput.value.trim() : '';
    if (!reason) {
      showToast(t('admin.require_reason'), 'error');
      return;
    }

    var post = Marketplace.getPostById(rejectPostId);
    if (!post) {
      closeRejectModal();
      return;
    }

    if (!confirm(t('admin.reject_confirm'))) {
      return;
    }

    var ok = Marketplace.updatePost(rejectPostId, {
      moderation: 'rejected',
      moderationReason: reason,
      moderatedAt: new Date().toISOString()
    });

    if (!ok) {
      showToast(t('admin.update_fail'), 'error');
      return;
    }

    var ownerEmail = normalizeEmail(post.ownerEmail);
    if (ownerEmail) {
      notifyEvent('post_rejected', {
        userKey: ownerEmail,
        postId: rejectPostId,
        params: {
          title: post.title || '',
          reason: reason
        },
        metadata: {
          postId: rejectPostId,
          moderation: 'rejected',
          reason: reason
        }
      });
    }

    showToast(t('admin.rejected_toast', { title: post.title || '' }), 'info');
    closeRejectModal();
    renderPostsQueue();
  }

  function renderOrdersPanel() {
    var container = document.getElementById('adminOrdersList');
    if (!container) return;

    var orders = getAllOrders().slice();
    orders.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    if (orders.length === 0) {
      container.innerHTML =
        '<div class="admin-empty">' +
          '<p>' + escapeHtml(t('admin.order_empty')) + '</p>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      if (!isObject(order)) continue;

      var status = normalizeText(order.orderStatus || order.status) || 'new';
      if (status === 'cancelled' || status === 'canceled') {
        continue;
      }

      var listingTitle = (order.listingSnapshot && order.listingSnapshot.title) || t('purchases.listing_unknown');
      var buyerEmail = normalizeEmail(order.buyerUserEmail || (order.buyer && order.buyer.email) || '-');

      var statusOptions = '';
      for (var s = 0; s < ORDER_STATUSES.length; s++) {
        var st = ORDER_STATUSES[s];
        statusOptions +=
          '<option value="' + st + '"' + (st === status ? ' selected' : '') + '>' +
            escapeHtml(getOrderStatusLabel(st)) +
          '</option>';
      }

      html +=
        '<article class="admin-order-card" data-order-id="' + escapeHtml(order.orderId) + '">' +
          '<div class="admin-order-card__head">' +
            '<div>' +
              '<h3 class="admin-order-card__title">' + escapeHtml(listingTitle) + '</h3>' +
              '<p class="admin-order-card__meta">' + escapeHtml(t('purchases.order_id', { orderId: order.orderId })) + '</p>' +
              '<p class="admin-order-card__meta">' + escapeHtml(t('admin.order_buyer', { email: buyerEmail })) + '</p>' +
              '<p class="admin-order-card__meta">' + escapeHtml(t('purchases.created_at', { date: formatDateTime(order.createdAt) })) + '</p>' +
            '</div>' +
            '<span class="purchase-status purchase-status--' + escapeHtml(status) + '">' + escapeHtml(getOrderStatusLabel(status)) + '</span>' +
          '</div>' +
          '<div class="admin-order-card__form">' +
            '<div class="input-group">' +
              '<label class="label" for="orderStatus_' + escapeHtml(order.orderId) + '">' + escapeHtml(t('admin.order_status_change')) + '</label>' +
              '<select class="input" id="orderStatus_' + escapeHtml(order.orderId) + '" data-order-status-select="' + escapeHtml(order.orderId) + '">' +
                statusOptions +
              '</select>' +
            '</div>' +
            '<div class="input-group">' +
              '<label class="label" for="orderNote_' + escapeHtml(order.orderId) + '">' + escapeHtml(t('admin.order_note_label')) + '</label>' +
              '<textarea class="input admin-order-note" id="orderNote_' + escapeHtml(order.orderId) + '" data-order-note="' + escapeHtml(order.orderId) + '" rows="2" placeholder="' + escapeHtml(t('admin.order_note_ph')) + '"></textarea>' +
            '</div>' +
            '<button type="button" class="btn btn--primary btn--sm" data-action="update-order" data-order-id="' + escapeHtml(order.orderId) + '">' +
              escapeHtml(t('admin.order_save')) +
            '</button>' +
          '</div>' +
        '</article>';
    }

    if (!html) {
      container.innerHTML =
        '<div class="admin-empty">' +
          '<p>' + escapeHtml(t('admin.order_empty_active')) + '</p>' +
        '</div>';
      return;
    }

    container.innerHTML = html;
    bindOrderActions();
    applyOrderFocus();
  }

  function bindOrderActions() {
    var buttons = document.querySelectorAll('[data-action="update-order"]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        updateOrderStatus(this.getAttribute('data-order-id'));
      });
    }
  }

  function syncListingForOrderStatus(order, nextStatus, previousStatus) {
    var postId = order.postId || (order.listingSnapshot && order.listingSnapshot.id);
    if (!postId || typeof Marketplace === 'undefined') return;

    if (nextStatus === 'rejected' && previousStatus !== 'rejected') {
      Marketplace.updatePost(postId, {
        availability: 'available',
        status: 'available'
      });
      return;
    }

    if (nextStatus === 'delivered') {
      Marketplace.updatePost(postId, {
        availability: 'sold',
        status: 'sold'
      });
      return;
    }

    if (nextStatus === 'shipping' || nextStatus === 'confirmed') {
      Marketplace.updatePost(postId, {
        availability: 'pending_payment',
        status: 'pending'
      });
    }
  }

  function updateOrderStatus(orderId) {
    if (!orderId) return;

    var statusSelect = document.querySelector('[data-order-status-select="' + orderId + '"]');
    var noteInput = document.querySelector('[data-order-note="' + orderId + '"]');
    var nextStatus = statusSelect ? normalizeText(statusSelect.value) : '';
    var adminNote = noteInput ? noteInput.value.trim() : '';

    if (!nextStatus || ORDER_STATUSES.indexOf(nextStatus) === -1) {
      showToast(t('admin.order_invalid_status'), 'error');
      return;
    }

    var orders = getAllOrders();
    var order = null;
    var index = -1;

    for (var i = 0; i < orders.length; i++) {
      if (orders[i] && orders[i].orderId === orderId) {
        order = orders[i];
        index = i;
        break;
      }
    }

    if (!order || index < 0) {
      showToast(t('purchases.cancel_not_found'), 'error');
      return;
    }

    var previousStatus = normalizeText(order.orderStatus || order.status) || 'new';
    if (previousStatus === nextStatus && !adminNote) {
      showToast(t('admin.order_no_change'), 'info');
      return;
    }

    order.orderStatus = nextStatus;
    order.status = nextStatus === 'new' ? 'pending' : nextStatus;
    order.updatedAt = new Date().toISOString();

    if (nextStatus === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date().toISOString();
    }

    pushOrderTimeline(order, nextStatus, 'admin_status_update', {
      previousStatus: previousStatus,
      adminNote: adminNote,
      actor: 'admin'
    });

    if (adminNote) {
      order.lastAdminNote = adminNote;
    }

    orders[index] = order;
    saveAllOrders(orders);
    syncListingForOrderStatus(order, nextStatus, previousStatus);

    var buyerEmail = normalizeEmail(order.buyerUserEmail || (order.buyer && order.buyer.email));
    var sellerEmail = getOrderSellerEmail(order);
    var listingTitle = (order.listingSnapshot && order.listingSnapshot.title) || '';
    var statusLabel = getOrderStatusLabel(nextStatus);
    var commonMeta = {
      orderId: order.orderId,
      postId: order.postId || (order.listingSnapshot && order.listingSnapshot.id) || '',
      status: nextStatus,
      adminNote: adminNote
    };

    if (buyerEmail) {
      notifyEvent('order_status_changed_buyer', {
        userKey: buyerEmail,
        orderId: order.orderId,
        postId: commonMeta.postId,
        params: {
          orderId: order.orderId,
          status: statusLabel,
          note: adminNote
        },
        metadata: commonMeta
      });
    }

    if (sellerEmail && sellerEmail !== buyerEmail) {
      notifyEvent('order_status_changed_seller', {
        userKey: sellerEmail,
        orderId: order.orderId,
        postId: commonMeta.postId,
        params: {
          orderId: order.orderId,
          status: statusLabel,
          title: listingTitle,
          note: adminNote
        },
        metadata: commonMeta
      });
    }

    if (nextStatus === 'delivered' && buyerEmail) {
      notifyEvent('order_delivered', {
        userKey: buyerEmail,
        orderId: order.orderId,
        postId: commonMeta.postId,
        params: {
          orderId: order.orderId,
          title: listingTitle
        },
        metadata: commonMeta
      });
    }

    if (nextStatus === 'delivered' && buyerEmail && !order.deliveryReminderSent) {
      notifyEvent('review_reminder', {
        userKey: buyerEmail,
        orderId: order.orderId,
        postId: commonMeta.postId,
        params: {
          title: listingTitle
        },
        metadata: {
          orderId: order.orderId,
          postId: commonMeta.postId
        }
      });
      order.deliveryReminderSent = true;
      orders[index] = order;
      saveAllOrders(orders);
    }

    showToast(t('admin.order_updated', { orderId: order.orderId }), 'success');
    if (noteInput) noteInput.value = '';
    renderOrdersPanel();
  }

  function bindTabs() {
    var tabPosts = document.getElementById('adminTabPosts');
    var tabOrders = document.getElementById('adminTabOrders');

    if (tabPosts) {
      tabPosts.addEventListener('click', function () {
        switchTab('posts');
      });
    }
    if (tabOrders) {
      tabOrders.addEventListener('click', function () {
        switchTab('orders');
      });
    }
  }

  function bindRejectModal() {
    var modal = document.getElementById('adminRejectModal');
    var dialog = modal ? modal.querySelector('.admin-modal__dialog') : null;
    var btnClose = document.getElementById('adminRejectClose');
    var btnCancel = document.getElementById('adminRejectCancel');
    var btnConfirm = document.getElementById('adminRejectConfirm');

    if (btnClose) btnClose.addEventListener('click', closeRejectModal);
    if (btnCancel) btnCancel.addEventListener('click', closeRejectModal);
    if (btnConfirm) btnConfirm.addEventListener('click', confirmRejectPost);

    if (dialog) {
      dialog.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeRejectModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeRejectModal();
    });
  }

  function init() {
    closeRejectModal();

    if (typeof Auth !== 'undefined' && typeof Auth.bootstrapAdminUser === 'function') {
      Auth.bootstrapAdminUser();
    }
    if (typeof Seed !== 'undefined') Seed.run();

    renderGate();
    if (!ensureAdminAccess()) return;

    bindTabs();
    bindRejectModal();
    parseQueryContext();
    renderAdminStats();

    var hash = normalizeText((window.location.hash || '').replace('#', ''));
    if (activeTab === 'orders' || hash === 'orders') {
      switchTab('orders');
    } else {
      switchTab('posts');
    }

    document.addEventListener('autoluxe:locale-changed', function () {
      renderGate();
      if (ensureAdminAccess()) {
        if (activeTab === 'orders') {
          renderOrdersPanel();
        } else {
          renderPostsQueue();
        }
      }
    });
  }

  return {
    init: init
  };
})();
