/* =============================================
   PAGE-BOOT.JS - AutoLuxe Supercar Web
   Synchronous early boot (theme, locale, motion)
   Must run in <head> before stylesheets.
   ============================================= */
(function () {
  'use strict';

  var root = document.documentElement;

  try {
    var theme = localStorage.getItem('autoluxe_theme');
    if (theme === 'dark' || theme === 'light') {
      root.setAttribute('data-theme', theme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  } catch (e) {
    root.setAttribute('data-theme', 'light');
  }

  try {
    var locale = localStorage.getItem('autoluxe_locale');
    if (locale === 'vi' || locale === 'en') {
      root.lang = locale;
    }
  } catch (e) { /* ignore */ }

  try {
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('anim-ready');
    }
  } catch (e) { /* ignore */ }

  try {
    var heroScroll = localStorage.getItem('autoluxe_hero_scroll');
    var liteFx = localStorage.getItem('autoluxe_lite_fx');
    root.setAttribute('data-hero-scroll', heroScroll === '0' ? 'off' : 'on');
    root.setAttribute('data-fx-lite', liteFx === '1' ? 'on' : 'off');
  } catch (e) { /* ignore */ }

  var path = (window.location.pathname || '').replace(/\/+$/, '');
  var file = path.split('/').pop() || '';
  var isHome = file === '' || file === 'index.html';

  if (isHome) {
    root.classList.add('is-loading');
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }
})();
