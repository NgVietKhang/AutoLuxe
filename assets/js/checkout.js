/* =============================================
   CHECKOUT.JS - AutoLuxe Supercar Web
   Checkout flow: validate, create order, update post status (Phase 8)
   ============================================= */

var Checkout = (function () {
  'use strict';

  var KEYS = {
    orders: 'autoluxe_orders',
    posts: 'autoluxe_market_posts'
  };

  var currentPost = null;
  var currentPostId = null;

  /* ===========================
     HELPERS
     =========================== */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function formatPrice(price) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatCurrency === 'function') {
      return I18n.formatCurrency(price || 0);
    }
    if (!price && price !== 0) return '$0';
    return '$' + Number(price).toLocaleString('en-US');
  }

  function generateOrderId() {
    return 'ord_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function parseQueryPostId() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('postId') || null;
    } catch (e) {
      return null;
    }
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
    // Allow +84 prefix or 0 prefix, 9-11 digits total
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

  function validatePaymentMethod(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return _t('val.required_payment');
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
    content.innerHTML =
      '<div class="ck-success-state">' +
        '<div class="ck-success-state__icon">✅</div>' +
        '<h2 class="ck-success-state__title">' + _t('checkout.success_title') + '</h2>' +
        '<p class="ck-success-state__desc">' + _t('checkout.success_desc', { orderId: order.orderId }) + '</p>' +
        '<div class="ck-success-state__actions">' +
          '<a href="./market-detail.html?id=' + encodeURIComponent(order.postId) + '" class="btn btn--secondary">' + _t('checkout.view_post') + '</a>' +
          '<a href="./marketplace.html" class="btn btn--primary">' + _t('checkout.view_marketplace') + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ===========================
     RENDER: CHECKOUT PAGE
     =========================== */

  function renderCheckout(post) {
    var content = document.getElementById('checkoutContent');
    if (!content) return;

    var imageHtml;
    if (post.image) {
      imageHtml = '<img class="ck-summary__image" src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" onerror="this.src=\'\'; this.style.display=\'none\'">';
    } else {
      imageHtml = '<div class="ck-summary__image--fallback">🏎️</div>';
    }

    var html =
      '<a href="./market-detail.html?id=' + encodeURIComponent(post.id) + '" class="ck-back">' + _t('checkout.back') + '</a>' +

      '<h1 class="section-title">' + _t('checkout.title') + '</h1>' +
      '<p class="section-subtitle">' + _t('checkout.subtitle') + '</p>' +

      '<div class="ck-layout">' +

        /* Order summary */
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
        '</div>' +

        /* Checkout form */
        '<div class="ck-form-wrap">' +
          '<h2 class="ck-form-wrap__heading">' + _t('checkout.buyer_info') + '</h2>' +
          '<form id="checkoutForm" novalidate>' +

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
              '<label class="label" for="ckPayment">' + _t('checkout.payment') + ' <span class="ck-required">*</span></label>' +
              '<select class="input" id="ckPayment">' +
                '<option value="">' + _t('checkout.payment_ph') + '</option>' +
                '<option value="bank_transfer">' + _t('checkout.payment_bank') + '</option>' +
                '<option value="cash">' + _t('checkout.payment_cash') + '</option>' +
                '<option value="installment">' + _t('checkout.payment_installment') + '</option>' +
                '<option value="crypto">' + _t('checkout.payment_crypto') + '</option>' +
              '</select>' +
              '<span class="field-error" id="errPayment"></span>' +
            '</div>' +

            '<div class="input-group">' +
              '<label class="label" for="ckNote">' + _t('checkout.note') + '</label>' +
              '<textarea class="input" id="ckNote" placeholder="' + _t('checkout.note_ph') + '" rows="2"></textarea>' +
            '</div>' +

            '<div class="ck-form-wrap__actions">' +
              '<button type="submit" class="btn btn--primary btn--lg" id="btnSubmitOrder">' + _t('checkout.submit') + '</button>' +
            '</div>' +

          '</form>' +
        '</div>' +

      '</div>';

    content.innerHTML = html;
    bindFormEvents();
  }

  /* ===========================
     FORM EVENTS
     =========================== */

  function bindFormEvents() {
    var form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleSubmit();
    });
  }

  /* ===========================
     FIELD ERROR DISPLAY
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

  /* ===========================
     HANDLE SUBMIT
     =========================== */

  function handleSubmit() {
    clearAllErrors();

    // Gather values
    var fullName = (document.getElementById('ckFullName').value || '').trim();
    var phone = (document.getElementById('ckPhone').value || '').trim();
    var email = (document.getElementById('ckEmail').value || '').trim();
    var address = (document.getElementById('ckAddress').value || '').trim();
    var payment = (document.getElementById('ckPayment').value || '').trim();
    var note = (document.getElementById('ckNote').value || '').trim();

    // Validate
    var hasError = false;

    var nameErr = validateFullName(fullName);
    if (nameErr) { showFieldError('ckFullName', 'errFullName', nameErr); hasError = true; }

    var phoneErr = validatePhone(phone);
    if (phoneErr) { showFieldError('ckPhone', 'errPhone', phoneErr); hasError = true; }

    var emailErr = validateEmail(email);
    if (emailErr) { showFieldError('ckEmail', 'errEmail', emailErr); hasError = true; }

    var addrErr = validateAddress(address);
    if (addrErr) { showFieldError('ckAddress', 'errAddress', addrErr); hasError = true; }

    var payErr = validatePaymentMethod(payment);
    if (payErr) { showFieldError('ckPayment', 'errPayment', payErr); hasError = true; }

    if (hasError) return;

    // Re-check post status (prevent race condition / double buy)
    var freshPost = Marketplace.getPostById(currentPostId);
    if (!freshPost) {
      showToast(_t('checkout.err_post_gone'), 'error');
      return;
    }
    if (freshPost.status === 'pending') {
      showToast(_t('checkout.err_already_pending'), 'error');
      return;
    }

    // Build order object
    var session = null;
    try { session = Auth.getSession(); } catch (e) { session = null; }

    var order = {
      orderId: generateOrderId(),
      postId: currentPostId,
      buyer: {
        fullName: fullName,
        phone: phone,
        email: email,
        address: address,
        note: note
      },
      paymentMethod: payment,
      priceSnapshot: freshPost.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
      buyerUserId: session ? session.userId : null,
      buyerUserEmail: session ? session.email : null
    };

    // Step 1: Update post status to pending
    var postUpdated = Marketplace.updatePost(currentPostId, { status: 'pending' });
    if (!postUpdated) {
      showToast(_t('checkout.err_update_post'), 'error');
      return;
    }

    // Step 2: Save order
    var orderSaved = saveOrder(order);
    if (!orderSaved) {
      // Rollback post status
      Marketplace.updatePost(currentPostId, { status: 'available' });
      showToast(_t('checkout.err_save_order'), 'error');
      return;
    }

    // Success
    renderSuccess(order);

    // --- Phase 10: Trigger notifications ---
    if (typeof Notifications !== 'undefined' && typeof Notifications.emitEvent === 'function') {
      var buyerEmail = String(order.buyerUserEmail || '').trim().toLowerCase();
      var sellerEmail = String(freshPost.ownerEmail || '').trim().toLowerCase();
      var adminEmail = (typeof Auth !== 'undefined' && Auth.ADMIN_EMAIL)
        ? String(Auth.ADMIN_EMAIL).trim().toLowerCase()
        : '';
      var buyerName = order.buyer && order.buyer.fullName ? order.buyer.fullName : _t('market.anonymous');
      var meta = { orderId: order.orderId, postId: order.postId };

      if (buyerEmail) {
        Notifications.emitEvent('order_created_buyer', {
          userKey: buyerEmail,
          orderId: order.orderId,
          postId: order.postId,
          params: { orderId: order.orderId, title: freshPost.title || '' },
          metadata: meta
        });
      }

      if (sellerEmail && sellerEmail !== buyerEmail) {
        Notifications.emitEvent('order_created_seller', {
          userKey: sellerEmail,
          orderId: order.orderId,
          postId: order.postId,
          params: {
            orderId: order.orderId,
            title: freshPost.title || '',
            buyer: buyerName
          },
          metadata: meta
        });
      }

      if (adminEmail) {
        Notifications.emitEvent('order_created_admin', {
          userKey: adminEmail,
          orderId: order.orderId,
          postId: order.postId,
          params: {
            orderId: order.orderId,
            title: freshPost.title || '',
            buyer: buyerName
          },
          metadata: meta
        });
      }
    }
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

    // No postId in URL
    if (!currentPostId) {
      renderError(_t('checkout.err_no_post_id'), _t('checkout.err_no_post_id_desc'));
      return;
    }

    // Get post
    try {
      currentPost = Marketplace.getPostById(currentPostId);
    } catch (e) {
      currentPost = null;
    }

    // Post not found
    if (!currentPost) {
      renderError(_t('checkout.err_not_found'), _t('checkout.err_not_found_desc'));
      return;
    }

    // Post already pending
    if (currentPost.status === 'pending') {
      renderError(_t('checkout.err_pending'), _t('checkout.err_pending_desc'));
      return;
    }

    // Render checkout
    renderCheckout(currentPost);
  }

  return { init: init };
})();
