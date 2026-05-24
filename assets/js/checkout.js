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
    if (!trimmed) return 'Vui lòng nhập họ tên.';
    if (trimmed.length < 2) return 'Họ tên phải có ít nhất 2 ký tự.';
    return null;
  }

  function validatePhone(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'Vui lòng nhập số điện thoại.';
    // Allow +84 prefix or 0 prefix, 9-11 digits total
    var phoneRegex = /^(\+84|0)\d{8,10}$/;
    if (!phoneRegex.test(trimmed)) return 'SĐT không hợp lệ (VD: 0912345678 hoặc +84912345678).';
    return null;
  }

  function validateEmail(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'Vui lòng nhập email.';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Email không đúng định dạng.';
    return null;
  }

  function validateAddress(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'Vui lòng nhập địa chỉ nhận xe/chứng từ.';
    if (trimmed.length < 5) return 'Địa chỉ phải có ít nhất 5 ký tự.';
    return null;
  }

  function validatePaymentMethod(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'Vui lòng chọn phương thức thanh toán.';
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
          '<a href="./marketplace.html" class="btn btn--primary">← Quay lại Marketplace</a>' +
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
        '<h2 class="ck-success-state__title">Đặt mua thành công!</h2>' +
        '<p class="ck-success-state__desc">Đơn hàng <strong>' + escapeHtml(order.orderId) + '</strong> đã được tạo. Chúng tôi sẽ liên hệ bạn sớm nhất.</p>' +
        '<div class="ck-success-state__actions">' +
          '<a href="./market-detail.html?id=' + encodeURIComponent(order.postId) + '" class="btn btn--secondary">Xem lại tin</a>' +
          '<a href="./marketplace.html" class="btn btn--primary">Marketplace</a>' +
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
      '<a href="./market-detail.html?id=' + encodeURIComponent(post.id) + '" class="ck-back">← Quay lại chi tiết tin</a>' +

      '<h1 class="section-title">Thanh toán đơn hàng</h1>' +
      '<p class="section-subtitle">Xác nhận thông tin mua xe và hoàn tất đặt hàng</p>' +

      '<div class="ck-layout">' +

        /* Order summary */
        '<div class="ck-summary">' +
          '<h2 class="ck-summary__heading">Thông tin xe</h2>' +
          '<div class="ck-summary__card">' +
            imageHtml +
            '<div class="ck-summary__info">' +
              '<span class="badge">' + escapeHtml(post.brand || 'N/A') + '</span>' +
              '<h3 class="ck-summary__title">' + escapeHtml(post.title) + '</h3>' +
              '<p class="ck-summary__price">' + formatPrice(post.price) + '</p>' +
              '<p class="ck-summary__meta">' + escapeHtml((post.year ? post.year + ' • ' : '') + (post.location || '')) + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +

        /* Checkout form */
        '<div class="ck-form-wrap">' +
          '<h2 class="ck-form-wrap__heading">Thông tin người mua</h2>' +
          '<form id="checkoutForm" novalidate>' +

            '<div class="input-group">' +
              '<label class="label" for="ckFullName">Họ tên <span class="ck-required">*</span></label>' +
              '<input type="text" class="input" id="ckFullName" placeholder="Nguyễn Văn A" autocomplete="name">' +
              '<span class="field-error" id="errFullName"></span>' +
            '</div>' +

            '<div class="input-group">' +
              '<label class="label" for="ckPhone">Số điện thoại <span class="ck-required">*</span></label>' +
              '<input type="tel" class="input" id="ckPhone" placeholder="0912345678" autocomplete="tel">' +
              '<span class="field-error" id="errPhone"></span>' +
            '</div>' +

            '<div class="input-group">' +
              '<label class="label" for="ckEmail">Email <span class="ck-required">*</span></label>' +
              '<input type="email" class="input" id="ckEmail" placeholder="example@email.com" autocomplete="email">' +
              '<span class="field-error" id="errEmail"></span>' +
            '</div>' +

            '<div class="input-group">' +
              '<label class="label" for="ckAddress">Địa chỉ nhận xe/chứng từ <span class="ck-required">*</span></label>' +
              '<textarea class="input" id="ckAddress" placeholder="Số nhà, đường, quận/huyện, tỉnh/TP" rows="3"></textarea>' +
              '<span class="field-error" id="errAddress"></span>' +
            '</div>' +

            '<div class="input-group">' +
              '<label class="label" for="ckPayment">Phương thức thanh toán <span class="ck-required">*</span></label>' +
              '<select class="input" id="ckPayment">' +
                '<option value="">-- Chọn phương thức --</option>' +
                '<option value="bank_transfer">Chuyển khoản ngân hàng</option>' +
                '<option value="cash">Thanh toán tiền mặt khi nhận xe</option>' +
                '<option value="installment">Trả góp qua ngân hàng</option>' +
                '<option value="crypto">Thanh toán qua ví điện tử</option>' +
              '</select>' +
              '<span class="field-error" id="errPayment"></span>' +
            '</div>' +

            '<div class="input-group">' +
              '<label class="label" for="ckNote">Ghi chú (tùy chọn)</label>' +
              '<textarea class="input" id="ckNote" placeholder="Ghi chú thêm cho đơn hàng..." rows="2"></textarea>' +
            '</div>' +

            '<div class="ck-form-wrap__actions">' +
              '<button type="submit" class="btn btn--primary btn--lg" id="btnSubmitOrder">🛒 Đặt mua</button>' +
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
      showToast('Tin rao không còn tồn tại.', 'error');
      return;
    }
    if (freshPost.status === 'pending') {
      showToast('Tin rao này đã được đặt mua bởi người khác.', 'error');
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
      showToast('Không thể cập nhật trạng thái tin. Vui lòng thử lại.', 'error');
      return;
    }

    // Step 2: Save order
    var orderSaved = saveOrder(order);
    if (!orderSaved) {
      // Rollback post status
      Marketplace.updatePost(currentPostId, { status: 'available' });
      showToast('Không thể lưu đơn hàng. Vui lòng thử lại.', 'error');
      return;
    }

    // Success
    renderSuccess(order);

    // --- Phase 10: Trigger notifications ---
    if (typeof Notifications !== 'undefined') {
      // Notification for buyer
      if (order.buyerUserEmail) {
        Notifications.addNotification({
          userKey: order.buyerUserEmail,
          type: 'order_success',
          title: 'Đặt mua thành công!',
          message: 'Đơn hàng ' + order.orderId + ' cho "' + (freshPost.title || '') + '" đã được tạo.',
          link: './market-detail.html?id=' + encodeURIComponent(order.postId),
          metadata: { orderId: order.orderId, postId: order.postId }
        });
      }
      // Notification for seller (post status change)
      if (freshPost.ownerEmail && freshPost.ownerEmail !== (order.buyerUserEmail || '')) {
        Notifications.addNotification({
          userKey: freshPost.ownerEmail,
          type: 'post_status_change',
          title: 'Có đơn mua mới',
          message: 'Xe "' + (freshPost.title || '') + '" đã được đặt mua bởi ' + (order.buyer.fullName || 'một người dùng') + '.',
          link: './market-detail.html?id=' + encodeURIComponent(order.postId),
          metadata: { orderId: order.orderId, postId: order.postId }
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
      renderError('Thiếu thông tin tin rao', 'Không tìm thấy mã tin rao trong URL. Vui lòng quay lại marketplace và chọn xe cần mua.');
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
      renderError('Tin rao không tồn tại', 'Tin rao bạn đang cố mua không tồn tại hoặc đã bị xóa.');
      return;
    }

    // Post already pending
    if (currentPost.status === 'pending') {
      renderError('Tin rao không khả dụng', 'Tin rao này đang trong trạng thái chờ xử lý và không thể đặt mua.');
      return;
    }

    // Render checkout
    renderCheckout(currentPost);
  }

  return { init: init };
})();
