/* =============================================
   THEME.JS - AutoLuxe Supercar Web
   Dark/Light theme toggle, localStorage persistence
   ============================================= */

var Theme = (function () {
  'use strict';

  var STORAGE_KEY = 'autoluxe_theme';
  var DARK = 'dark';
  var LIGHT = 'light';

  function t(key) {
    return (typeof I18n !== 'undefined') ? I18n.t(key) : key;
  }

  /**
   * Get saved theme from localStorage, fallback to prefers-color-scheme, then default light.
   */
  function getSavedTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === DARK || saved === LIGHT) return saved;
    } catch (e) { /* localStorage unavailable */ }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK;
    }
    return LIGHT;
  }

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || getSavedTheme() || LIGHT;
  }

  /**
   * Apply theme to <html> element.
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* localStorage unavailable */ }
    updateAllToggleUI(theme);
  }

  /**
   * Toggle between light and dark.
   */
  function toggleTheme() {
    var current = getCurrentTheme();
    var next = current === DARK ? LIGHT : DARK;

    document.documentElement.classList.add('theme-transition');
    applyTheme(next);

    setTimeout(function () {
      document.documentElement.classList.remove('theme-transition');
    }, 350);
  }

  /**
   * Update a single toggle button UI to reflect current theme.
   */
  function updateToggleUI(btn, theme) {
    if (!btn) return;

    var iconEl = btn.querySelector('.theme-toggle__icon');
    var labelEl = btn.querySelector('.theme-toggle__label');

    if (theme === DARK) {
      if (iconEl) iconEl.textContent = '☀️';
      if (labelEl) labelEl.textContent = t('theme.light');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', t('theme.switch_light'));
    } else {
      if (iconEl) iconEl.textContent = '🌙';
      if (labelEl) labelEl.textContent = t('theme.dark');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', t('theme.switch_dark'));
    }
  }

  /**
   * Update all theme toggle buttons on the page.
   */
  function updateAllToggleUI(theme) {
    var resolved = theme || getCurrentTheme();
    var buttons = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      updateToggleUI(buttons[i], resolved);
    }
  }

  function bindToggleButtons() {
    var buttons = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].getAttribute('data-theme-bound') === 'true') continue;
      buttons[i].setAttribute('data-theme-bound', 'true');
      buttons[i].addEventListener('click', toggleTheme);
    }
  }

  /**
   * Initialize theme system after DOM ready.
   */
  function init() {
    var theme = getSavedTheme();
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* ignore */ }
    updateAllToggleUI(theme);
    bindToggleButtons();
  }

  return {
    DARK: DARK,
    LIGHT: LIGHT,
    getSavedTheme: getSavedTheme,
    getCurrentTheme: getCurrentTheme,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    updateAllToggleUI: updateAllToggleUI,
    bindToggleButtons: bindToggleButtons,
    init: init
  };
})();

(function () {
  'use strict';

  function onReady() {
    Theme.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  document.addEventListener('autoluxe:locale-changed', function () {
    Theme.updateAllToggleUI();
  });
})();
