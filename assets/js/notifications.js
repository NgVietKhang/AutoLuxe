/* =============================================
   NOTIFICATIONS.JS - AutoLuxe Supercar Web
   Notification center: data layer + header bell + panel (Phase 10)
   ============================================= */

var Notifications = (function () {
  'use strict';

  var KEY = 'autoluxe_notifications';
  var panelOpen = false;

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

  function getCurrentUserKey() {
    try {
      var session = Auth.getSession();
      return session ? session.email : null;
    } catch (e) {
      return null;
    }
  }

  function timeAgo(isoStr) {
    if (!isoStr) return '';
    try {
      var now = Date.now();
      var then = new Date(isoStr).getTime();
      if (isNaN(then)) return '';
      var diff = Math.floor((now - then) / 1000);
      if (diff < 60) return 'Vừa xong';
      if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
      if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
      if (diff < 2592000) return Math.floor(diff / 86400) + ' ngày trước';
      return Math.floor(diff / 2592000) + ' tháng trước';
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
      return Array.isArray(data) ? data : [];
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
   *   input.type {string} - 'order_success' | 'new_review' | 'post_status_change' | 'system'
   *   input.title {string}
   *   input.message {string}
   *   input.link {string} optional
   *   input.metadata {Object} optional
   * @returns {Object|null} the created notification
   */
  function addNotification(input) {
    if (!input || !input.userKey) return null;

    var notif = {
      id: generateId(),
      userKey: input.userKey,
      type: input.type || 'system',
      title: input.title || '',
      message: input.message || '',
      link: input.link || '',
      metadata: input.metadata || {},
      isRead: false,
      createdAt: new Date().toISOString()
    };

    var list = getNotifications();
    list.unshift(notif);
    setNotifications(list);
    updateBadge();
    return notif;
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
      '<button class="notif-bell__btn" id="notifBellBtn" aria-label="Thông báo" title="Thông báo">' +
        '<svg class="notif-bell__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
          '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
        '</svg>' +
        '<span class="notif-bell__badge" id="notifBadge" style="display:none;">0</span>' +
      '</button>' +
      '<div class="notif-panel" id="notifPanel" style="display:none;"></div>';

    header.insertBefore(bellWrap, cta);

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
      case 'new_review': return '💬';
      case 'post_status_change': return '📋';
      case 'system': return '🔔';
      default: return '🔔';
    }
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
        '<h3 class="notif-panel__title">Thông báo</h3>' +
        (notifications.length > 0
          ? '<button class="notif-panel__mark-all" id="notifMarkAllRead">Đọc tất cả</button>'
          : '') +
      '</div>';

    if (!userKey) {
      html +=
        '<div class="notif-panel__empty">' +
          '<div class="notif-panel__empty-icon">🔔</div>' +
          '<p>Đăng nhập để xem thông báo</p>' +
        '</div>';
    } else if (notifications.length === 0) {
      html +=
        '<div class="notif-panel__empty">' +
          '<div class="notif-panel__empty-icon">🔔</div>' +
          '<p>Chưa có thông báo nào</p>' +
        '</div>';
    } else {
      html += '<div class="notif-panel__list">';
      for (var i = 0; i < notifications.length; i++) {
        var n = notifications[i];
        var typeIcon = getTypeIcon(n.type);
        var hasLink = n.link ? ' data-link="' + escapeHtml(n.link) + '"' : '';
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
                ? '<button class="notif-item__read-btn" data-read-id="' + escapeHtml(n.id) + '" title="Đánh dấu đã đọc">✓</button>'
                : '') +
              '<button class="notif-item__delete-btn" data-del-id="' + escapeHtml(n.id) + '" title="Xóa">✕</button>' +
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
            Toast.show({ message: 'Đã đánh dấu tất cả đã đọc', type: 'success' });
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
          Toast.show({ message: 'Đã xóa thông báo', type: 'info' });
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

        // Navigate if link exists (adjust path for root vs /pages/ context)
        if (link) {
          var isInPages = window.location.pathname.indexOf('/pages/') !== -1;
          var adjustedLink = link;
          // Links are stored relative to /pages/. Adjust if on root.
          if (!isInPages && link.indexOf('./') === 0) {
            adjustedLink = './pages/' + link.substring(2);
          }
          window.location.href = adjustedLink;
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
  }

  return {
    getNotifications: getNotifications,
    getNotificationsByUser: getNotificationsByUser,
    addNotification: addNotification,
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
