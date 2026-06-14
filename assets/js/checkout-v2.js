/* =============================================
  CHECKOUT-V2.JS - AutoLuxe Supercar Web
  Checkout V2: 2-step flow, demo card payment, guest/local persistence
  ============================================= */

var Checkout = (function () {
  'use strict';

  var KEYS = {
    orders: 'autoluxe_orders',
    guestId: 'autoluxe_guest_id'
  };

  var CANCEL_WINDOW_DAYS = 7;
  var GATEWAY_FAIL_RATE = 0.35;

  var CARD_RULES = {
    visa: {
      lengths: [13, 16, 19],
      cvvLength: 3,
      prefixRegex: /^4/,
      detectRegex: /^4/
    },
    mastercard: {
      lengths: [16],
      cvvLength: 3,
      prefixRegex: /^(5[1-5]|2(?:2[2-9]|[3-6]\d|7[01]|720))/,
      detectRegex: /^(5[1-5]|2(?:2[2-9]|[3-6]\d|7[01]|720))/
    },
    jcb: {
      lengths: [16],
      cvvLength: 3,
      prefixRegex: /^35(2[89]|[3-8]\d)/,
      detectRegex: /^35(2[89]|[3-8]\d)/
    },
    amex: {
      lengths: [15],
      cvvLength: 4,
      prefixRegex: /^3[47]/,
      detectRegex: /^3[47]/
    }
  };

  var currentPost = null;
  var currentPostId = null;
  var currentStep = 1;
  var buyerDraft = null;
  var gatewayFailCount = 0;
  var isSubmitting = false;

  /* ===========================
     HELPERS
     =========================== */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function normalizeText(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  function normalizeEmail(value) {
    return normalizeText(value);
  }

  function formatPrice(price) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatCurrency === 'function') {
      return I18n.formatCurrency(price || 0);
    }
    if (!price && price !== 0) return '$0';
    return '$' + Number(price).toLocaleString('en-US');
  }

  function sanitizeDigits(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function formatCardNumberInput(value) {
    var digits = sanitizeDigits(value);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  function generateOrderId() {
    return 'ord_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function generateTransactionId() {
    return 'txn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function parseQueryPostId() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('postId') || null;
    } catch (e) {
      return null;
    }
  }

  function parseQueryGatewayMode() {
    try {
      var params = new URLSearchParams(window.location.search);
      var mode = normalizeText(params.get('gateway'));
      if (mode === 'success') return 'force_success';
      if (mode === 'fail') return 'force_fail';
      return 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function getSessionSafe() {
    try {
      return Auth.getSession();
    } catch (e) {
      return null;
    }
  }

  function getOrCreateGuestId() {
    try {
      var existing = localStorage.getItem(KEYS.guestId);
      if (existing) return existing;
      var created = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem(KEYS.guestId, created);
      return created;
    } catch (e) {
      return 'guest_fallback';
    }
  }

  function getPostAvailability(post) {
    if (!post) return 'available';

    var availability = normalizeText(post.availability);
    if (availability === 'available' || availability === 'pending_payment' || availability === 'sold') {
      return availability;
    }

    var legacyStatus = normalizeText(post.status);
    if (legacyStatus === 'pending') return 'pending_payment';
    if (legacyStatus === 'sold') return 'sold';
    return 'available';
  }

  function isBuyerPostOwner(post, buyerEmail) {
    if (!post) return false;

    var ownerEmail = normalizeEmail(post.ownerEmail);
    if (!ownerEmail) return false;

    var session = getSessionSafe();
    if (session && session.email && normalizeEmail(session.email) === ownerEmail) {
      return true;
    }

    if (buyerEmail && normalizeEmail(buyerEmail) === ownerEmail) {
      return true;
    }

    return false;
  }

  function isPostPurchasable(post, buyerEmail) {
    if (!post) return false;

    if (isBuyerPostOwner(post, buyerEmail)) return false;

    if (typeof Marketplace !== 'undefined' && typeof Marketplace.isPostPubliclyVisible === 'function') {
      if (!Marketplace.isPostPubliclyVisible(post)) return false;
    } else {
      var moderation = normalizeText(post.moderation);
      if (moderation && moderation !== 'approved') return false;
    }

    var availability = getPostAvailability(post);
    if (availability !== 'available') return false;

    var status = normalizeText(post.status);
    if (status === 'pending' || status === 'sold') return false;

    return true;
  }

  function getCardRule(cardType) {
    return CARD_RULES[normalizeText(cardType)] || null;
  }

  function detectCardType(numberDigits) {
    var digits = sanitizeDigits(numberDigits);
    if (!digits) return '';

    var types = Object.keys(CARD_RULES);
    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var rule = CARD_RULES[type];
      if (rule.detectRegex && rule.detectRegex.test(digits)) {
        return type;
      }
    }

    return '';
  }

  function formatCountdownDuration(ms) {
    if (ms <= 0) return _t('purchases.countdown_closed');

    var totalSeconds = Math.floor(ms / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;

    function pad(n) {
      return n < 10 ? '0' + n : String(n);
    }

    return _t('common.countdown_clock', {
      days: days,
      hh: pad(hours),
      mm: pad(mins),
      ss: pad(secs)
    });
  }

  /* ===========================
     VALIDATION
     =========================== */

  function validateFullName(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return _t('val.required_fullname');
    if (trimmed.length < 2) return _t('val.min_fullname');
    return null;
  }

  function validatePhone(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return _t('val.required_phone');
    var phoneRegex = /^(\+84|0)\d{8,10}$/;
    if (!phoneRegex.test(trimmed)) return _t('val.invalid_phone');
    return null;
  }

  function validateEmail(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return _t('val.required_email');
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return _t('val.invalid_email');
    return null;
  }

  function validateAddress(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return _t('val.required_address');
    if (trimmed.length < 5) return _t('val.min_address');
    return null;
  }

  function validateCardType(value) {
    var trimmed = normalizeText(value);
    if (!trimmed) return _t('val.required_card_type');
    if (!CARD_RULES[trimmed]) return _t('val.invalid_card_type');
    return null;
  }

  function validateCardHolder(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return _t('val.required_card_holder');
    if (trimmed.length < 2) return _t('val.min_card_holder');
    return null;
  }

  function validateCardNumber(cardType, value) {
    var digits = sanitizeDigits(value);
    if (!digits) return _t('val.required_card_number');

    var rule = getCardRule(cardType);
    if (!rule) return _t('val.invalid_card_type');

    if (rule.lengths.indexOf(digits.length) === -1) {
      return _t('val.invalid_card_number');
    }

    if (!rule.prefixRegex.test(digits)) {
      return _t('val.invalid_card_number');
    }

    var detected = detectCardType(digits);
    if (detected && detected !== normalizeText(cardType)) {
      return _t('val.card_type_mismatch');
    }

    return null;
  }

  function validateCardExpiry(value) {
    var raw = (value || '').trim();
    if (!raw) return _t('val.required_card_expiry');

    var match = raw.match(/^(\d{2})\/(\d{2}|\d{4})$/);
    if (!match) return _t('val.invalid_card_expiry');

    var month = parseInt(match[1], 10);
    var year = parseInt(match[2], 10);

    if (month < 1 || month > 12) return _t('val.invalid_card_expiry');
    if (year < 100) year = 2000 + year;

    var expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
    if (isNaN(expiryEnd.getTime())) return _t('val.invalid_card_expiry');
    if (Date.now() > expiryEnd.getTime()) return _t('val.card_expired');

    return null;
  }

  function validateCardCvv(cardType, value) {
    var digits = sanitizeDigits(value);
    if (!digits) return _t('val.required_card_cvv');

    var rule = getCardRule(cardType);
    if (!rule) return _t('val.invalid_card_type');

    if (digits.length !== rule.cvvLength) {
      return _t('val.invalid_card_cvv', { n: rule.cvvLength });
    }

    return null;
  }

  /* ===========================
     ORDER DATA ACCESS
     =========================== */

  function getAllOrders() {
    try {
      var orders = Storage.get(KEYS.orders, []);
      return Array.isArray(orders) ? orders : [];
    } catch (e) {
      return [];
    }
  }

  function saveOrder(order) {
    try {
      var orders = getAllOrders();
      orders.push(order);
      return Storage.set(KEYS.orders, orders);
    } catch (e) {
      return false;
    }
  }

  /* ===========================
     UI HELPERS
     =========================== */

  function showFieldError(fieldId, errorId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(errorId);
    if (field) field.classList.add('input--error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    }
  }

  function clearAllErrors() {
    var errorInputs = document.querySelectorAll('.input--error');
    for (var i = 0; i < errorInputs.length; i++) {
      errorInputs[i].classList.remove('input--error');
    }
    var errorMsgs = document.querySelectorAll('.field-error');
    for (var j = 0; j < errorMsgs.length; j++) {
      errorMsgs[j].classList.remove('is-visible');
      errorMsgs[j].textContent = '';
    }
  }

  function showGatewayError(message) {
    var errWrap = document.getElementById('ckGatewayError');
    if (!errWrap) return;

    errWrap.classList.add('is-visible');
    errWrap.innerHTML =
      '<div class="ck-gateway-error__title">' + _t('checkout.gateway_failed_title') + '</div>' +
      '<div class="ck-gateway-error__desc">' + escapeHtml(message || _t('checkout.gateway_failed_desc')) + '</div>' +
      '<div class="ck-gateway-error__meta">' + _t('checkout.gateway_retry_hint') + '</div>' +
      '<button type="button" class="btn btn--secondary btn--sm" id="btnRetryGateway">' + _t('checkout.retry_payment') + '</button>';

    var retryBtn = document.getElementById('btnRetryGateway');
    if (retryBtn) {
      retryBtn.addEventListener('click', function () {
        handleSubmitPayment();
      });
    }
  }

  function clearGatewayError() {
    var errWrap = document.getElementById('ckGatewayError');
    if (!errWrap) return;
    errWrap.classList.remove('is-visible');
    errWrap.innerHTML = '';
  }

  function setSubmitting(loading) {
    isSubmitting = !!loading;

    var payBtn = document.getElementById('btnPayNow');
    var backBtn = document.getElementById('btnBackToStep1');
    var nextBtn = document.getElementById('btnToStep2');
    var overlay = document.getElementById('ckProcessingOverlay');

    if (payBtn) {
      payBtn.disabled = isSubmitting;
      payBtn.textContent = isSubmitting ? _t('checkout.processing_payment') : _t('checkout.pay_now');
    }

    if (backBtn) backBtn.disabled = isSubmitting;
    if (nextBtn) nextBtn.disabled = isSubmitting;

    if (overlay) {
      overlay.classList.toggle('is-visible', isSubmitting);
      var label = overlay.querySelector('.ck-processing__text');
      if (label) label.textContent = _t('checkout.processing_payment');
    }
  }

  function setStep(step) {
    currentStep = step === 2 ? 2 : 1;

    var stepOne = document.getElementById('ckStep1');
    var stepTwo = document.getElementById('ckStep2');
    var stepOneIndicator = document.getElementById('ckStepIndicator1');
    var stepTwoIndicator = document.getElementById('ckStepIndicator2');

    if (stepOne) stepOne.style.display = currentStep === 1 ? '' : 'none';
    if (stepTwo) stepTwo.style.display = currentStep === 2 ? '' : 'none';

    if (stepOneIndicator) {
      stepOneIndicator.classList.toggle('is-active', currentStep === 1);
      stepOneIndicator.classList.toggle('is-done', currentStep === 2);
    }

    if (stepTwoIndicator) {
      stepTwoIndicator.classList.toggle('is-active', currentStep === 2);
    }
  }

  function prefillBuyerFields() {
    var session = getSessionSafe();
    if (!session) return;

    var fullName = document.getElementById('ckFullName');
    var email = document.getElementById('ckEmail');

    if (fullName && !fullName.value) fullName.value = session.fullName || '';
    if (email && !email.value) email.value = session.email || '';
  }

  function bindInputEnhancements() {
    var cardNumber = document.getElementById('ckCardNumber');
    var cardCvv = document.getElementById('ckCardCvv');
    var cardExpiry = document.getElementById('ckCardExpiry');

    if (cardNumber) {
      cardNumber.addEventListener('input', function () {
        cardNumber.value = formatCardNumberInput(cardNumber.value);
      });
    }

    if (cardCvv) {
      cardCvv.addEventListener('input', function () {
        cardCvv.value = sanitizeDigits(cardCvv.value).substr(0, 4);
      });
    }

    if (cardExpiry) {
      cardExpiry.addEventListener('input', function () {
        var digits = sanitizeDigits(cardExpiry.value).substr(0, 4);
        if (digits.length >= 3) {
          cardExpiry.value = digits.substr(0, 2) + '/' + digits.substr(2);
        } else {
          cardExpiry.value = digits;
        }
      });
    }
  }

  /* ===========================
     RENDER: ERROR STATE
     =========================== */

  function renderError(title, desc) {
    var content = document.getElementById('checkoutContent');
    if (!content) return;

    content.innerHTML =
      '<div class="ck-error-state">' +
        '<div class="ck-error-state__icon">⚠️</div>' +
        '<h2 class="ck-error-state__title">' + escapeHtml(title) + '</h2>' +
        '<p class="ck-error-state__desc">' + escapeHtml(desc) + '</p>' +
        '<div class="ck-error-state__actions">' +
          '<a href="./marketplace.html" class="btn btn--primary">' + _t('md.back') + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ===========================
     RENDER: SUCCESS STATE
     =========================== */

  function renderSuccess(order) {
    var content = document.getElementById('checkoutContent');
    if (!content) return;

    var countdownText = '';
    if (order && order.createdAt) {
      var deadlineMs = new Date(order.createdAt).getTime() + (CANCEL_WINDOW_DAYS * 24 * 60 * 60 * 1000);
      countdownText = formatCountdownDuration(deadlineMs - Date.now());
    }

    var guestNote = '';
    if (order && order.checkoutMode === 'guest') {
      guestNote =
        '<div class="ck-guest-warning ck-guest-warning--success">' +
          '<strong>' + _t('checkout.guest_local_only_title') + '</strong>' +
          '<p>' + _t('checkout.success_guest_note') + '</p>' +
        '</div>';
    }

    content.innerHTML =
      '<div class="ck-success-state">' +
        '<div class="ck-success-state__icon">✅</div>' +
        '<h2 class="ck-success-state__title">' + _t('checkout.success_title') + '</h2>' +
        '<p class="ck-success-state__desc">' + _t('checkout.success_desc', { orderId: order.orderId }) + '</p>' +
        '<p class="ck-success-state__note">' + _t('checkout.success_status_note') + '</p>' +
        '<p class="ck-success-state__countdown">' + _t('checkout.cancel_window_countdown', { countdown: countdownText }) + '</p>' +
        guestNote +
        '<div class="ck-success-state__actions">' +
          '<a href="./market-detail.html?id=' + encodeURIComponent(order.postId) + '" class="btn btn--secondary">' + _t('checkout.view_post') + '</a>' +
          '<a href="./my-purchases.html" class="btn btn--primary">' + _t('checkout.view_purchases') + '</a>' +
          '<a href="./marketplace.html" class="btn btn--secondary">' + _t('checkout.view_marketplace') + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ===========================
     RENDER: CHECKOUT PAGE
     =========================== */

  function renderCheckout(post) {
    var content = document.getElementById('checkoutContent');
    if (!content) return;

    var session = getSessionSafe();
    var isGuest = !session;
    var gatewayMode = parseQueryGatewayMode();

    var imageHtml;
    if (post.image) {
      imageHtml = '<img class="ck-summary__image" src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '">';
    } else {
      imageHtml = '<div class="ck-summary__image--fallback">🏎️</div>';
    }

    var guestWarningHtml = '';
    if (isGuest) {
      guestWarningHtml =
        '<div class="ck-guest-warning">' +
          '<strong>' + _t('checkout.guest_local_only_title') + '</strong>' +
          '<p>' + _t('checkout.guest_local_only_desc') + '</p>' +
          '<p class="ck-guest-warning__cta"><a href="./auth.html">' + _t('checkout.guest_login_prompt') + '</a></p>' +
        '</div>';
    }

    var debugGatewayHtml = '';
    if (gatewayMode !== 'auto') {
      debugGatewayHtml =
        '<div class="ck-gateway-debug">' +
          (gatewayMode === 'force_success' ? _t('checkout.gateway_debug_success') : _t('checkout.gateway_debug_fail')) +
        '</div>';
    }

    var html =
      '<a href="./market-detail.html?id=' + encodeURIComponent(post.id) + '" class="ck-back">' + _t('checkout.back') + '</a>' +

      '<h1 class="section-title">' + _t('checkout.title') + '</h1>' +
      '<p class="section-subtitle">' + _t('checkout.subtitle') + '</p>' +

      '<div class="ck-layout">' +
        '<div class="ck-summary">' +
          '<h2 class="ck-summary__heading">' + _t('checkout.car_info') + '</h2>' +
          '<div class="ck-summary__card">' +
            imageHtml +
            '<div class="ck-summary__info">' +
              '<span class="badge">' + escapeHtml(post.brand || _t('common.na')) + '</span>' +
              '<h3 class="ck-summary__title">' + escapeHtml(post.title) + '</h3>' +
              '<p class="ck-summary__price">' + formatPrice(post.price) + '</p>' +
              '<p class="ck-summary__meta">' + escapeHtml((post.year ? post.year + ' • ' : '') + (post.location || '')) + '</p>' +
            '</div>' +
          '</div>' +
          '<div id="checkoutFinanceMount"></div>' +
        '</div>' +

        '<div class="ck-form-wrap">' +
          '<div class="ck-steps">' +
            '<div class="ck-step is-active" id="ckStepIndicator1">' +
              '<span class="ck-step__index">1</span>' +
              '<div><strong>' + _t('checkout.step_buyer') + '</strong><p>' + _t('checkout.step_buyer_desc') + '</p></div>' +
            '</div>' +
            '<div class="ck-step" id="ckStepIndicator2">' +
              '<span class="ck-step__index">2</span>' +
              '<div><strong>' + _t('checkout.step_payment') + '</strong><p>' + _t('checkout.step_payment_desc') + '</p></div>' +
            '</div>' +
          '</div>' +

          guestWarningHtml +
          debugGatewayHtml +

          '<form id="checkoutForm" novalidate>' +
            '<section id="ckStep1">' +
              '<h2 class="ck-form-wrap__heading">' + _t('checkout.buyer_info') + '</h2>' +

              '<div class="input-group">' +
                '<label class="label" for="ckFullName">' + _t('checkout.fullname') + ' <span class="ck-required">*</span></label>' +
                '<input type="text" class="input" id="ckFullName" placeholder="' + _t('checkout.fullname_ph') + '" autocomplete="name">' +
                '<span class="field-error" id="errFullName"></span>' +
              '</div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckPhone">' + _t('checkout.phone') + ' <span class="ck-required">*</span></label>' +
                '<input type="tel" class="input" id="ckPhone" placeholder="' + _t('checkout.phone_ph') + '" autocomplete="tel">' +
                '<span class="field-error" id="errPhone"></span>' +
              '</div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckEmail">' + _t('checkout.email') + ' <span class="ck-required">*</span></label>' +
                '<input type="email" class="input" id="ckEmail" placeholder="' + _t('checkout.email_ph') + '" autocomplete="email">' +
                '<span class="field-error" id="errEmail"></span>' +
              '</div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckAddress">' + _t('checkout.address') + ' <span class="ck-required">*</span></label>' +
                '<textarea class="input" id="ckAddress" placeholder="' + _t('checkout.address_ph') + '" rows="3"></textarea>' +
                '<span class="field-error" id="errAddress"></span>' +
              '</div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckNote">' + _t('checkout.note') + '</label>' +
                '<textarea class="input" id="ckNote" placeholder="' + _t('checkout.note_ph') + '" rows="2"></textarea>' +
              '</div>' +

              '<div class="ck-form-wrap__actions ck-form-wrap__actions--split">' +
                '<button type="button" class="btn btn--primary btn--lg" id="btnToStep2">' + _t('checkout.continue_to_payment') + '</button>' +
              '</div>' +
            '</section>' +

            '<section id="ckStep2" style="display:none;">' +
              '<h2 class="ck-form-wrap__heading">' + _t('checkout.payment_demo_title') + '</h2>' +
              '<p class="ck-form-wrap__subheading">' + _t('checkout.payment_demo_desc') + '</p>' +

              '<div class="ck-buyer-preview" id="ckBuyerPreview"></div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckCardType">' + _t('checkout.card_type') + ' <span class="ck-required">*</span></label>' +
                '<select class="input" id="ckCardType">' +
                  '<option value="">' + _t('checkout.card_type_ph') + '</option>' +
                  '<option value="visa">' + _t('checkout.card_visa') + '</option>' +
                  '<option value="mastercard">' + _t('checkout.card_mastercard') + '</option>' +
                  '<option value="jcb">' + _t('checkout.card_jcb') + '</option>' +
                  '<option value="amex">' + _t('checkout.card_amex') + '</option>' +
                '</select>' +
                '<span class="field-error" id="errCardType"></span>' +
              '</div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckCardHolder">' + _t('checkout.card_holder') + ' <span class="ck-required">*</span></label>' +
                '<input type="text" class="input" id="ckCardHolder" placeholder="' + _t('checkout.card_holder_ph') + '" autocomplete="cc-name">' +
                '<span class="field-error" id="errCardHolder"></span>' +
              '</div>' +

              '<div class="input-group">' +
                '<label class="label" for="ckCardNumber">' + _t('checkout.card_number') + ' <span class="ck-required">*</span></label>' +
                '<input type="text" class="input" id="ckCardNumber" placeholder="' + _t('checkout.card_number_ph') + '" inputmode="numeric" autocomplete="cc-number">' +
                '<span class="field-error" id="errCardNumber"></span>' +
              '</div>' +

              '<div class="ck-card-grid">' +
                '<div class="input-group">' +
                  '<label class="label" for="ckCardExpiry">' + _t('checkout.card_expiry') + ' <span class="ck-required">*</span></label>' +
                  '<input type="text" class="input" id="ckCardExpiry" placeholder="' + _t('checkout.card_expiry_ph') + '" inputmode="numeric" autocomplete="cc-exp">' +
                  '<span class="field-error" id="errCardExpiry"></span>' +
                '</div>' +
                '<div class="input-group">' +
                  '<label class="label" for="ckCardCvv">' + _t('checkout.card_cvv') + ' <span class="ck-required">*</span></label>' +
                  '<input type="password" class="input" id="ckCardCvv" placeholder="' + _t('checkout.card_cvv_ph') + '" inputmode="numeric" autocomplete="cc-csc">' +
                  '<span class="field-error" id="errCardCvv"></span>' +
                '</div>' +
              '</div>' +

              '<div class="ck-gateway-error" id="ckGatewayError"></div>' +
              '<div class="ck-processing" id="ckProcessingOverlay" aria-live="polite" aria-busy="false">' +
                '<div class="ck-processing__panel">' +
                  '<div class="ck-processing__spinner" aria-hidden="true"></div>' +
                  '<p class="ck-processing__text">' + _t('checkout.processing_payment') + '</p>' +
                '</div>' +
              '</div>' +

              '<div class="ck-form-wrap__actions ck-form-wrap__actions--split">' +
                '<button type="button" class="btn btn--secondary btn--lg" id="btnBackToStep1">' + _t('checkout.back_to_buyer') + '</button>' +
                '<button type="button" class="btn btn--primary btn--lg" id="btnPayNow">' + _t('checkout.pay_now') + '</button>' +
              '</div>' +
            '</section>' +
          '</form>' +
        '</div>' +
      '</div>';

    content.innerHTML = html;

    if (typeof FinanceCalculator !== 'undefined') {
      FinanceCalculator.mount('#checkoutFinanceMount', { price: Number(post.price) || 0 });
    }
    bindFormEvents();
    bindInputEnhancements();
    prefillBuyerFields();
  }

  /* ===========================
     FORM EVENTS
     =========================== */

  function bindFormEvents() {
    var form = document.getElementById('checkoutForm');
    if (!form) return;

    var btnStep2 = document.getElementById('btnToStep2');
    var btnBack = document.getElementById('btnBackToStep1');
    var btnPayNow = document.getElementById('btnPayNow');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (currentStep === 1) {
        handleContinueToPayment();
      } else {
        handleSubmitPayment();
      }
    });

    if (btnStep2) {
      btnStep2.addEventListener('click', function () {
        handleContinueToPayment();
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', function () {
        clearAllErrors();
        clearGatewayError();
        setStep(1);
      });
    }

    if (btnPayNow) {
      btnPayNow.addEventListener('click', function () {
        handleSubmitPayment();
      });
    }
  }

  function collectBuyerFormData() {
    return {
      fullName: (document.getElementById('ckFullName').value || '').trim(),
      phone: (document.getElementById('ckPhone').value || '').trim(),
      email: (document.getElementById('ckEmail').value || '').trim(),
      address: (document.getElementById('ckAddress').value || '').trim(),
      note: (document.getElementById('ckNote').value || '').trim()
    };
  }

  function validateBuyerStep(data) {
    clearAllErrors();

    var hasError = false;
    var nameErr = validateFullName(data.fullName);
    var phoneErr = validatePhone(data.phone);
    var emailErr = validateEmail(data.email);
    var addrErr = validateAddress(data.address);

    if (nameErr) {
      showFieldError('ckFullName', 'errFullName', nameErr);
      hasError = true;
    }

    if (phoneErr) {
      showFieldError('ckPhone', 'errPhone', phoneErr);
      hasError = true;
    }

    if (emailErr) {
      showFieldError('ckEmail', 'errEmail', emailErr);
      hasError = true;
    }

    if (addrErr) {
      showFieldError('ckAddress', 'errAddress', addrErr);
      hasError = true;
    }

    return !hasError;
  }

  function updateBuyerPreview(data) {
    var preview = document.getElementById('ckBuyerPreview');
    if (!preview || !data) return;

    preview.innerHTML =
      '<div class="ck-buyer-preview__title">' + _t('checkout.buyer_preview_title') + '</div>' +
      '<div class="ck-buyer-preview__item"><strong>' + _t('checkout.fullname') + ':</strong> ' + escapeHtml(data.fullName) + '</div>' +
      '<div class="ck-buyer-preview__item"><strong>' + _t('checkout.phone') + ':</strong> ' + escapeHtml(data.phone) + '</div>' +
      '<div class="ck-buyer-preview__item"><strong>' + _t('checkout.email') + ':</strong> ' + escapeHtml(data.email) + '</div>';
  }

  function handleContinueToPayment() {
    if (isSubmitting) return;

    var buyerData = collectBuyerFormData();
    if (!validateBuyerStep(buyerData)) return;

    if (currentPost && isBuyerPostOwner(currentPost, buyerData.email)) {
      showToast(_t('checkout.err_owner_cannot_buy'), 'error');
      return;
    }

    buyerDraft = buyerData;
    clearAllErrors();
    clearGatewayError();
    updateBuyerPreview(buyerData);
    setStep(2);
  }

  function collectPaymentData() {
    return {
      cardType: normalizeText(document.getElementById('ckCardType').value),
      cardHolder: (document.getElementById('ckCardHolder').value || '').trim(),
      cardNumber: sanitizeDigits(document.getElementById('ckCardNumber').value),
      expiry: (document.getElementById('ckCardExpiry').value || '').trim(),
      cvv: sanitizeDigits(document.getElementById('ckCardCvv').value)
    };
  }

  function validatePaymentStep(data) {
    clearAllErrors();
    clearGatewayError();

    var hasError = false;
    var cardTypeErr = validateCardType(data.cardType);
    var cardHolderErr = validateCardHolder(data.cardHolder);
    var cardNumberErr = validateCardNumber(data.cardType, data.cardNumber);
    var cardExpiryErr = validateCardExpiry(data.expiry);
    var cardCvvErr = validateCardCvv(data.cardType, data.cvv);

    if (cardTypeErr) {
      showFieldError('ckCardType', 'errCardType', cardTypeErr);
      hasError = true;
    }
    if (cardHolderErr) {
      showFieldError('ckCardHolder', 'errCardHolder', cardHolderErr);
      hasError = true;
    }
    if (cardNumberErr) {
      showFieldError('ckCardNumber', 'errCardNumber', cardNumberErr);
      hasError = true;
    }
    if (cardExpiryErr) {
      showFieldError('ckCardExpiry', 'errCardExpiry', cardExpiryErr);
      hasError = true;
    }
    if (cardCvvErr) {
      showFieldError('ckCardCvv', 'errCardCvv', cardCvvErr);
      hasError = true;
    }

    return !hasError;
  }

  function simulateGatewayResult() {
    var mode = parseQueryGatewayMode();
    if (mode === 'force_success') {
      return { success: true, reason: 'forced_success' };
    }
    if (mode === 'force_fail') {
      return { success: false, reason: 'forced_fail' };
    }

    var ok = Math.random() >= GATEWAY_FAIL_RATE;
    return {
      success: ok,
      reason: ok ? 'approved' : 'gateway_random_fail'
    };
  }

  function buildListingSnapshot(post) {
    return {
      id: post.id,
      title: post.title || '',
      brand: post.brand || '',
      model: post.model || '',
      year: post.year || null,
      location: post.location || '',
      image: post.image || '',
      ownerEmail: post.ownerEmail || '',
      ownerName: post.ownerName || '',
      price: Number(post.price || 0),
      status: post.status || 'available',
      availability: post.availability || getPostAvailability(post)
    };
  }

  function pushTimeline(timeline, status, message, meta, atIso) {
    timeline.push({
      status: status,
      message: message || '',
      metadata: meta || {},
      at: atIso || new Date().toISOString()
    });
  }

  function buildOrder(freshPost, buyerData, paymentData) {
    var session = getSessionSafe();
    var nowIso = new Date().toISOString();
    var cancelDeadlineIso = new Date(Date.now() + (CANCEL_WINDOW_DAYS * 24 * 60 * 60 * 1000)).toISOString();

    var timeline = [];
    pushTimeline(timeline, 'confirmed', 'payment_success', {
      gateway: 'autoluxe_demo_gateway',
      failCountBeforeSuccess: gatewayFailCount
    }, nowIso);

    var buyerEmailNormalized = normalizeEmail(buyerData.email);

    return {
      orderId: generateOrderId(),
      postId: currentPostId,

      checkoutMode: session ? 'user' : 'guest',
      buyerUserId: session ? session.userId : null,
      buyerUserEmail: session ? normalizeEmail(session.email) : null,
      buyerGuestId: session ? null : getOrCreateGuestId(),

      buyer: {
        fullName: buyerData.fullName,
        phone: buyerData.phone,
        email: buyerEmailNormalized,
        address: buyerData.address,
        note: buyerData.note
      },

      paymentMethod: 'card_demo',
      payment: {
        provider: 'autoluxe_demo_gateway',
        cardType: paymentData.cardType,
        cardHolder: paymentData.cardHolder,
        cardNumber: paymentData.cardNumber,
        expiry: paymentData.expiry,
        cvv: paymentData.cvv,
        transactionId: generateTransactionId(),
        outcome: 'success',
        failCountBeforeSuccess: gatewayFailCount
      },

      listingSnapshot: buildListingSnapshot(freshPost),
      priceSnapshot: Number(freshPost.price || 0),

      orderStatus: 'confirmed',
      status: 'confirmed',
      cancelWindowDays: CANCEL_WINDOW_DAYS,
      cancelDeadlineAt: cancelDeadlineIso,
      deliveryReminderSent: false,

      timeline: timeline,

      createdAt: nowIso,
      updatedAt: nowIso
    };
  }

  function sendOrderNotifications(order, freshPost) {
    if (typeof Notifications === 'undefined' || typeof Notifications.emitEvent !== 'function') return;

    var buyerNotifKey = normalizeEmail(order.buyerUserEmail || order.buyer.email);
    var sellerNotifKey = normalizeEmail(freshPost.ownerEmail || (order.listingSnapshot && order.listingSnapshot.ownerEmail) || '');
    var adminNotifKey = (typeof Auth !== 'undefined' && Auth.ADMIN_EMAIL)
      ? normalizeEmail(Auth.ADMIN_EMAIL)
      : '';
    var buyerName = order.buyer && order.buyer.fullName ? order.buyer.fullName : _t('market.anonymous');
    var orderMeta = {
      orderId: order.orderId,
      postId: order.postId
    };

    if (buyerNotifKey) {
      Notifications.emitEvent('order_created_buyer', {
        userKey: buyerNotifKey,
        orderId: order.orderId,
        postId: order.postId,
        params: {
          orderId: order.orderId,
          title: freshPost.title || ''
        },
        metadata: orderMeta
      });
    }

    if (sellerNotifKey && sellerNotifKey !== buyerNotifKey) {
      Notifications.emitEvent('order_created_seller', {
        userKey: sellerNotifKey,
        orderId: order.orderId,
        postId: order.postId,
        params: {
          orderId: order.orderId,
          title: freshPost.title || '',
          buyer: buyerName
        },
        metadata: orderMeta
      });
    }

    if (adminNotifKey) {
      Notifications.emitEvent('order_created_admin', {
        userKey: adminNotifKey,
        orderId: order.orderId,
        postId: order.postId,
        params: {
          orderId: order.orderId,
          title: freshPost.title || '',
          buyer: buyerName
        },
        metadata: orderMeta
      });
    }
  }

  function handleSubmitPayment() {
    if (isSubmitting) return;

    if (!buyerDraft) {
      showToast(_t('checkout.err_missing_buyer_step'), 'error');
      setStep(1);
      return;
    }

    var paymentData = collectPaymentData();
    if (!validatePaymentStep(paymentData)) return;

    var freshPost = Marketplace.getPostById(currentPostId);
    if (!freshPost) {
      showToast(_t('checkout.err_post_gone'), 'error');
      return;
    }
    if (isBuyerPostOwner(freshPost, buyerDraft.email)) {
      showToast(_t('checkout.err_owner_cannot_buy'), 'error');
      return;
    }

    if (!isPostPurchasable(freshPost, buyerDraft.email)) {
      showToast(_t('checkout.err_already_pending'), 'error');
      return;
    }

    setSubmitting(true);

    setTimeout(function () {
      var gatewayResult = simulateGatewayResult();

      if (!gatewayResult.success) {
        gatewayFailCount += 1;
        setSubmitting(false);
        showGatewayError(_t('checkout.gateway_failed_desc'));
        showToast(_t('checkout.payment_failed_toast'), 'error');
        return;
      }

      var order = buildOrder(freshPost, buyerDraft, paymentData);

      var postUpdated = Marketplace.updatePost(currentPostId, {
        status: 'pending',
        availability: 'pending_payment'
      });

      if (!postUpdated) {
        setSubmitting(false);
        showToast(_t('checkout.err_update_post'), 'error');
        return;
      }

      var orderSaved = saveOrder(order);
      if (!orderSaved) {
        Marketplace.updatePost(currentPostId, {
          status: 'available',
          availability: 'available'
        });
        setSubmitting(false);
        showToast(_t('checkout.err_save_order'), 'error');
        return;
      }

      sendOrderNotifications(order, freshPost);
      setSubmitting(false);
      showToast(_t('checkout.payment_success_toast'), 'success');
      renderSuccess(order);
    }, 800);
  }

  function refreshCheckoutTexts() {
    if (!document.getElementById('checkoutContent')) return;
    if (typeof I18n === 'undefined' || typeof I18n.applyTranslations !== 'function') return;
    I18n.applyTranslations();
  }

  /* ===========================
     TOAST
     =========================== */

  function showToast(message, type) {
    if (typeof Toast !== 'undefined') {
      Toast.show({ message: message, type: type || 'success' });
    }
  }

  /* ===========================
     INIT
     =========================== */

  function init() {
    Seed.run();

    currentPostId = parseQueryPostId();

    if (!currentPostId) {
      renderError(_t('checkout.err_no_post_id'), _t('checkout.err_no_post_id_desc'));
      return;
    }

    try {
      currentPost = Marketplace.getPostById(currentPostId);
    } catch (e) {
      currentPost = null;
    }

    if (!currentPost) {
      renderError(_t('checkout.err_not_found'), _t('checkout.err_not_found_desc'));
      return;
    }

    if (isBuyerPostOwner(currentPost)) {
      renderError(_t('checkout.err_owner_cannot_buy'), _t('checkout.err_owner_cannot_buy_desc'));
      return;
    }

    if (!isPostPurchasable(currentPost)) {
      var moderation = normalizeText(currentPost.moderation);
      if (moderation && moderation !== 'approved') {
        renderError(_t('checkout.err_not_approved'), _t('checkout.err_not_approved_desc'));
      } else {
        renderError(_t('checkout.err_pending'), _t('checkout.err_pending_desc'));
      }
      return;
    }

    renderCheckout(currentPost);

    document.addEventListener('autoluxe:locale-changed', function () {
      refreshCheckoutTexts();
    });
  }

  return { init: init };
})();
