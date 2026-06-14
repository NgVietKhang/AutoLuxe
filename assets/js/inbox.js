/* =============================================
   INBOX.JS - AutoLuxe Phase 13
   ============================================= */

(function () {
  'use strict';

  var root = document.getElementById('inboxContent');
  if (!root || typeof MessagingService === 'undefined') return;

  var activeThreadId = null;

  init();

  function init() {
    var params = new URLSearchParams(window.location.search);
    activeThreadId = params.get('thread') || null;
    if (!Auth.getSession()) {
      renderLogin();
      return;
    }
    MessagingService.markThreadRead(activeThreadId);
    render();
    document.addEventListener('autoluxe:locale-changed', render);
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function renderLogin() {
    root.innerHTML = '<div class="inbox-empty"><h1>' + esc(_t('inbox.title')) + '</h1><p>' + esc(_t('inbox.login_required')) + '</p><a href="./auth.html" class="btn btn--primary">' + esc(_t('common.login')) + '</a></div>';
  }

  function render() {
    var threads = MessagingService.getMyThreads();
    document.title = _t('inbox.title') + ' - AutoLuxe';
    if (!threads.length) {
      root.innerHTML = '<h1 class="section-title">' + esc(_t('inbox.title')) + '</h1><p class="section-subtitle">' + esc(_t('inbox.empty')) + '</p>';
      return;
    }

    if (!activeThreadId) activeThreadId = threads[0].id;
    var active = MessagingService.getThread(activeThreadId) || threads[0];

    var html = '<div class="inbox-layout">';
    html += '<aside class="inbox-sidebar"><h2 class="inbox-sidebar__title">' + esc(_t('inbox.threads')) + '</h2><ul class="inbox-thread-list">';
    threads.forEach(function (t) {
      html += '<li><button type="button" class="inbox-thread-btn' + (t.id === active.id ? ' is-active' : '') + '" data-thread="' + esc(t.id) + '">' +
        esc(t.postTitle || t.postId) + '<span class="inbox-thread-meta">' + esc(formatTime(t.updatedAt)) + '</span></button></li>';
    });
    html += '</ul></aside>';
    html += '<section class="inbox-chat"><h3>' + esc(active.postTitle) + '</h3>';
    html += '<div class="inbox-messages" id="inboxMessages">';
    (active.messages || []).forEach(function (m) {
      html += '<div class="inbox-msg"><span class="inbox-msg__from">' + esc(m.from) + '</span><p>' + esc(m.body) + '</p><time>' + esc(formatTime(m.at)) + '</time></div>';
    });
    html += '</div>';
    html += '<form class="inbox-compose" id="inboxForm"><textarea class="input" id="inboxBody" rows="3" placeholder="' + esc(_t('inbox.placeholder')) + '" required></textarea>';
    html += '<button type="submit" class="btn btn--primary">' + esc(_t('inbox.send')) + '</button></form>';
    html += '</section></div>';
    root.innerHTML = html;

    root.querySelectorAll('[data-thread]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeThreadId = btn.getAttribute('data-thread');
        MessagingService.markThreadRead(activeThreadId);
        if (typeof MessagingService.clearUnread === 'function') {
          try {
            var s = Auth.getSession();
            if (s) MessagingService.clearUnread(s.email);
          } catch (e) { /* ignore */ }
        }
        render();
      });
    });

    var form = document.getElementById('inboxForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = document.getElementById('inboxBody').value;
      var result = MessagingService.sendMessage(active.id, body);
      if (result.ok) {
        document.getElementById('inboxBody').value = '';
        render();
      }
    });

    var msgBox = document.getElementById('inboxMessages');
    if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;
  }

  function formatTime(ts) {
    if (!ts) return '';
    try {
      return I18n.formatDateTime(new Date(ts).toISOString(), { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    } catch (e) {
      return '';
    }
  }
})();
