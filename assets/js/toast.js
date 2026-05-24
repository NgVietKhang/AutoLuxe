/* =============================================
   TOAST.JS - AutoLuxe Supercar Web
   Standardized toast notification helper (Phase 10)
   ============================================= */

var Toast = (function () {
  'use strict';

  var DEFAULT_DURATION = 3000;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  /**
   * Show a toast notification.
   * Usage:
   *   Toast.show({ type: 'success', message: 'Done!', duration: 3000 })
   *   Toast.show('Done!', 'success')   // backward-compatible shorthand
   *
   * @param {Object|string} opts
   * @param {string} [legacyType]
   */
  function show(opts, legacyType) {
    var message, type, duration;

    if (typeof opts === 'object' && opts !== null) {
      message = opts.message || '';
      type = opts.type || 'success';
      duration = opts.duration || DEFAULT_DURATION;
    } else {
      message = String(opts || '');
      type = legacyType || 'success';
      duration = DEFAULT_DURATION;
    }

    // Remove any existing toast
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    // Icon map
    var iconMap = { success: '✓', error: '✕', info: 'ℹ' };
    var icon = iconMap[type] || 'ℹ';

    // Build element
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.innerHTML =
      '<span class="toast__icon">' + icon + '</span>' +
      '<span class="toast__msg">' + escapeHtml(message) + '</span>';
    document.body.appendChild(toast);

    // Trigger show animation
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    // Auto-hide
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, duration);
  }

  return { show: show };
})();
