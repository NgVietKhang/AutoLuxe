/* =============================================
   APP.JS - AutoLuxe Supercar Web
   Shared initialization: nav toggle, utilities
   ============================================= */

(function () {
  'use strict';

  /* === Nav Toggle (mobile menu) === */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav when clicking a nav link
    siteNav.addEventListener('click', function (e) {
      if (e.target.classList.contains('site-nav__link')) {
        siteNav.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
