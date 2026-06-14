/* =============================================
   NOTIFICATIONS.JS - AutoLuxe Supercar Web
   Notification center: data layer + header bell + panel (Phase 10)
   ============================================= */

var Notifications = (function () {
  'use strict';

  var KEY = 'autoluxe_notifications';
  var panelOpen = false;
  var EVENT_DEFINITIONS = {
    admin_pending_post: {
      type: 'post_status_change',
      titleKey: 'notif.event_admin_pending_post_title',
      messageKey: 'notif.event_admin_pending_post_msg',
      deepLink: function (input) {
        return {
          page: 'admin.html',
          query: {
            tab: 'posts',
            postId: getPostId(input)
          }
        };
      }
    },
    post_approved: {
      type: 'post_status_change',
      titleKey: 'notif.event_post_approved_title',
      messageKey: 'notif.event_post_approved_msg',
      deepLink: function (input) {
        return {
          page: 'market-detail.html',
          query: { id: getPostId(input) }
        };
      }
    },
    post_rejected: {
      type: 'post_status_change',
      titleKey: 'notif.event_post_rejected_title',
      messageKey: 'notif.event_post_rejected_msg',
      deepLink: function (input) {
        return {
          page: 'account.html',
          query: { postId: getPostId(input) },
          hash: 'listings'
        };
      }
    },
    order_created_buyer: {
      type: 'order_success',
      titleKey: 'notif.event_order_created_buyer_title',
      messageKey: 'notif.event_order_created_buyer_msg',
      deepLink: function (input) {
        return buildOrderDeepLink(input);
      }
    },
    order_created_seller: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_created_seller_title',
      messageKey: 'notif.event_order_created_seller_msg',
      deepLink: function (input) {
        return buildPostDeepLink(input);
      }
    },
    order_created_admin: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_created_admin_title',
      messageKey: 'notif.event_order_created_admin_msg',
      deepLink: function (input) {
        return buildAdminOrderDeepLink(input);
      }
    },
    order_status_changed_buyer: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_status_changed_buyer_title',
      messageKey: 'notif.event_order_status_changed_buyer_msg',
      deepLink: function (input) {
        return buildOrderDeepLink(input);
      }
    },
    order_status_changed_seller: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_status_changed_seller_title',
      messageKey: 'notif.event_order_status_changed_seller_msg',
      deepLink: function (input) {
        return buildPostDeepLink(input);
      }
    },
    order_cancelled_buyer: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_cancelled_buyer_title',
      messageKey: 'notif.event_order_cancelled_buyer_msg',
      deepLink: function (input) {
        return buildOrderDeepLink(input);
      }
    },
    order_cancelled_seller: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_cancelled_seller_title',
      messageKey: 'notif.event_order_cancelled_seller_msg',
      deepLink: function (input) {
        return buildPostDeepLink(input);
      }
    },
    order_cancelled_admin: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_cancelled_admin_title',
      messageKey: 'notif.event_order_cancelled_admin_msg',
      deepLink: function (input) {
        return buildAdminOrderDeepLink(input);
      }
    },
    order_delivered: {
      type: 'order_status_change',
      titleKey: 'notif.event_order_delivered_title',
      messageKey: 'notif.event_order_delivered_msg',
      deepLink: function (input) {
        return buildOrderDeepLink(input);
      }
    },
    review_reminder: {
      type: 'review_reminder',
      titleKey: 'notif.event_review_reminder_title',
      messageKey: 'notif.event_review_reminder_msg',
      deepLink: function (input) {
        return {
          page: 'market-detail.html',
          query: { id: getPostId(input) },
          hash: 'mdReviews'
        };
      }
    },
    new_review: {
      type: 'new_review',
      titleKey: 'notif.event_new_review_title',
      messageKey: 'notif.event_new_review_msg',
      deepLink: function (input) {
        return {
          page: 'market-detail.html',
          query: { id: getPostId(input) },
          hash: 'mdReviews'
        };
      }
    },
    saved_search_match: {
      type: 'info',
      titleKey: 'notif.event_saved_search_title',
      messageKey: 'notif.event_saved_search_msg',
      deepLink: function (input) {
        var q = input.filterQuery || {};
        return {
          page: 'marketplace.html',
          query: q
        };
      }
    },
    new_message: {
      type: 'info',
      titleKey: 'notif.event_new_message_title',
      messageKey: 'notif.event_new_message_msg',
      deepLink: function () {
        return {
          page: 'marketplace.html',
          query: {}
        };
      }
    }
  };

  /* ===========================
     HELPERS
     =========================== */

  function generateId() {
    return 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function t(key, params) {
    if (typeof I18n !== 'undefined' && typeof I18n.t === 'function') {
      return I18n.t(key, params || {});
    }
    return key;
  }

  function normalizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  function normalizeEmail(value) {
    return normalizeText(value);
  }

  function toSafeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }

  function getOrderId(input) {
    var source = toSafeObject(input);
    var metadata = toSafeObject(source.metadata);
    return source.orderId || metadata.orderId || '';
  }

  function getPostId(input) {
    var source = toSafeObject(input);
    var metadata = toSafeObject(source.metadata);
    return source.postId || metadata.postId || '';
  }

  function getStatusLabel(input) {
    var source = toSafeObject(input);
    return source.statusLabel || source.status || '';
  }

  function sanitizePagePath(page) {
    var value = String(page || '').trim();
    if (!value) return '';
    value = value.replace(/^\.\/+/, '').replace(/^\/+/, '');
    if (value.indexOf('pages/') === 0) {
      value = value.substring('pages/'.length);
    }
    if (value && value.indexOf('.html') === -1) {
      value += '.html';
    }
    return value;
  }

  function buildOrderDeepLink(input) {
    return {
      page: 'my-purchases.html',
      query: { orderId: getOrderId(input) }
    };
  }

  function buildPostDeepLink(input) {
    return {
      page: 'market-detail.html',
      query: { id: getPostId(input) }
    };
  }

  function buildAdminOrderDeepLink(input) {
    return {
      page: 'admin.html',
      query: {
        tab: 'orders',
        orderId: getOrderId(input)
      }
    };
  }

  function normalizeDeepLink(input) {
    if (!input || typeof input !== 'object') return null;

    var page = sanitizePagePath(input.page || input.path || '');
    if (!page) return null;

    var deepLink = {
      page: page
    };

    var query = toSafeObject(input.query);
    var normalizedQuery = {};
    for (var key in query) {
      if (!query.hasOwnProperty(key)) continue;
      if (query[key] === undefined || query[key] === null || query[key] === '') continue;
      normalizedQuery[key] = query[key];
    }
    if (Object.keys(normalizedQuery).length > 0) {
      deepLink.query = normalizedQuery;
    }

    var hash = String(input.hash || '').replace(/^#/, '').trim();
    if (hash) deepLink.hash = hash;

    return deepLink;
  }

  function buildLinkFromDeepLink(deepLink) {
    if (!deepLink || !deepLink.page) return '';

    var link = './' + deepLink.page;
    var query = deepLink.query || {};
    var queryParts = [];
    for (var key in query) {
      if (!query.hasOwnProperty(key)) continue;
      var value = query[key];
      if (value === undefined || value === null || value === '') continue;
      queryParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
    }
    if (queryParts.length > 0) {
      link += '?' + queryParts.join('&');
    }
    if (deepLink.hash) {
      link += '#' + encodeURIComponent(String(deepLink.hash));
    }
    return link;
  }

  function getCurrentUserKey() {
    try {
      var session = Auth.getSession();
      return session ? normalizeEmail(session.email) : null;
    } catch (e) {
      return null;
    }
  }

  function timeAgo(isoStr) {
    if (!isoStr) return '';
    if (typeof I18n !== 'undefined' && typeof I18n.formatRelativeTime === 'function') {
      return I18n.formatRelativeTime(isoStr);
    }
    try {
      var now = Date.now();
      var then = new Date(isoStr).getTime();
      if (isNaN(then)) return '';
      var diff = Math.floor((now - then) / 1000);
      if (diff < 60) return t('notif.time_just_now');
      if (diff < 3600) return t('notif.time_min', { n: Math.floor(diff / 60) });
      if (diff < 86400) return t('notif.time_hour', { n: Math.floor(diff / 3600) });
      if (diff < 2592000) return t('notif.time_day', { n: Math.floor(diff / 86400) });
      return t('notif.time_month', { n: Math.floor(diff / 2592000) });
    } catch (e) {
      return '';
    }
  }

  /* ===========================
     DATA LAYER
     =========================== */

  function getNotifications() {
    try {
      var data = Storage.get(KEY, []);
      if (!Array.isArray(data)) return [];
      var changed = false;
      var normalized = [];

      for (var i = 0; i < data.length; i++) {
        var raw = data[i];
        if (!raw || typeof raw !== 'object') continue;

        var userKey = normalizeEmail(raw.userKey);
        if (!userKey) continue;

        var deepLink = normalizeDeepLink(raw.deepLink);
        var link = raw.link || buildLinkFromDeepLink(deepLink);
        var eventType = normalizeText(raw.eventType || raw.type || 'system') || 'system';

        var next = {
          id: raw.id || generateId(),
          userKey: userKey,
          type: raw.type || 'system',
          eventType: eventType,
          title: raw.title || '',
          message: raw.message || '',
          link: link,
          deepLink: deepLink,
          metadata: toSafeObject(raw.metadata),
          isRead: !!raw.isRead,
          createdAt: raw.createdAt || new Date().toISOString()
        };

        if (
          next.id !== raw.id ||
          next.userKey !== raw.userKey ||
          next.eventType !== raw.eventType ||
          next.link !== raw.link ||
          !!next.deepLink !== !!raw.deepLink ||
          next.isRead !== raw.isRead
        ) {
          changed = true;
        }

        normalized.push(next);
      }

      if (changed) {
        setNotifications(normalized);
      }

      return normalized;
    } catch (e) {
      return [];
    }
  }

  function setNotifications(list) {
    try {
      return Storage.set(KEY, Array.isArray(list) ? list : []);
    } catch (e) {
      return false;
    }
  }

  function getNotificationsByUser(userKey) {
    if (!userKey) return [];
    return getNotifications().filter(function (n) {
      return n.userKey === userKey;
    });
  }

  /**
   * Add a notification.
   * @param {Object} input
   *   input.userKey {string} - recipient email
   *   input.type {string} - UI category: 'order_success' | 'order_status_change' | 'review_reminder' | ...
   *   input.eventType {string} - business event identifier
   *   input.title {string}
   *   input.message {string}
   *   input.link {string} optional (legacy)
   *   input.deepLink {Object} optional ({ page, query, hash })
   *   input.metadata {Object} optional
   * @returns {Object|null} the created notification
   */
  function addNotification(input) {
    if (!input || !input.userKey) return null;

    var normalizedUserKey = normalizeEmail(input.userKey);
    if (!normalizedUserKey) return null;

    var deepLink = normalizeDeepLink(input.deepLink);
    var computedLink = input.link || buildLinkFromDeepLink(deepLink);
    var eventType = normalizeText(input.eventType || input.type || 'system') || 'system';

    var notif = {
      id: generateId(),
      userKey: normalizedUserKey,
      type: input.type || 'system',
      eventType: eventType,
      title: input.title || '',
      message: input.message || '',
      link: computedLink,
      deepLink: deepLink,
      metadata: toSafeObject(input.metadata),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    var list = getNotifications();
    list.unshift(notif);
    setNotifications(list);
    updateBadge();
    return notif;
  }

  function createEventNotification(eventType, input, userKey) {
    var safeInput = toSafeObject(input);
    var config = EVENT_DEFINITIONS[eventType] || null;
    var params = toSafeObject(safeInput.params);
    var metadata = toSafeObject(safeInput.metadata);
    var deepLink = null;

    if (safeInput.deepLink) {
      deepLink = safeInput.deepLink;
    } else if (config && typeof config.deepLink === 'function') {
      deepLink = config.deepLink(safeInput);
    }

    var type = safeInput.type || (config ? config.type : 'system') || 'system';
    var title = safeInput.title || '';
    var message = safeInput.message || '';

    if (!title && config && config.titleKey) {
      title = t(config.titleKey, params);
    }
    if (!message && config && config.messageKey) {
      message = t(config.messageKey, params);
    }

    metadata.eventType = eventType;
    if (safeInput.orderId && !metadata.orderId) metadata.orderId = safeInput.orderId;
    if (safeInput.postId && !metadata.postId) metadata.postId = safeInput.postId;

    return addNotification({
      userKey: userKey,
      type: type,
      eventType: eventType,
      title: title,
      message: message,
      deepLink: deepLink,
      link: safeInput.link || '',
      metadata: metadata
    });
  }

  function emitEvent(eventType, input) {
    var safeInput = toSafeObject(input);
    var recipients = [];

    if (safeInput.userKey) {
      recipients.push(safeInput.userKey);
    }

    if (Array.isArray(safeInput.userKeys)) {
      for (var i = 0; i < safeInput.userKeys.length; i++) {
        recipients.push(safeInput.userKeys[i]);
      }
    }

    var seen = {};
    var created = [];
    for (var j = 0; j < recipients.length; j++) {
      var normalized = normalizeEmail(recipients[j]);
      if (!normalized || seen[normalized]) continue;
      seen[normalized] = true;
      var notif = createEventNotification(eventType, safeInput, normalized);
      if (notif) created.push(notif);
    }

    return created;
  }

  function markAsRead(notificationId) {
    var list = getNotifications();
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === notificationId) {
        list[i].isRead = true;
        found = true;
        break;
      }
    }
    if (found) {
      setNotifications(list);
      updateBadge();
    }
    return found;
  }

  function markAllAsRead(userKey) {
    if (!userKey) return false;
    var list = getNotifications();
    var changed = false;
    for (var i = 0; i < list.length; i++) {
      if (list[i].userKey === userKey && !list[i].isRead) {
        list[i].isRead = true;
        changed = true;
      }
    }
    if (changed) {
      setNotifications(list);
      updateBadge();
    }
    return changed;
  }

  function deleteNotification(notificationId) {
    var list = getNotifications();
    var newList = list.filter(function (n) { return n.id !== notificationId; });
    if (newList.length === list.length) return false;
    setNotifications(newList);
    updateBadge();
    return true;
  }

  function deleteAllRead(userKey) {
    if (!userKey) return false;
    var list = getNotifications();
    var newList = list.filter(function (n) {
      return !(n.userKey === userKey && n.isRead);
    });
    setNotifications(newList);
    updateBadge();
    return true;
  }

  function getUnreadCount(userKey) {
    if (!userKey) return 0;
    var list = getNotifications();
    var count = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].userKey === userKey && !list[i].isRead) count++;
    }
    return count;
  }

  /* ===========================
     UI: BELL ICON + BADGE
     =========================== */

  function injectBellIcon() {
    var header = document.querySelector('.site-header .container');
    if (!header) return;

    var cta = header.querySelector('.site-header__cta');
    if (!cta) return;

    // Avoid duplicate injection
    if (header.querySelector('.notif-bell')) return;

    var bellWrap = document.createElement('div');
    bellWrap.className = 'notif-bell';
    bellWrap.innerHTML =
      '<button class="notif-bell__btn" id="notifBellBtn" aria-label="' + escapeHtml(t('notif.bell_label')) + '" title="' + escapeHtml(t('notif.bell_label')) + '">' +
        '<svg class="notif-bell__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
          '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
        '</svg>' +
        '<span class="notif-bell__badge" id="notifBadge" style="display:none;">0</span>' +
      '</button>' +
      '<div class="notif-panel" id="notifPanel" style="display:none;"></div>';

    cta.insertBefore(bellWrap, cta.firstChild);

    // Bell click handler
    var bellBtn = document.getElementById('notifBellBtn');
    if (bellBtn) {
      bellBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePanel();
      });
    }

    // Close panel on outside click
    document.addEventListener('click', function (e) {
      var bell = document.querySelector('.notif-bell');
      if (panelOpen && bell && !bell.contains(e.target)) {
        closePanel();
      }
    });
  }

  function updateBadge() {
    var badge = document.getElementById('notifBadge');
    if (!badge) return;

    var userKey = getCurrentUserKey();
    var count = getUnreadCount(userKey);

    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  /* ===========================
     UI: NOTIFICATION PANEL
     =========================== */

  function togglePanel() {
    panelOpen = !panelOpen;
    var panel = document.getElementById('notifPanel');
    if (panelOpen) {
      renderPanel();
      if (panel) panel.style.display = '';
    } else {
      closePanel();
    }
  }

  function closePanel() {
    panelOpen = false;
    var panel = document.getElementById('notifPanel');
    if (panel) panel.style.display = 'none';
  }

  function getTypeIcon(type) {
    switch (type) {
      case 'order_success': return '🛒';
      case 'order_status_change': return '📦';
      case 'review_reminder': return '⭐';
      case 'new_review': return '💬';
      case 'post_status_change': return '📋';
      case 'system': return '🔔';
      default: return '🔔';
    }
  }

  function resolveNavigationLink(notification) {
    if (!notification) return '';
    if (notification.deepLink) {
      var built = buildLinkFromDeepLink(notification.deepLink);
      if (built) return built;
    }
    return notification.link || '';
  }

  function renderPanel() {
    var panel = document.getElementById('notifPanel');
    if (!panel) return;

    var userKey = getCurrentUserKey();
    var notifications = userKey ? getNotificationsByUser(userKey) : [];

    // Sort newest first
    notifications.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    var html =
      '<div class="notif-panel__header">' +
        '<h3 class="notif-panel__title">' + t('notif.title') + '</h3>' +
        (notifications.length > 0
          ? '<button class="notif-panel__mark-all" id="notifMarkAllRead">' + t('notif.read_all') + '</button>'
          : '') +
      '</div>';

    if (!userKey) {
      html +=
        '<div class="notif-panel__empty">' +
          '<div class="notif-panel__empty-icon">🔔</div>' +
          '<p>' + t('notif.login_to_view') + '</p>' +
        '</div>';
    } else if (notifications.length === 0) {
      html +=
        '<div class="notif-panel__empty">' +
          '<div class="notif-panel__empty-icon">🔔</div>' +
          '<p>' + t('notif.empty') + '</p>' +
        '</div>';
    } else {
      html += '<div class="notif-panel__list">';
      for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i];
        var typeIcon = getTypeIcon(n.type);
        var navigationLink = resolveNavigationLink(n);
        var hasLink = navigationLink ? ' data-link="' + escapeHtml(navigationLink) + '"' : '';
        html +=
          '<div class="notif-item' + (n.isRead ? '' : ' notif-item--unread') + '" data-notif-id="' + escapeHtml(n.id) + '"' + hasLink + '>' +
            '<div class="notif-item__icon">' + typeIcon + '</div>' +
            '<div class="notif-item__body">' +
              '<div class="notif-item__title">' + escapeHtml(n.title) + '</div>' +
              '<div class="notif-item__message">' + escapeHtml(n.message) + '</div>' +
              '<div class="notif-item__time">' + timeAgo(n.createdAt) + '</div>' +
            '</div>' +
            '<div class="notif-item__actions">' +
              (!n.isRead
                ? '<button class="notif-item__read-btn" data-read-id="' + escapeHtml(n.id) + '" title="' + t('notif.mark_read') + '">✓</button>'
                : '') +
              '<button class="notif-item__delete-btn" data-del-id="' + escapeHtml(n.id) + '" title="' + t('notif.delete') + '">✕</button>' +
            '</div>' +
          '</div>';
      }
      html += '</div>';
    }

    panel.innerHTML = html;
    bindPanelEvents();
  }

  function bindPanelEvents() {
    // Mark all as read
    var markAllBtn = document.getElementById('notifMarkAllRead');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var userKey = getCurrentUserKey();
        if (userKey) {
          markAllAsRead(userKey);
          renderPanel();
          if (typeof Toast !== 'undefined') {
            Toast.show({ message: t('notif.all_read'), type: 'success' });
          }
        }
      });
    }

    // Individual mark as read
    var readBtns = document.querySelectorAll('[data-read-id]');
    for (var i = 0; i < readBtns.length; i++) {
      readBtns[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var id = this.getAttribute('data-read-id');
        markAsRead(id);
        renderPanel();
      });
    }

    // Individual delete
    var delBtns = document.querySelectorAll('[data-del-id]');
    for (var j = 0; j < delBtns.length; j++) {
      delBtns[j].addEventListener('click', function (e) {
        e.stopPropagation();
        var id = this.getAttribute('data-del-id');
        deleteNotification(id);
        renderPanel();
        if (typeof Toast !== 'undefined') {
          Toast.show({ message: t('notif.deleted'), type: 'info' });
        }
      });
    }

    // Click on notification item to navigate
    var items = document.querySelectorAll('.notif-item[data-notif-id]');
    for (var k = 0; k < items.length; k++) {
      items[k].addEventListener('click', function (e) {
        // Don't navigate if clicking action buttons
        var clicked = e.target;
        if (clicked.hasAttribute('data-read-id') || clicked.hasAttribute('data-del-id')) return;
        if (clicked.parentNode && (clicked.parentNode.hasAttribute('data-read-id') || clicked.parentNode.hasAttribute('data-del-id'))) return;

        var notifId = this.getAttribute('data-notif-id');
        var link = this.getAttribute('data-link');

        // Mark as read
        markAsRead(notifId);
        updateBadge();

        // Navigate if link exists
        if (link) {
          var path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
          if (path.indexOf('/pages/') === -1 && link.indexOf('./') === 0) {
            window.location.href = './pages/' + link.substring(2);
          } else {
            window.location.href = link;
          }
        } else {
          renderPanel();
        }
      });
    }
  }

  /* ===========================
     INIT
     =========================== */

  function init() {
    injectBellIcon();
    updateBadge();

    document.addEventListener('autoluxe:locale-changed', function () {
      var bellBtn = document.getElementById('notifBellBtn');
      if (bellBtn) {
        var label = t('notif.bell_label');
        bellBtn.setAttribute('aria-label', label);
        bellBtn.setAttribute('title', label);
      }
      if (panelOpen) {
        renderPanel();
      }
    });
  }

  return {
    getNotifications: getNotifications,
    getNotificationsByUser: getNotificationsByUser,
    addNotification: addNotification,
    emitEvent: emitEvent,
    markAsRead: markAsRead,
    markAllAsRead: markAllAsRead,
    deleteNotification: deleteNotification,
    deleteAllRead: deleteAllRead,
    getUnreadCount: getUnreadCount,
    updateBadge: updateBadge,
    init: init
  };
})();

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  Notifications.init();
});
