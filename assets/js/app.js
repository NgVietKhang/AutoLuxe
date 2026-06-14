/* =============================================
   APP.JS - AutoLuxe Supercar Web
   Shared: nav, purchases link inject, motion engine
   ============================================= */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  try {
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!window.gsap) {
        root.classList.add('anim-ready');
      }
    }
  } catch (e) { /* ignore */ }

  var prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasGSAP = !!window.gsap;

  function ready(fn) {
    if (doc.readyState !== 'loading') {
      fn();
    } else {
      doc.addEventListener('DOMContentLoaded', fn);
    }
  }

  function isInPagesDir() {
    return window.location.pathname.indexOf('/pages/') !== -1;
  }

  function getPurchasesHref() {
    return isInPagesDir() ? './my-purchases.html' : './pages/my-purchases.html';
  }

  function getNavBase() {
    return isInPagesDir() ? './' : './pages/';
  }

  function updateNavBadge(link, count) {
    if (!link) return;
    var badge = link.querySelector('.site-nav__badge');
    if (count > 0) {
      if (!badge) {
        badge = doc.createElement('span');
        badge.className = 'site-nav__badge';
        link.appendChild(badge);
      }
      badge.textContent = String(count > 99 ? '99+' : count);
    } else if (badge) {
      badge.remove();
    }
  }

  var LEGACY_NAV_SEGMENTS = ['brands', 'garage', 'inbox'];

  function getCompareCount() {
    if (typeof CompareService !== 'undefined' && typeof CompareService.count === 'function') {
      return CompareService.count();
    }
    try {
      if (typeof AutoLuxeData !== 'undefined') {
        return AutoLuxeData.list('compare').getAll().length;
      }
    } catch (e) { /* ignore */ }
    return 0;
  }

  function getWishlistCount() {
    if (typeof Wishlist !== 'undefined' && typeof Wishlist.getMyWishlist === 'function') {
      return Wishlist.getMyWishlist().length;
    }
    try {
      var session = typeof Auth !== 'undefined' ? Auth.getSession() : null;
      if (!session) return 0;
      var data = Storage.get('autoluxe_wishlist', []);
      if (!Array.isArray(data)) return 0;
      return data.filter(function (item) { return item.ownerId === session.userId; }).length;
    } catch (e) { /* ignore */ }
    return 0;
  }

  function injectNavLink(hrefFile, i18nKey, badgeCountFn) {
    var nav = doc.getElementById('siteNav');
    if (!nav) return null;
    var list = nav.querySelector('.site-nav__list');
    if (!list) return null;

    var existing = list.querySelector('a[href*="' + hrefFile.replace('.html', '') + '"]');
    if (existing) {
      if (typeof badgeCountFn === 'function') updateNavBadge(existing, badgeCountFn());
      return existing;
    }

    var li = doc.createElement('li');
    var link = doc.createElement('a');
    link.href = getNavBase() + hrefFile;
    link.className = 'site-nav__link';
    link.setAttribute('data-i18n', i18nKey);
    link.textContent = (typeof I18n !== 'undefined' && typeof I18n.t === 'function')
      ? I18n.t(i18nKey)
      : hrefFile;

    li.appendChild(link);
    var anchor = list.querySelector('a[href*="compare"]') ||
      list.querySelector('a[href*="wishlist"]') ||
      list.querySelector('a[href*="marketplace"]') ||
      list.querySelector('a[href*="my-purchases"]');
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertAdjacentElement('afterend', li);
    } else {
      list.appendChild(li);
    }

    if (typeof I18n !== 'undefined' && typeof I18n.applyTranslations === 'function') {
      I18n.applyTranslations(li);
    }
    if (typeof badgeCountFn === 'function') updateNavBadge(link, badgeCountFn());
    return link;
  }

  function removeLegacyNavLinks() {
    var nav = doc.getElementById('siteNav');
    if (!nav) return;
    var links = nav.querySelectorAll('.site-nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute('href') || '').toLowerCase();
      var remove = false;
      for (var j = 0; j < LEGACY_NAV_SEGMENTS.length; j++) {
        if (href.indexOf(LEGACY_NAV_SEGMENTS[j]) !== -1) {
          remove = true;
          break;
        }
      }
      if (remove && links[i].parentNode) {
        links[i].parentNode.remove();
      }
    }
  }

  function ensureWishlistNavLink() {
    var nav = doc.getElementById('siteNav');
    if (!nav) return null;
    var link = nav.querySelector('a[href*="wishlist"]');
    if (link) {
      updateNavBadge(link, getWishlistCount());
      return link;
    }
    return injectNavLink('wishlist.html', 'nav.wishlist', getWishlistCount);
  }

  function ensureCompareNavLink() {
    var nav = doc.getElementById('siteNav');
    if (!nav) return null;
    var link = nav.querySelector('a[href*="compare"]');
    if (link) {
      updateNavBadge(link, getCompareCount());
      return link;
    }
    return injectNavLink('compare.html', 'nav.compare', getCompareCount);
  }

  function refreshNavBadges() {
    ensureWishlistNavLink();
    ensureCompareNavLink();
  }

  function normalizeSiteNav() {
    removeLegacyNavLinks();
    ensureWishlistNavLink();
    ensureCompareNavLink();
    injectPurchasesNavLink();
    refreshNavBadges();
  }

  function injectPhase8NavLinks() {
    normalizeSiteNav();
  }

  function hasPurchasesNavLink(nav) {
    var links = nav.querySelectorAll('.site-nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute('href') || '').toLowerCase();
      if (href.indexOf('my-purchases') !== -1) return true;
    }
    return false;
  }

  /* === Inject "Đơn mua của tôi" on every page navbar === */
  function injectPurchasesNavLink() {
    var nav = doc.getElementById('siteNav');
    if (!nav) return;

    var list = nav.querySelector('.site-nav__list');
    if (!list || hasPurchasesNavLink(nav)) return;

    var li = doc.createElement('li');
    var link = doc.createElement('a');
    link.href = getPurchasesHref();
    link.className = 'site-nav__link';
    link.setAttribute('data-i18n', 'nav.my_purchases');
    link.textContent = (typeof I18n !== 'undefined' && typeof I18n.t === 'function')
      ? I18n.t('nav.my_purchases')
      : 'Đơn mua của tôi';

    li.appendChild(link);

    var anchor = list.querySelector('a[href*="my-purchases"]') ||
      list.querySelector('a[href*="compare"]') ||
      list.querySelector('a[href*="wishlist"]') ||
      list.querySelector('a[href*="marketplace"]');
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertAdjacentElement('afterend', li);
    } else {
      list.appendChild(li);
    }

    if (typeof I18n !== 'undefined' && typeof I18n.applyTranslations === 'function') {
      I18n.applyTranslations(li);
    }
  }

  /* === Highlight active nav link for current page === */
  function syncActiveNavLink() {
    var nav = doc.getElementById('siteNav');
    if (!nav) return;

    var currentFile = '';
    try {
      var parts = window.location.pathname.split('/');
      currentFile = (parts[parts.length - 1] || 'index.html').split('#')[0].split('?')[0];
    } catch (e) {
      currentFile = '';
    }

    if (!currentFile) currentFile = 'index.html';

    var catalogAliases = { 'brands.html': true };

    var links = nav.querySelectorAll('.site-nav__link');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href') || '';
      var linkFile = href.split('/').pop().split('#')[0].split('?')[0];
      var isActive = linkFile === currentFile;

      if (!isActive && catalogAliases[currentFile] && linkFile === 'catalog.html') {
        isActive = true;
      }

      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  function initNav() {
    injectPhase8NavLinks();
    syncActiveNavLink();
  }

  doc.addEventListener('autoluxe:locale-changed', function () {
    injectPhase8NavLinks();
    syncActiveNavLink();
  });

  doc.addEventListener('autoluxe:compare-changed', refreshNavBadges);
  doc.addEventListener('autoluxe:wishlist-changed', refreshNavBadges);
  doc.addEventListener('autoluxe:data-changed', function (e) {
    if (e.detail && (e.detail.collection === 'compare' || e.detail.collection === 'wishlist')) {
      refreshNavBadges();
    }
  });

  /* === Nav Toggle (mobile menu) === */
  var navToggle = doc.getElementById('navToggle');
  var siteNav = doc.getElementById('siteNav');

  /* === Header scroll state === */
  var siteHeader = doc.querySelector('.site-header');
  if (siteHeader) {
    var headerTicking = false;
    var isHomePage = !!doc.getElementById('heroStage');
    var updateHeader = function () {
      var y = window.pageYOffset || root.scrollTop || 0;
      var threshold = 40;
      if (isHomePage && typeof window.AutoLuxeHeroScrollEnd === 'function') {
        threshold = window.AutoLuxeHeroScrollEnd();
      }
      siteHeader.classList.toggle('is-scrolled', y > threshold);
      if (isHomePage) {
        siteHeader.classList.toggle('is-hero-top', y <= threshold);
      }
      headerTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!headerTicking) {
        headerTicking = true;
        window.requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    updateHeader();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    siteNav.addEventListener('click', function (e) {
      if (e.target.classList.contains('site-nav__link')) {
        siteNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ===========================
     MOTION ENGINE (vanilla, non-GSAP pages)
     =========================== */
  var canHover = !(window.matchMedia && window.matchMedia('(hover: none)').matches);
  var revealObserver = null;
  var observedReveals = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;

  function ensureAnimReady() {
    if (prefersReduced) {
      root.classList.remove('anim-ready');
      return false;
    }
    if (!root.classList.contains('anim-ready')) {
      root.classList.add('anim-ready');
    }
    return true;
  }

  function initPageEnter() {
    if (prefersReduced) return;

    var main = doc.querySelector('.site-main');
    if (!main) return;

    main.classList.add('page-enter');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        main.classList.add('page-enter--active');
      });
    });
  }

  function markRevealTargets() {
    var selectors = [
      '.section-title',
      '.section-subtitle',
      '.divider',
      '.card',
      '.why__card',
      '.brand-strip__item',
      '.testimonial',
      '.purchase-card',
      '.account-listing-card',
      '.admin-post-card',
      '.admin-order-card',
      '.account-gate',
      '.purchases-header',
      '.purchases-toolbar',
      '.auth-container',
      '.catalog-grid > *',
      '.market-grid > *',
      '.marketplace-grid > *',
      '.wishlist-grid > *',
      '.brand-card',
      '.detail-hero',
      '.detail-specs',
      '.detail-related__card',
      '.checkout-step',
      '.admin-panel',
      '.qa-card'
    ];

    var seen = new Set();
    for (var s = 0; s < selectors.length; s++) {
      var nodes = doc.querySelectorAll(selectors[s]);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (el.hasAttribute('data-reveal') || seen.has(el)) continue;
        if (el.closest('.hero')) continue;
        seen.add(el);
        el.setAttribute('data-reveal', '');
      }
    }
  }

  function getRevealObserver() {
    if (revealObserver) return revealObserver;
    if (typeof IntersectionObserver === 'undefined') return null;
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.parentElement;
        if (parent) {
          var siblings = parent.querySelectorAll('[data-reveal]');
          for (var si = 0; si < siblings.length; si++) {
            if (siblings[si] === el) {
              el.style.setProperty('--reveal-i', String(si));
              break;
            }
          }
        }
        el.classList.add('is-revealed');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    return revealObserver;
  }

  function scanReveals() {
    markRevealTargets();

    var targets = doc.querySelectorAll('[data-reveal]:not(.is-revealed)');
    if (!targets.length) return;

    var obs = getRevealObserver();
    if (!obs) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-revealed');
      return;
    }

    for (var j = 0; j < targets.length; j++) {
      var t = targets[j];
      if (observedReveals) {
        if (observedReveals.has(t)) continue;
        observedReveals.add(t);
      }
      obs.observe(t);
    }
  }

  var revealMutationObs = null;
  var revealScanQueued = false;
  function scheduleRevealScan() {
    // Coalesce bursts of mutations into a single scan that still runs BEFORE
    // the next paint (microtask), so freshly-rendered cards are marked
    // hidden before they flash visible, then animate in cleanly.
    if (revealScanQueued) return;
    revealScanQueued = true;
    var run = function () { revealScanQueued = false; scanReveals(); };
    if (typeof Promise !== 'undefined') {
      Promise.resolve().then(run);
    } else {
      setTimeout(run, 0);
    }
  }

  function initScrollReveal() {
    if (prefersReduced) return;
    if (!ensureAnimReady()) return;

    scanReveals();

    if (!revealMutationObs && typeof MutationObserver !== 'undefined') {
      var mainEl = doc.querySelector('.site-main') || doc.body;
      revealMutationObs = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
            scheduleRevealScan();
            return;
          }
        }
      });
      revealMutationObs.observe(mainEl, { childList: true, subtree: true });
    }
  }

  /* ===========================
     INTERACTIVE FX: 3D tilt, magnetic, spotlight
     =========================== */
  function initInteractiveFX() {
    if (prefersReduced || !canHover) return;

    var TILT = '.card--tilt, .catalog-card, .market-card, .wishlist-card, .brand-card, .detail-related__card, [data-tilt]';
    var MAGNET = '[data-magnetic], .btn--lg';
    var SPOT = '[data-spotlight]';

    var tiltEl = null, tiltRect = null, tiltRaf = 0, tPX = 0, tPY = 0;
    var magEl = null, magRect = null, magRaf = 0, mX = 0, mY = 0;
    var spotEl = null, spotRect = null, spotRaf = 0, sMX = 50, sMY = 50;

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    function applyTilt() {
      tiltRaf = 0;
      if (!tiltEl) return;
      tiltEl.style.transform = 'perspective(1000px) rotateX(' + tPY.toFixed(2) + 'deg) rotateY(' + tPX.toFixed(2) + 'deg) scale(1.03)';
    }
    function resetTilt() {
      if (!tiltEl) return;
      var el = tiltEl; tiltEl = null; tiltRect = null;
      if (tiltRaf) { cancelAnimationFrame(tiltRaf); tiltRaf = 0; }
      el.classList.remove('is-tilting');
      el.style.transform = '';
    }
    function applyMagnet() {
      magRaf = 0;
      if (magEl) magEl.style.transform = 'translate(' + mX.toFixed(1) + 'px,' + (mY - 2).toFixed(1) + 'px)';
    }
    function resetMagnet() {
      if (!magEl) return;
      var el = magEl; magEl = null; magRect = null;
      if (magRaf) { cancelAnimationFrame(magRaf); magRaf = 0; }
      el.style.transform = '';
    }
    function applySpot() {
      spotRaf = 0;
      if (!spotEl) return;
      spotEl.style.setProperty('--mx', sMX.toFixed(1) + '%');
      spotEl.style.setProperty('--my', sMY.toFixed(1) + '%');
    }

    doc.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch' || !e.target || !e.target.closest) return;
      var t = e.target.closest(TILT);
      if (t && t !== tiltEl) {
        resetTilt();
        tiltEl = t; tiltRect = t.getBoundingClientRect();
        t.classList.add('is-tilting');
      }
      var m = e.target.closest(MAGNET);
      if (m && m !== magEl) { resetMagnet(); magEl = m; magRect = m.getBoundingClientRect(); }
      var s = e.target.closest(SPOT);
      if (s && s !== spotEl) { spotEl = s; spotRect = s.getBoundingClientRect(); }
    }, { passive: true });

    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      if (tiltEl) {
        if (!tiltRect) tiltRect = tiltEl.getBoundingClientRect();
        var x = clamp((e.clientX - tiltRect.left) / tiltRect.width, 0, 1);
        var y = clamp((e.clientY - tiltRect.top) / tiltRect.height, 0, 1);
        tPX = (x - 0.5) * 16;
        tPY = -(y - 0.5) * 16;
        if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
      }
      if (magEl) {
        if (!magRect) magRect = magEl.getBoundingClientRect();
        var cx = magRect.left + magRect.width / 2;
        var cy = magRect.top + magRect.height / 2;
        mX = clamp((e.clientX - cx) * 0.3, -12, 12);
        mY = clamp((e.clientY - cy) * 0.3, -12, 12);
        if (!magRaf) magRaf = requestAnimationFrame(applyMagnet);
      }
      if (spotEl) {
        if (!spotRect) spotRect = spotEl.getBoundingClientRect();
        sMX = ((e.clientX - spotRect.left) / spotRect.width) * 100;
        sMY = ((e.clientY - spotRect.top) / spotRect.height) * 100;
        if (!spotRaf) spotRaf = requestAnimationFrame(applySpot);
      }
    }, { passive: true });

    doc.addEventListener('pointerout', function (e) {
      var to = e.relatedTarget;
      if (tiltEl && (!to || !tiltEl.contains(to))) resetTilt();
      if (magEl && (!to || !magEl.contains(to))) resetMagnet();
      if (spotEl && (!to || !spotEl.contains(to))) spotEl = null;
    }, { passive: true });

    window.addEventListener('scroll', function () {
      if (tiltEl) tiltRect = null;
      if (magEl) magRect = null;
      if (spotEl) spotRect = null;
    }, { passive: true });
  }

  /* === Ripple on buttons === */
  function initRipple() {
    if (prefersReduced) return;
    doc.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (!e.target || !e.target.closest) return;
      var btn = e.target.closest('.btn, [data-ripple]');
      if (!btn || btn.disabled || btn.classList.contains('is-disabled')) return;
      var rect = btn.getBoundingClientRect();
      if (!rect.width) return;
      var size = Math.max(rect.width, rect.height);
      var span = doc.createElement('span');
      span.className = 'al-ripple';
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - rect.left - size / 2) + 'px';
      span.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(span);
      var done = function () { if (span.parentNode) span.parentNode.removeChild(span); };
      span.addEventListener('animationend', done);
      setTimeout(done, 800);
    }, { passive: true });
  }

  /* === Parallax for tagged decorative layers === */
  function initParallax() {
    if (prefersReduced) return;
    var els = doc.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    var ticking = false;

    function update() {
      ticking = false;
      var vh = window.innerHeight || root.clientHeight;
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.18;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) * -speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* === Generic count-up (non-home; excludes home .stats__num) === */
  function formatCountValue(value, decimals) {
    if (window.I18n && typeof I18n.formatNumber === 'function') {
      try { return I18n.formatNumber(value, { maximumFractionDigits: decimals || 0 }); } catch (e) { /* fall through */ }
    }
    return decimals ? value.toFixed(decimals) : String(Math.round(value));
  }

  function initCountUp() {
    var els = doc.querySelectorAll('[data-count-to]:not(.stats__num)');
    if (!els.length) return;

    function run(el) {
      if (el.classList.contains('is-counted')) return;
      var target = parseFloat(el.getAttribute('data-count-to')) || 0;
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-count-decimals'), 10) || 0;
      if (prefersReduced) {
        el.textContent = prefix + formatCountValue(target, decimals) + suffix;
        el.classList.add('is-counted');
        return;
      }
      var dur = 1400, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + formatCountValue(target * eased, decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else { el.textContent = prefix + formatCountValue(target, decimals) + suffix; el.classList.add('is-counted'); }
      }
      requestAnimationFrame(step);
    }

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      for (var i = 0; i < els.length; i++) run(els[i]);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* === Page-transition curtain on internal navigation === */
  function getPageTransition() {
    return doc.getElementById('alPageTransition');
  }

  function isHomeDestination(href) {
    try {
      var url = new URL(href, window.location.href);
      var path = url.pathname.replace(/\/+$/, '') || '/';
      var file = path.split('/').pop() || '';
      return file === '' || file === 'index.html';
    } catch (e) {
      return false;
    }
  }

  function ensureHomePreloadUI(overlay) {
    var inner = overlay.querySelector('.al-page-transition__inner');
    if (!inner) return;
    if (doc.getElementById('alPageTransitionProgress')) return;
    var progress = doc.createElement('p');
    progress.className = 'al-page-transition__progress';
    progress.id = 'alPageTransitionProgress';
    progress.setAttribute('aria-live', 'polite');
    progress.textContent = '0%';
    var barWrap = doc.createElement('div');
    barWrap.className = 'al-page-transition__bar';
    barWrap.setAttribute('role', 'progressbar');
    barWrap.setAttribute('aria-valuemin', '0');
    barWrap.setAttribute('aria-valuemax', '100');
    barWrap.setAttribute('aria-valuenow', '0');
    barWrap.setAttribute('aria-labelledby', 'alPageTransitionProgress');
    var barFill = doc.createElement('span');
    barFill.className = 'al-page-transition__bar-fill';
    barFill.id = 'alPageTransitionBar';
    barWrap.appendChild(barFill);
    inner.appendChild(progress);
    inner.appendChild(barWrap);
  }

  function resetHomePreloadUI() {
    var progress = doc.getElementById('alPageTransitionProgress');
    var bar = doc.getElementById('alPageTransitionBar');
    var barWrap = bar ? bar.parentElement : null;
    if (progress) progress.textContent = '0%';
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;
      bar.style.transition = '';
    }
    if (barWrap) barWrap.setAttribute('aria-valuenow', '0');
  }

  function initPageTransition() {
    if (prefersReduced) return;

    var overlay = getPageTransition();
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.className = 'al-page-transition';
      overlay.id = 'alPageTransition';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<div class="al-page-transition__inner"><span class="al-page-transition__brand">Auto<span>Luxe</span></span></div>';
      doc.body.appendChild(overlay);
    }

    function isInternalNav(a) {
      if (!a) return false;
      if (a.target && a.target !== '' && a.target !== '_self') return false;
      if (a.hasAttribute('download')) return false;
      if (a.hasAttribute('data-no-transition') || a.hasAttribute('data-quickview')) return false;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return false;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
      try {
        var url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return false;
        return true;
      } catch (e) { return false; }
    }

    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!e.target || !e.target.closest) return;
      var a = e.target.closest('a[href]');
      if (!isInternalNav(a)) return;
      e.preventDefault();
      var dest = a.href;
      var goingHome = isHomeDestination(dest);

      if (goingHome) {
        overlay.classList.add('is-home-preload');
        ensureHomePreloadUI(overlay);
        resetHomePreloadUI();
        root.classList.add('is-loading');
        try {
          sessionStorage.setItem('autoluxe_home_preload', '1');
        } catch (err) { /* ignore */ }
      } else {
        overlay.classList.remove('is-home-preload');
      }

      overlay.classList.add('is-active');
      setTimeout(function () { window.location.href = dest; }, 430);
    });

    window.addEventListener('pageshow', function (e) {
      if (e.persisted) overlay.classList.remove('is-active');
    });
  }

  /* === Scroll progress + back-to-top (off-home only; home.js drives them) === */
  function initScrollUtils() {
    if (doc.getElementById('heroStage')) return;

    var progress = doc.querySelector('.scroll-progress');
    if (!progress) {
      progress = doc.createElement('div');
      progress.className = 'scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      progress.innerHTML = '<span class="scroll-progress__bar"></span>';
      doc.body.insertBefore(progress, doc.body.firstChild);
    }
    var bar = progress.querySelector('.scroll-progress__bar');

    var btn = doc.getElementById('backToTop');
    if (!btn) {
      btn = doc.createElement('button');
      btn.id = 'backToTop';
      btn.className = 'back-to-top';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Top');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
      doc.body.appendChild(btn);
    }
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    var ticking = false;
    function update() {
      ticking = false;
      var max = root.scrollHeight - root.clientHeight;
      var y = window.pageYOffset || root.scrollTop || 0;
      if (bar) bar.style.width = (max > 0 ? Math.max(0, Math.min(1, y / max)) * 100 : 0).toFixed(2) + '%';
      btn.classList.toggle('is-visible', y > 500);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function isLiteFxActive() {
    if (prefersReduced) return true;
    if (typeof MotionPrefs !== 'undefined' && typeof MotionPrefs.isLiteFxEnabled === 'function') {
      return MotionPrefs.isLiteFxEnabled();
    }
    return root.getAttribute('data-fx-lite') === 'on';
  }

  function initMotion() {
    var gsapActive = !!window.gsap;
    var liteFx = isLiteFxActive();
    ensureAnimReady();

    if (!gsapActive) {
      initPageEnter();
      initScrollReveal();
    }

    if (!liteFx) {
      initInteractiveFX();
      initRipple();
      initParallax();
    }
    initCountUp();
    initPageTransition();
    initScrollUtils();
  }

  function updateTabStripIndicator(strip, activeTabBtn) {
    if (!strip || !activeTabBtn) return;
    strip.classList.add('tab-strip');
    var stripRect = strip.getBoundingClientRect();
    var btnRect = activeTabBtn.getBoundingClientRect();
    var left = btnRect.left - stripRect.left + strip.scrollLeft;
    strip.style.setProperty('--tab-indicator-left', left + 'px');
    strip.style.setProperty('--tab-indicator-width', btnRect.width + 'px');
  }

  /* === Shared tab panel helper (account, admin, etc.) === */
  function animateTabPanel(panel) {
    if (!panel || prefersReduced) return;
    panel.classList.remove('tab-panel--enter');
    void panel.offsetWidth;
    panel.classList.add('tab-panel--enter');
    panel.addEventListener('animationend', function onEnd(e) {
      if (e.animationName !== 'tabPanelEnter') return;
      panel.classList.remove('tab-panel--enter');
      panel.removeEventListener('animationend', onEnd);
    });
  }

  window.AutoLuxeMotion = {
    prefersReduced: prefersReduced,
    hasGSAP: hasGSAP,
    canHover: canHover,
    initScrollReveal: initScrollReveal,
    scanReveals: function () { if (!prefersReduced) scanReveals(); },
    animateTabPanel: animateTabPanel,
    updateTabStripIndicator: updateTabStripIndicator,
    pulseList: function (el) {
      if (!el || prefersReduced) return;
      el.classList.remove('list-surface--refresh');
      void el.offsetWidth;
      el.classList.add('list-surface--refresh');
    }
  };

  function loadScript(src, onDone) {
    var script = doc.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onDone;
    script.onerror = onDone;
    doc.body.appendChild(script);
  }

  function initContactWidget() {
    if (typeof window.AutoLuxeContact !== 'undefined') return;
    var base = isInPagesDir() ? '../assets/js/' : 'assets/js/';
    loadScript(base + 'config.local.js', function () {
      loadScript(base + 'contact-widget.js');
    });
  }

  ready(function () {
    if (typeof MotionPrefs !== 'undefined' && typeof MotionPrefs.init === 'function') {
      MotionPrefs.init();
    }
    initNav();
    initContactWidget();
    initMotion();
  });
})();
