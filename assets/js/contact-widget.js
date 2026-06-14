/* =============================================
   CONTACT-WIDGET.JS - AutoLuxe
   Floating consult widget (Zalo, Messenger, hotline)
   ============================================= */

(function () {
  'use strict';

  function getContactConfig() {
    var cfg = (window.AUTOLUXE_CONFIG && window.AUTOLUXE_CONFIG.contact) || {};
    if (cfg.enabled === false) return null;
    return cfg;
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function t(key, fallback) {
    if (typeof I18n !== 'undefined' && typeof I18n.t === 'function') {
      return I18n.t(key);
    }
    return fallback || key;
  }

  function buildChannelRows(cfg, sellerEmail) {
    var rows = '';
    if (cfg.hotline) {
      var tel = String(cfg.hotline).replace(/\s+/g, '');
      rows += '<a class="contact-widget__channel" href="tel:' + esc(tel) + '" data-contact-channel="phone">' +
        '<span class="contact-widget__channel-icon" aria-hidden="true">📞</span>' +
        '<span><strong>' + esc(t('contact.hotline', 'Hotline')) + '</strong><br>' + esc(cfg.hotline) + '</span></a>';
    }
    if (cfg.zalo) {
      rows += '<a class="contact-widget__channel" href="' + esc(cfg.zalo) + '" target="_blank" rel="noopener noreferrer" data-contact-channel="zalo">' +
        '<span class="contact-widget__channel-icon contact-widget__channel-icon--zalo" aria-hidden="true">Z</span>' +
        '<span><strong>' + esc(t('contact.zalo', 'Zalo')) + '</strong><br>' + esc(t('contact.zalo_hint', 'Chat tư vấn nhanh')) + '</span></a>';
    }
    if (cfg.messenger) {
      rows += '<a class="contact-widget__channel" href="' + esc(cfg.messenger) + '" target="_blank" rel="noopener noreferrer" data-contact-channel="messenger">' +
        '<span class="contact-widget__channel-icon contact-widget__channel-icon--messenger" aria-hidden="true">M</span>' +
        '<span><strong>' + esc(t('contact.messenger', 'Messenger')) + '</strong><br>' + esc(t('contact.messenger_hint', 'Nhắn Facebook')) + '</span></a>';
    }
    if (cfg.whatsapp) {
      rows += '<a class="contact-widget__channel" href="' + esc(cfg.whatsapp) + '" target="_blank" rel="noopener noreferrer" data-contact-channel="whatsapp">' +
        '<span class="contact-widget__channel-icon" aria-hidden="true">W</span>' +
        '<span><strong>WhatsApp</strong></span></a>';
    }
    if (sellerEmail) {
      rows += '<p class="contact-widget__seller"><span>' + esc(t('contact.seller_email', 'Email người bán')) + ':</span> ' +
        '<a href="mailto:' + esc(sellerEmail) + '">' + esc(sellerEmail) + '</a></p>';
    }
    return rows;
  }

  function hasAnyChannel(cfg) {
    return !!(cfg.hotline || cfg.zalo || cfg.messenger || cfg.whatsapp);
  }

  var panelEl = null;
  var fabEl = null;

  function closePanel() {
    if (!panelEl) return;
    panelEl.classList.remove('is-open');
    panelEl.setAttribute('aria-hidden', 'true');
    if (fabEl) fabEl.setAttribute('aria-expanded', 'false');
  }

  function openPanel(sellerEmail) {
    if (!panelEl) return;
    var cfg = getContactConfig();
    if (!cfg || !hasAnyChannel(cfg)) {
      if (typeof Toast !== 'undefined') {
        Toast.show(t('contact.not_configured', 'Chưa cấu hình kênh liên hệ. Thêm thông tin trong config.local.js'), 'warning');
      }
      return;
    }
    var body = panelEl.querySelector('.contact-widget__channels');
    if (body) {
      body.innerHTML = buildChannelRows(cfg, sellerEmail || '');
    }
    panelEl.classList.add('is-open');
    panelEl.setAttribute('aria-hidden', 'false');
    if (fabEl) fabEl.setAttribute('aria-expanded', 'true');
  }

  function ensureStyles() {
    if (document.getElementById('contactWidgetStyles')) return;
    var link = document.createElement('link');
    link.id = 'contactWidgetStyles';
    link.rel = 'stylesheet';
    var base = window.location.pathname.indexOf('/pages/') !== -1 ? '../assets/css/contact-widget.css' : 'assets/css/contact-widget.css';
    link.href = base;
    document.head.appendChild(link);
  }

  function mountWidget() {
    var cfg = getContactConfig();
    if (!cfg) return;

    ensureStyles();

    var wrap = document.createElement('div');
    wrap.className = 'contact-widget';
    wrap.innerHTML =
      '<div class="contact-widget__panel" id="contactWidgetPanel" role="dialog" aria-labelledby="contactWidgetTitle" aria-hidden="true">' +
        '<div class="contact-widget__panel-head">' +
          '<h2 id="contactWidgetTitle" class="contact-widget__title">' + esc(t('contact.title', 'Tư vấn mua xe')) + '</h2>' +
          '<button type="button" class="contact-widget__close" id="contactWidgetClose" aria-label="' + esc(t('common.close', 'Đóng')) + '">&times;</button>' +
        '</div>' +
        (cfg.hours ? '<p class="contact-widget__hours">' + esc(t('contact.hours', 'Giờ tư vấn')) + ': ' + esc(cfg.hours) + '</p>' : '') +
        '<div class="contact-widget__channels"></div>' +
      '</div>' +
      '<button type="button" class="contact-widget__fab" id="contactWidgetFab" aria-expanded="false" aria-controls="contactWidgetPanel">' +
        '<span class="contact-widget__fab-icon" aria-hidden="true">💬</span>' +
        '<span class="contact-widget__fab-label">' + esc(t('contact.fab_label', 'Tư vấn')) + '</span>' +
      '</button>';

    document.body.appendChild(wrap);
    panelEl = document.getElementById('contactWidgetPanel');
    fabEl = document.getElementById('contactWidgetFab');

    var channels = panelEl.querySelector('.contact-widget__channels');
    if (channels) channels.innerHTML = buildChannelRows(cfg, '');

    fabEl.addEventListener('click', function () {
      if (panelEl.classList.contains('is-open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    document.getElementById('contactWidgetClose').addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });

    document.addEventListener('click', function (e) {
      if (!panelEl.classList.contains('is-open')) return;
      if (e.target.closest('.contact-widget')) return;
      closePanel();
    });

    document.addEventListener('autoluxe:locale-changed', function () {
      if (channels) channels.innerHTML = buildChannelRows(cfg, '');
      var title = document.getElementById('contactWidgetTitle');
      if (title) title.textContent = t('contact.title', 'Tư vấn mua xe');
    });
  }

  window.AutoLuxeContact = {
    open: openPanel,
    close: closePanel,
    isConfigured: function () {
      var cfg = getContactConfig();
      return cfg && hasAnyChannel(cfg);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();
