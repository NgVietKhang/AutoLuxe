/* =============================================
   CONFIRM-DIALOG.JS - AutoLuxe Supercar Web
   Reusable confirmation modal (replaces window.confirm)
   ============================================= */

var ConfirmDialog = (function () {
  'use strict';

  var root = null;
  var panel = null;
  var titleEl = null;
  var messageEl = null;
  var btnCancel = null;
  var btnConfirm = null;
  var btnClose = null;
  var isOpen = false;
  var resolveFn = null;
  var previousFocus = null;
  var onKeyDown = null;

  function t(key, params) {
    if (typeof I18n !== 'undefined' && typeof I18n.t === 'function') {
      return I18n.t(key, params);
    }
    return key;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function ensureMounted() {
    if (root) return;

    root = document.createElement('div');
    root.id = 'confirmDialog';
    root.className = 'confirm-dialog';
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');

    root.innerHTML =
      '<div class="confirm-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="confirmDialogTitle">' +
        '<button type="button" class="confirm-dialog__close" data-confirm-close aria-label="' + escapeHtml(t('common.close')) + '">&times;</button>' +
        '<h2 id="confirmDialogTitle" class="confirm-dialog__title"></h2>' +
        '<p class="confirm-dialog__message"></p>' +
        '<div class="confirm-dialog__actions">' +
          '<button type="button" class="btn btn--secondary" data-confirm-cancel></button>' +
          '<button type="button" class="btn btn--primary" data-confirm-ok></button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(root);

    panel = root.querySelector('.confirm-dialog__panel');
    titleEl = root.querySelector('.confirm-dialog__title');
    messageEl = root.querySelector('.confirm-dialog__message');
    btnCancel = root.querySelector('[data-confirm-cancel]');
    btnConfirm = root.querySelector('[data-confirm-ok]');
    btnClose = root.querySelector('[data-confirm-close]');

    btnCancel.addEventListener('click', function () { close(false); });
    btnConfirm.addEventListener('click', function () { close(true); });
    btnClose.addEventListener('click', function () { close(false); });

    root.addEventListener('click', function (e) {
      if (e.target === root) close(false);
    });

    if (panel) {
      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  function bindEscape() {
    onKeyDown = function (e) {
      if (e.key === 'Escape') close(false);
    };
    document.addEventListener('keydown', onKeyDown);
  }

  function unbindEscape() {
    if (onKeyDown) {
      document.removeEventListener('keydown', onKeyDown);
      onKeyDown = null;
    }
  }

  function close(result) {
    if (!isOpen) return;

    isOpen = false;
    unbindEscape();

    if (root) {
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
    }

    var resolver = resolveFn;
    resolveFn = null;

    if (previousFocus && typeof previousFocus.focus === 'function') {
      try { previousFocus.focus(); } catch (e) { /* ignore */ }
    }
    previousFocus = null;

    if (resolver) resolver(!!result);
  }

  /**
   * Show a confirmation dialog.
   * @param {Object} opts
   * @param {string} opts.title
   * @param {string} opts.message
   * @param {string} [opts.confirmText]
   * @param {string} [opts.cancelText]
   * @param {string} [opts.confirmVariant] - 'danger' | 'primary'
   * @returns {Promise<boolean>}
   */
  function show(opts) {
    opts = opts || {};

    if (isOpen) {
      return Promise.resolve(false);
    }

    ensureMounted();

    var title = opts.title || '';
    var message = opts.message || '';
    var confirmText = opts.confirmText || t('common.confirm');
    var cancelText = opts.cancelText || t('common.cancel');
    var variant = opts.confirmVariant === 'danger' ? 'danger' : 'primary';

    titleEl.textContent = title;
    messageEl.textContent = message;
    btnCancel.textContent = cancelText;
    btnConfirm.textContent = confirmText;

    btnConfirm.className = 'btn ' + (variant === 'danger' ? 'btn--danger' : 'btn--primary');

    previousFocus = document.activeElement;
    isOpen = true;
    resolveFn = null;

    root.hidden = false;
    root.setAttribute('aria-hidden', 'false');
    bindEscape();

    requestAnimationFrame(function () {
      if (btnCancel) btnCancel.focus();
    });

    return new Promise(function (resolve) {
      resolveFn = resolve;
    });
  }

  return { show: show };
})();
