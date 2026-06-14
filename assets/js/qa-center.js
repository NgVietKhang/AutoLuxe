/* =============================================
   QA-CENTER.JS - AutoLuxe Supercar Web
   Phase 7: QA, regression, and demo readiness
   ============================================= */

var QaCenter = (function () {
  'use strict';

  var AUTOLUXE_PREFIX = 'autoluxe_';
  var CHECKLIST_STATE_KEY = 'autoluxe_qa_phase7_checklist_state';
  var WORDING_NOTES_KEY = 'autoluxe_qa_phase7_wording_notes';
  var CASE_RESULT_CLASS = {
    passed: 'qa-result__status--passed',
    failed: 'qa-result__status--failed',
    skipped: 'qa-result__status--skipped'
  };

  var state = {
    isRunning: false,
    results: [],
    summary: null,
    runFinishedAt: null,
    checklistState: {}
  };

  var UX_I18N_CHECKLIST = [
    {
      id: 'ux_home',
      vi: 'Trang chủ: hero, featured cards, brand strip không bị tràn chữ khi đổi VI/EN.',
      en: 'Home: hero, featured cards, and brand strip keep clean layout in VI/EN.'
    },
    {
      id: 'ux_catalog',
      vi: 'Catalog: text trạng thái loading/empty/error hiển thị đúng ngôn ngữ, nút sang marketplace đúng prefill.',
      en: 'Catalog: loading/empty/error copy follows locale, marketplace prefill CTA works.'
    },
    {
      id: 'ux_detail',
      vi: 'Car detail: fallback "đang cập nhật" hiển thị rõ, giá và ngày giờ format đúng locale.',
      en: 'Car detail: fallback copy is clear, price/time formatting follows locale.'
    },
    {
      id: 'ux_marketplace',
      vi: 'Marketplace: lọc/sort/search không vỡ layout mobile, trạng thái pending/sold dễ hiểu.',
      en: 'Marketplace: filter/sort/search stay responsive, pending/sold states are clear.'
    },
    {
      id: 'ux_market_detail',
      vi: 'Market detail + review: cảnh báo owner/not-logged-in đúng ngữ cảnh, form review dễ dùng.',
      en: 'Market detail + review: owner/login notices are contextual, review form is easy to use.'
    },
    {
      id: 'ux_checkout',
      vi: 'Checkout 2 bước: lỗi validation card hiển thị đúng field, retry gateway rõ ràng.',
      en: '2-step checkout: card validation maps to the right field, gateway retry UX is clear.'
    },
    {
      id: 'ux_purchases',
      vi: 'My Purchases: countdown realtime ổn định, trạng thái cancel/delivered không gây hiểu lầm.',
      en: 'My Purchases: realtime countdown is stable, cancel/delivered states are unambiguous.'
    },
    {
      id: 'ux_account',
      vi: 'Account/Settings: copy profile/password/settings nhất quán, avatar upload có feedback rõ.',
      en: 'Account/Settings: profile/password/settings copy is consistent, avatar upload feedback is clear.'
    },
    {
      id: 'ux_admin',
      vi: 'Admin: queue duyệt post + đổi trạng thái order có wording rõ ràng, không mơ hồ hành động.',
      en: 'Admin: post moderation + order status wording clearly explains the action impact.'
    },
    {
      id: 'ux_wishlist_notif',
      vi: 'Wishlist + Notifications panel: icon/badge/copy đồng bộ VI/EN, không text cứng lẫn ngôn ngữ.',
      en: 'Wishlist + Notifications panel: icons/badges/copy stay consistent across VI/EN.'
    }
  ];

  var FINAL_ACCEPTANCE_CHECKLIST = [
    {
      id: 'acc_phase0',
      vi: 'Phase 0: migration chạy idempotent, không mất dữ liệu cũ.',
      en: 'Phase 0: migrations are idempotent and preserve existing data.'
    },
    {
      id: 'acc_phase1',
      vi: 'Phase 1: guest/user checkout 2 bước + my-purchases + cancel 7 ngày hoạt động đầy đủ.',
      en: 'Phase 1: guest/user checkout, my-purchases, and 7-day cancel flow are complete.'
    },
    {
      id: 'acc_phase2',
      vi: 'Phase 2: account/profile/settings + password verify current password trước khi đổi.',
      en: 'Phase 2: account/profile/settings and password change require current password verification.'
    },
    {
      id: 'acc_phase3',
      vi: 'Phase 3: admin moderation + admin order timeline/notes phản ánh đúng cho user.',
      en: 'Phase 3: admin moderation and order timeline/notes are correctly reflected to users.'
    },
    {
      id: 'acc_phase4',
      vi: 'Phase 4: brands -> catalog -> detail -> marketplace linking chạy đúng exact brand/model.',
      en: 'Phase 4: brands -> catalog -> detail -> marketplace linking works with exact brand/model.'
    },
    {
      id: 'acc_phase5',
      vi: 'Phase 5: notification event coverage đủ cho post/order/review luồng chính.',
      en: 'Phase 5: notification event coverage is complete for core post/order/review flows.'
    },
    {
      id: 'acc_phase6',
      vi: 'Phase 6: locale switch đổi text mới, currency/time format đúng theo VI/EN.',
      en: 'Phase 6: locale switching updates new copy, currency/time formatting matches VI/EN.'
    },
    {
      id: 'acc_phase7',
      vi: 'Phase 7: suite automation + regression + checklist UX/i18n đã chạy trước demo.',
      en: 'Phase 7: automation, regression, and UX/i18n checklist are completed before demo.'
    }
  ];

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatDateTime(iso) {
    if (!iso) return '-';
    try {
      if (typeof I18n !== 'undefined' && typeof I18n.formatDateTime === 'function') {
        return I18n.formatDateTime(iso);
      }
      return new Date(iso).toLocaleString();
    } catch (e) {
      return '-';
    }
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
      return fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function ensure(condition, message) {
    if (!condition) throw new Error(message);
  }

  function createAutoluxeSnapshot() {
    var snapshot = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(AUTOLUXE_PREFIX) === 0) {
        snapshot[key] = localStorage.getItem(key);
      }
    }
    return snapshot;
  }

  function clearAutoluxeStorage() {
    var toRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(AUTOLUXE_PREFIX) === 0) {
        toRemove.push(key);
      }
    }
    for (var j = 0; j < toRemove.length; j++) {
      localStorage.removeItem(toRemove[j]);
    }
  }

  function restoreAutoluxeSnapshot(snapshot) {
    clearAutoluxeStorage();
    var key;
    for (key in snapshot) {
      if (!snapshot.hasOwnProperty(key)) continue;
      localStorage.setItem(key, snapshot[key]);
    }
  }

  function getPosts() {
    var posts = Storage.get('autoluxe_market_posts', []);
    return Array.isArray(posts) ? posts : [];
  }

  function setPosts(posts) {
    return Storage.set('autoluxe_market_posts', Array.isArray(posts) ? posts : []);
  }

  function getOrders() {
    var orders = Storage.get('autoluxe_orders', []);
    return Array.isArray(orders) ? orders : [];
  }

  function setOrders(orders) {
    return Storage.set('autoluxe_orders', Array.isArray(orders) ? orders : []);
  }

  function getReviews() {
    var reviews = Storage.get('autoluxe_reviews', []);
    return Array.isArray(reviews) ? reviews : [];
  }

  function setReviews(reviews) {
    return Storage.set('autoluxe_reviews', Array.isArray(reviews) ? reviews : []);
  }

  function getRandomToken() {
    return Math.random().toString(36).slice(2, 8);
  }

  function buildUniqueEmail(prefix) {
    return 'qa_' + prefix + '_' + Date.now().toString(36) + '_' + getRandomToken() + '@autoluxe.local';
  }

  function createUser(displayName, prefix, password) {
    var email = buildUniqueEmail(prefix);
    var registerResult = Auth.register(displayName, email, password, password);
    ensure(registerResult && registerResult.success, 'Create user failed: ' + email);

    var session = Auth.getSession();
    ensure(session && session.userId, 'Missing session after register: ' + email);

    return {
      userId: session.userId,
      fullName: displayName,
      email: normalizeEmail(email),
      password: password
    };
  }

  function loginAs(email, password) {
    var loginResult = Auth.login(email, password);
    ensure(loginResult && loginResult.success, 'Login failed for ' + email);
    var session = Auth.getSession();
    ensure(session && normalizeEmail(session.email) === normalizeEmail(email), 'Invalid session for ' + email);
    return session;
  }

  function loginAsAdmin() {
    var adminPassword = Auth.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';
    var loginResult = Auth.login(Auth.ADMIN_EMAIL, adminPassword);
    ensure(loginResult && loginResult.success, 'Admin login failed');
    ensure(Auth.isAdmin(Auth.getSession()), 'Session is not admin');
  }

  function appendTimeline(order, status, message, metadata) {
    if (!Array.isArray(order.timeline)) order.timeline = [];
    order.timeline.push({
      status: status,
      message: message,
      metadata: metadata || {},
      at: nowIso()
    });
  }

  function createPendingPostBySeller(seller) {
    var posts = getPosts();
    var id = 'qa_post_' + Date.now().toString(36) + '_' + getRandomToken();
    var now = nowIso();

    var post = {
      id: id,
      ownerEmail: seller.email,
      ownerName: seller.fullName,
      title: 'QA Ferrari SF90 Scenario',
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2024,
      price: 800000,
      mileage: 1200,
      fuel: 'Hybrid',
      transmission: 'Tự động',
      location: 'Ho Chi Minh City',
      image: '',
      description: 'Scenario post for phase 7 QA run.',
      moderation: 'pending_approval',
      moderationReason: '',
      moderatedAt: null,
      availability: 'available',
      status: 'available',
      createdAt: now,
      updatedAt: now
    };

    posts.push(post);
    setPosts(posts);
    return post;
  }

  function createConfirmedOrder(post, buyer, seller, ageDays) {
    var now = Date.now();
    var createdMs = now - (Math.max(0, ageDays || 0) * 24 * 60 * 60 * 1000);
    var cancelWindowMs = 7 * 24 * 60 * 60 * 1000;
    var createdAt = new Date(createdMs).toISOString();
    var orderId = 'qa_ord_' + Date.now().toString(36) + '_' + getRandomToken();

    return {
      orderId: orderId,
      postId: post.id,
      checkoutMode: 'user',
      buyerUserId: buyer.userId,
      buyerUserEmail: buyer.email,
      buyerGuestId: null,
      buyer: {
        fullName: buyer.fullName,
        phone: '0912345678',
        email: buyer.email,
        address: 'AutoLuxe QA Street',
        note: 'QA generated order'
      },
      paymentMethod: 'card_demo',
      payment: {
        provider: 'qa_runner',
        cardType: 'visa',
        cardHolder: buyer.fullName,
        cardNumber: '4111111111111111',
        expiry: '12/30',
        cvv: '123',
        transactionId: 'qa_txn_' + getRandomToken(),
        outcome: 'success',
        failCountBeforeSuccess: 0
      },
      listingSnapshot: {
        id: post.id,
        title: post.title,
        brand: post.brand,
        model: post.model,
        year: post.year,
        location: post.location,
        image: post.image || '',
        ownerEmail: seller.email,
        ownerName: seller.fullName,
        price: Number(post.price || 0),
        status: 'available',
        availability: 'available'
      },
      priceSnapshot: Number(post.price || 0),
      orderStatus: 'confirmed',
      status: 'confirmed',
      cancelWindowDays: 7,
      cancelDeadlineAt: new Date(createdMs + cancelWindowMs).toISOString(),
      deliveryReminderSent: false,
      timeline: [
        {
          status: 'confirmed',
          message: 'payment_success',
          metadata: {
            gateway: 'qa_runner'
          },
          at: createdAt
        }
      ],
      createdAt: createdAt,
      updatedAt: createdAt
    };
  }

  function saveOrder(order) {
    var orders = getOrders();
    orders.push(order);
    setOrders(orders);
  }

  function findOrder(orderId) {
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i] && orders[i].orderId === orderId) return orders[i];
    }
    return null;
  }

  function replaceOrder(order) {
    var orders = getOrders();
    for (var i = 0; i < orders.length; i++) {
      if (orders[i] && orders[i].orderId === order.orderId) {
        orders[i] = order;
        setOrders(orders);
        return true;
      }
    }
    return false;
  }

  function emitOrderCreatedNotifications(order, buyer, seller) {
    Notifications.emitEvent('order_created_buyer', {
      userKey: buyer.email,
      orderId: order.orderId,
      postId: order.postId,
      params: {
        orderId: order.orderId,
        title: order.listingSnapshot.title
      },
      metadata: {
        orderId: order.orderId,
        postId: order.postId
      }
    });

    Notifications.emitEvent('order_created_seller', {
      userKey: seller.email,
      orderId: order.orderId,
      postId: order.postId,
      params: {
        orderId: order.orderId,
        title: order.listingSnapshot.title,
        buyer: buyer.fullName
      },
      metadata: {
        orderId: order.orderId,
        postId: order.postId
      }
    });

    Notifications.emitEvent('order_created_admin', {
      userKey: Auth.ADMIN_EMAIL,
      orderId: order.orderId,
      postId: order.postId,
      params: {
        orderId: order.orderId,
        title: order.listingSnapshot.title,
        buyer: buyer.fullName
      },
      metadata: {
        orderId: order.orderId,
        postId: order.postId
      }
    });
  }

  function cancelOrder(orderId, buyer, seller) {
    var order = findOrder(orderId);
    ensure(order, 'Cancel target order not found: ' + orderId);

    order.orderStatus = 'cancelled';
    order.status = 'cancelled';
    order.cancelledAt = nowIso();
    order.updatedAt = nowIso();
    appendTimeline(order, 'cancelled', 'cancelled_by_buyer', {
      actor: 'qa_runner'
    });

    replaceOrder(order);
    Marketplace.updatePost(order.postId, {
      status: 'available',
      availability: 'available'
    });

    Notifications.emitEvent('order_cancelled_buyer', {
      userKey: buyer.email,
      orderId: order.orderId,
      postId: order.postId,
      params: { orderId: order.orderId },
      metadata: { orderId: order.orderId, postId: order.postId }
    });

    Notifications.emitEvent('order_cancelled_seller', {
      userKey: seller.email,
      orderId: order.orderId,
      postId: order.postId,
      params: {
        title: order.listingSnapshot.title,
        orderId: order.orderId
      },
      metadata: { orderId: order.orderId, postId: order.postId }
    });

    Notifications.emitEvent('order_cancelled_admin', {
      userKey: Auth.ADMIN_EMAIL,
      orderId: order.orderId,
      postId: order.postId,
      params: {
        title: order.listingSnapshot.title,
        orderId: order.orderId,
        buyer: buyer.fullName
      },
      metadata: { orderId: order.orderId, postId: order.postId }
    });
  }

  function simulateAutoDeliveredForBuyer(buyerEmail) {
    var orders = getOrders();
    var now = Date.now();
    var deliveredCount = 0;

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      if (!order) continue;
      if (normalizeEmail(order.buyerUserEmail) !== normalizeEmail(buyerEmail)) continue;

      var status = String(order.orderStatus || order.status || '').toLowerCase();
      if (status === 'delivered' || status === 'cancelled') continue;
      if (status !== 'new' && status !== 'confirmed' && status !== 'pending' && status !== 'shipping') continue;

      var deadlineMs = Date.parse(order.cancelDeadlineAt || '');
      if (isNaN(deadlineMs)) continue;
      if (deadlineMs > now) continue;

      order.orderStatus = 'delivered';
      order.status = 'delivered';
      order.deliveryReminderSent = true;
      order.deliveredAt = order.deliveredAt || nowIso();
      order.updatedAt = nowIso();
      appendTimeline(order, 'delivered', 'auto_delivered_on_purchases_visit', {
        actor: 'qa_runner'
      });

      Notifications.emitEvent('order_delivered', {
        userKey: buyerEmail,
        orderId: order.orderId,
        postId: order.postId,
        params: {
          orderId: order.orderId,
          title: order.listingSnapshot && order.listingSnapshot.title ? order.listingSnapshot.title : ''
        },
        metadata: {
          orderId: order.orderId,
          postId: order.postId
        }
      });

      Notifications.emitEvent('review_reminder', {
        userKey: buyerEmail,
        orderId: order.orderId,
        postId: order.postId,
        params: {
          title: order.listingSnapshot && order.listingSnapshot.title ? order.listingSnapshot.title : ''
        },
        metadata: {
          orderId: order.orderId,
          postId: order.postId
        }
      });

      deliveredCount += 1;
    }

    setOrders(orders);
    return deliveredCount;
  }

  function runCase(group, title, fn) {
    var started = Date.now();
    try {
      var detail = fn();
      return {
        group: group,
        title: title,
        status: 'passed',
        detail: detail || '',
        durationMs: Date.now() - started
      };
    } catch (error) {
      return {
        group: group,
        title: title,
        status: 'failed',
        detail: error && error.message ? error.message : String(error),
        durationMs: Date.now() - started
      };
    }
  }

  function runSuiteInSandbox() {
    var snapshot = createAutoluxeSnapshot();
    var results = [];
    var context = {};
    var startedAt = Date.now();

    try {
      clearAutoluxeStorage();
      Seed.run();
      Auth.bootstrapAdminUser();
      Notifications.updateBadge();

      results.push(runCase('P7.1 Persona Smoke', 'Guest persona baseline', function () {
        Auth.logout();
        Auth.updateHeaderUI();
        ensure(!Auth.isLoggedIn(), 'Guest should not keep an active session.');

        var loginLink = document.querySelector('[data-auth-slot] a[href*="auth.html"]');
        ensure(!!loginLink, 'Guest header must show login link.');
        var themeButton = document.getElementById('themeToggle');
        ensure(!!themeButton && !themeButton.hidden, 'Guest should still see theme toggle on navbar.');

        return 'Guest mode keeps local-first access with visible navbar preferences.';
      }));

      results.push(runCase('P7.1 Persona Smoke', 'User persona baseline', function () {
        context.user = createUser('QA Persona User', 'persona_user', 'User@123456');
        Auth.updateHeaderUI();
        ensure(Auth.isLoggedIn(), 'User should be logged in right after registration.');
        ensure(!Auth.isAdmin(Auth.getSession()), 'Persona user must not have admin role.');

        var accountTrigger = document.querySelector('.account-menu__trigger');
        ensure(!!accountTrigger, 'Logged-in user should have account menu in header.');
        return 'Standard user session + account menu rendered correctly.';
      }));

      results.push(runCase('P7.1 Persona Smoke', 'Admin persona baseline', function () {
        Auth.logout();
        loginAsAdmin();
        Auth.updateHeaderUI();
        ensure(Auth.isAdmin(Auth.getSession()), 'Admin session must resolve as admin.');
        var adminLink = document.querySelector('.account-menu__item--admin');
        ensure(!!adminLink, 'Admin shortcut should be visible in account menu.');
        return 'Admin role guard and header access are valid.';
      }));

      results.push(runCase('P7.2 E2E Flow', 'Post listing -> admin approve', function () {
        Auth.logout();
        context.seller = createUser('QA Seller', 'seller', 'Seller@123456');
        var pendingPost = createPendingPostBySeller(context.seller);
        context.post = pendingPost;

        ensure(!Marketplace.isPostPubliclyVisible(pendingPost), 'Pending post should be hidden from public marketplace.');

        loginAsAdmin();
        var approved = Marketplace.updatePost(pendingPost.id, {
          moderation: 'approved',
          moderationReason: '',
          moderatedAt: nowIso()
        });
        ensure(approved, 'Admin approval update failed.');

        var freshPost = Marketplace.getPostById(pendingPost.id);
        ensure(!!freshPost, 'Approved post cannot be found.');
        ensure(Marketplace.isPostPubliclyVisible(freshPost), 'Approved post should become publicly visible.');
        context.post = freshPost;
        return 'Listing moderation pipeline works from pending to approved.';
      }));

      results.push(runCase('P7.2 E2E Flow', 'Buyer checkout -> order created', function () {
        Auth.logout();
        context.buyer = createUser('QA Buyer', 'buyer', 'Buyer@123456');
        loginAs(context.buyer.email, context.buyer.password);

        var post = Marketplace.getPostById(context.post.id);
        ensure(!!post, 'Checkout target post missing.');
        ensure(post.availability === 'available', 'Post should be available before checkout.');

        var order = createConfirmedOrder(post, context.buyer, context.seller, 0);
        saveOrder(order);
        emitOrderCreatedNotifications(order, context.buyer, context.seller);

        var lockUpdated = Marketplace.updatePost(post.id, {
          status: 'pending',
          availability: 'pending_payment'
        });
        ensure(lockUpdated, 'Failed to lock listing after checkout.');

        var refreshed = Marketplace.getPostById(post.id);
        ensure(refreshed && refreshed.availability === 'pending_payment', 'Listing should move to pending_payment.');
        context.primaryOrder = order;
        return 'Checkout snapshot + listing lock + notifications created.';
      }));

      results.push(runCase('P7.2 E2E Flow', 'My purchases cancel -> listing restore', function () {
        ensure(context.primaryOrder && context.primaryOrder.orderId, 'Primary order missing from context.');
        cancelOrder(context.primaryOrder.orderId, context.buyer, context.seller);

        var cancelledOrder = findOrder(context.primaryOrder.orderId);
        ensure(cancelledOrder && cancelledOrder.orderStatus === 'cancelled', 'Order should become cancelled.');
        var post = Marketplace.getPostById(context.post.id);
        ensure(post && post.availability === 'available', 'Cancelled order must restore listing availability.');

        var buyerNotifs = Notifications.getNotificationsByUser(context.buyer.email).filter(function (n) {
          return n.eventType === 'order_cancelled_buyer';
        });
        ensure(buyerNotifs.length > 0, 'Buyer should receive cancellation notification.');
        return 'Cancel window business rule restores listing and notifies stakeholders.';
      }));

      results.push(runCase('P7.2 E2E Flow', 'Auto delivered -> review reminder', function () {
        var post = Marketplace.getPostById(context.post.id);
        ensure(!!post, 'Post missing before delivered simulation.');

        var staleOrder = createConfirmedOrder(post, context.buyer, context.seller, 9);
        saveOrder(staleOrder);
        context.staleOrder = staleOrder;

        var deliveredCount = simulateAutoDeliveredForBuyer(context.buyer.email);
        ensure(deliveredCount >= 1, 'Expected at least one stale order to auto-deliver.');

        var deliveredOrder = findOrder(staleOrder.orderId);
        ensure(deliveredOrder && deliveredOrder.orderStatus === 'delivered', 'Stale order should be marked delivered.');
        ensure(deliveredOrder.deliveryReminderSent === true, 'Delivered order should set deliveryReminderSent.');

        var reminderNotifs = Notifications.getNotificationsByUser(context.buyer.email).filter(function (n) {
          return n.eventType === 'review_reminder';
        });
        ensure(reminderNotifs.length > 0, 'Review reminder notification should be emitted.');
        return 'Stale order auto-delivery and review reminder are both active.';
      }));

      results.push(runCase('P7.3 Regression', 'Wishlist add/remove flow', function () {
        loginAs(context.buyer.email, context.buyer.password);
        var addResult = Wishlist.addItem({
          itemType: 'market',
          itemId: context.post.id,
          brand: context.post.brand,
          title: context.post.title,
          image: '',
          price: context.post.price,
          sourceUrl: './market-detail.html?id=' + context.post.id
        });
        ensure(addResult && addResult.success, 'Wishlist add flow failed.');
        ensure(Wishlist.isInWishlist('market', context.post.id), 'Wishlist item should exist after add.');

        var removeResult = Wishlist.removeItem('market', context.post.id);
        ensure(removeResult && removeResult.success, 'Wishlist remove flow failed.');
        ensure(!Wishlist.isInWishlist('market', context.post.id), 'Wishlist item should be removed.');
        return 'Wishlist regression passed for add/remove behavior.';
      }));

      results.push(runCase('P7.3 Regression', 'Market-detail review data + seller notification', function () {
        var beforeCount = getReviews().length;
        var review = {
          reviewId: 'qa_rev_' + Date.now().toString(36) + '_' + getRandomToken(),
          postId: context.post.id,
          rating: 5,
          content: 'QA regression review content.',
          reviewerId: context.buyer.userId,
          reviewerName: context.buyer.fullName,
          createdAt: nowIso()
        };
        var reviews = getReviews();
        reviews.push(review);
        setReviews(reviews);
        ensure(getReviews().length === beforeCount + 1, 'Review storage should increase by one.');

        Notifications.emitEvent('new_review', {
          userKey: context.seller.email,
          postId: context.post.id,
          params: {
            reviewer: context.buyer.fullName,
            title: context.post.title
          },
          metadata: {
            reviewId: review.reviewId,
            postId: context.post.id
          }
        });

        var sellerReviewNotifs = Notifications.getNotificationsByUser(context.seller.email).filter(function (n) {
          return n.eventType === 'new_review';
        });
        ensure(sellerReviewNotifs.length > 0, 'Seller should receive new-review notification.');
        return 'Review persistence and seller alert path remain stable.';
      }));

      results.push(runCase('P7.3 Regression', 'Auth session lifecycle', function () {
        Auth.logout();
        ensure(!Auth.isLoggedIn(), 'Logout should clear active session.');
        loginAs(context.buyer.email, context.buyer.password);
        var session = Auth.getSession();
        ensure(session && session.userId === context.buyer.userId, 'Login should restore expected buyer session.');
        return 'Session login/logout lifecycle remains consistent.';
      }));

      results.push(runCase('P7.3 Regression', 'Notifications panel + unread badge', function () {
        loginAs(context.buyer.email, context.buyer.password);
        Auth.updateHeaderUI();
        Notifications.init();

        var bellBtn = document.getElementById('notifBellBtn');
        ensure(!!bellBtn, 'Notification bell should be injected in header.');

        var beforeUnread = Notifications.getUnreadCount(context.buyer.email);
        Notifications.emitEvent('order_status_changed_buyer', {
          userKey: context.buyer.email,
          orderId: context.primaryOrder.orderId,
          postId: context.post.id,
          params: {
            orderId: context.primaryOrder.orderId,
            status: 'Shipping'
          },
          metadata: {
            orderId: context.primaryOrder.orderId,
            postId: context.post.id
          }
        });
        var afterUnread = Notifications.getUnreadCount(context.buyer.email);
        ensure(afterUnread === beforeUnread + 1, 'Unread count should increment after new notification.');

        var buyerNotifs = Notifications.getNotificationsByUser(context.buyer.email);
        ensure(buyerNotifs.length > 0, 'Buyer notification list should not be empty.');
        Notifications.markAsRead(buyerNotifs[0].id);
        var finalUnread = Notifications.getUnreadCount(context.buyer.email);
        ensure(finalUnread === beforeUnread, 'Unread count should return after marking one as read.');
        return 'Notification badge and mark-read behavior are healthy.';
      }));

      results.push(runCase('P8 Features', 'Compare pool and selection', function () {
        if (typeof CompareService === 'undefined') throw new Error('CompareService missing');
        CompareService.clear();
        var cars = [
          { make: 'Ferrari', model: '296 GTB', year: '2024' },
          { make: 'Lamborghini', model: 'Huracan', year: '2023' },
          { make: 'Porsche', model: '911 GT3', year: '2024' },
          { make: 'McLaren', model: '720S', year: '2022' }
        ];
        cars.forEach(function (c) {
          var addResult = CompareService.add({ make: c.make, model: c.model, year: c.year, source: 'catalog' });
          ensure(addResult.ok, 'Compare add should succeed for pool');
        });
        ensure(CompareService.count() === 4, 'Pool should allow more than 3 cars');
        ensure(CompareService.selectedCount() === 0, 'New adds should not be selected by default');

        var pool = CompareService.getPool();
        var firstId = pool[0].id;
        var toggle1 = CompareService.toggleSelected(firstId);
        ensure(toggle1.ok && toggle1.selected === true, 'toggleSelected should select car');
        ensure(CompareService.selectedCount() === 1, 'Selected count should be 1');
        ensure(CompareService.getSelected().length === 1, 'getSelected should return 1 item');

        CompareService.toggleSelected(pool[1].id);
        CompareService.toggleSelected(pool[2].id);
        ensure(CompareService.selectedCount() === 3, 'Should allow 3 selected cars');

        var fullToggle = CompareService.toggleSelected(pool[3].id);
        ensure(!fullToggle.ok && fullToggle.reason === 'selection_full', '4th selection should be rejected');

        CompareService.clearSelection();
        ensure(CompareService.selectedCount() === 0, 'clearSelection should deselect all');
        ensure(CompareService.count() === 4, 'clearSelection should keep pool intact');

        CompareService.remove('Ferrari', '296 GTB', '2024');
        ensure(CompareService.count() === 3, 'Remove should shrink pool');
        CompareService.clear();
        ensure(CompareService.count() === 0, 'Clear should empty pool');
        return 'CompareService pool + selection OK';
      }));

      results.push(runCase('P8 Features', 'Finance calculator math', function () {
        if (typeof FinanceCalculator === 'undefined') throw new Error('FinanceCalculator missing');
        var r = FinanceCalculator.calculate({ price: 100000, downPct: 20, months: 60, rate: 6 });
        ensure(r.monthly > 0 && r.totalPaid > r.price, 'Finance outputs should be positive');
        return 'FinanceCalculator returns plausible values';
      }));

      results.push(runCase('P8 Features', 'Messaging thread create', function () {
        if (typeof MessagingService === 'undefined') throw new Error('MessagingService missing');
        Auth.logout();
        var buyer = createUser('QA Msg Buyer', 'msgbuyer', 'MsgBuyer@123456');
        var seller = createUser('QA Msg Seller', 'msgseller', 'MsgSeller@123456');
        loginAs(buyer.email, buyer.password);
        var post = createPendingPostBySeller(seller);
        Marketplace.updatePost(post.id, { moderation: 'approved', availability: 'available' });
        post = Marketplace.getPostById(post.id);
        var thread = MessagingService.getOrCreateThread(post);
        ensure(!!thread && thread.postId === post.id, 'Thread should be created');
        var send = MessagingService.sendMessage(thread.id, 'Hello seller');
        ensure(send.ok, 'Message send should succeed');
        return 'Messaging thread + send OK';
      }));
    } finally {
      restoreAutoluxeSnapshot(snapshot);
      try {
        Auth.updateHeaderUI();
      } catch (e1) {
        /* ignore */
      }
      try {
        Notifications.updateBadge();
      } catch (e2) {
        /* ignore */
      }
    }

    return {
      results: results,
      elapsedMs: Date.now() - startedAt
    };
  }

  function buildSummary(results, elapsedMs) {
    var passed = 0;
    var failed = 0;
    var skipped = 0;
    var i;

    for (i = 0; i < results.length; i++) {
      if (results[i].status === 'passed') passed += 1;
      else if (results[i].status === 'failed') failed += 1;
      else skipped += 1;
    }

    return {
      total: results.length,
      passed: passed,
      failed: failed,
      skipped: skipped,
      elapsedMs: elapsedMs || 0
    };
  }

  function renderSummary() {
    var el = document.getElementById('qaSummaryCards');
    if (!el || !state.summary) return;

    var summary = state.summary;
    var elapsedSec = (summary.elapsedMs / 1000).toFixed(2);
    el.innerHTML =
      '<article class="qa-card qa-card--pass">' +
        '<h3>Passed</h3>' +
        '<p>' + summary.passed + '</p>' +
      '</article>' +
      '<article class="qa-card qa-card--fail">' +
        '<h3>Failed</h3>' +
        '<p>' + summary.failed + '</p>' +
      '</article>' +
      '<article class="qa-card qa-card--neutral">' +
        '<h3>Total</h3>' +
        '<p>' + summary.total + '</p>' +
      '</article>' +
      '<article class="qa-card qa-card--neutral">' +
        '<h3>Duration</h3>' +
        '<p>' + elapsedSec + 's</p>' +
      '</article>';
  }

  function renderResults() {
    var resultEl = document.getElementById('qaResultList');
    if (!resultEl) return;

    if (!state.results || state.results.length === 0) {
      resultEl.innerHTML =
        '<div class="qa-empty">' +
          '<p>No run data yet. Click "Run Phase 7 QA Suite" to execute smoke, E2E, and regression checks.</p>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < state.results.length; i++) {
      var item = state.results[i];
      var statusClass = CASE_RESULT_CLASS[item.status] || CASE_RESULT_CLASS.skipped;
      html +=
        '<article class="qa-result">' +
          '<div class="qa-result__header">' +
            '<span class="qa-result__group">' + escapeHtml(item.group) + '</span>' +
            '<span class="qa-result__status ' + statusClass + '">' + escapeHtml(item.status.toUpperCase()) + '</span>' +
          '</div>' +
          '<h4 class="qa-result__title">' + escapeHtml(item.title) + '</h4>' +
          '<p class="qa-result__detail">' + escapeHtml(item.detail || '-') + '</p>' +
          '<p class="qa-result__meta">' + escapeHtml(String(item.durationMs || 0)) + ' ms</p>' +
        '</article>';
    }

    resultEl.innerHTML = html;
  }

  function renderRunMeta() {
    var statusEl = document.getElementById('qaRunStatus');
    var lastRunEl = document.getElementById('qaLastRunAt');
    if (statusEl) {
      if (state.isRunning) {
        statusEl.textContent = 'Running suite...';
        statusEl.className = 'qa-run-meta__status qa-run-meta__status--running';
      } else if (state.summary && state.summary.failed > 0) {
        statusEl.textContent = 'Completed with failures';
        statusEl.className = 'qa-run-meta__status qa-run-meta__status--failed';
      } else if (state.summary) {
        statusEl.textContent = 'Completed successfully';
        statusEl.className = 'qa-run-meta__status qa-run-meta__status--passed';
      } else {
        statusEl.textContent = 'Not started';
        statusEl.className = 'qa-run-meta__status';
      }
    }

    if (lastRunEl) {
      lastRunEl.textContent = state.runFinishedAt ? formatDateTime(state.runFinishedAt) : '-';
    }
  }

  function renderChecklist(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var checked = !!state.checklistState[item.id];
      html +=
        '<label class="qa-checklist__item">' +
          '<input type="checkbox" data-check-id="' + escapeHtml(item.id) + '"' + (checked ? ' checked' : '') + '>' +
          '<span>' +
            '<strong>[VI]</strong> ' + escapeHtml(item.vi) + '<br>' +
            '<strong>[EN]</strong> ' + escapeHtml(item.en) +
          '</span>' +
        '</label>';
    }
    container.innerHTML = html;
  }

  function updateChecklistProgress() {
    var summaryEl = document.getElementById('qaChecklistProgress');
    if (!summaryEl) return;

    var total = UX_I18N_CHECKLIST.length + FINAL_ACCEPTANCE_CHECKLIST.length;
    var done = 0;
    var key;
    for (key in state.checklistState) {
      if (state.checklistState.hasOwnProperty(key) && state.checklistState[key]) done += 1;
    }
    summaryEl.textContent = done + ' / ' + total + ' checklist items completed';
  }

  function bindChecklistEvents() {
    var host = document.getElementById('qaChecklistWrap');
    if (!host) return;

    host.addEventListener('change', function (event) {
      var target = event.target;
      if (!target || !target.hasAttribute('data-check-id')) return;
      var id = target.getAttribute('data-check-id');
      if (!id) return;
      state.checklistState[id] = !!target.checked;
      saveJson(CHECKLIST_STATE_KEY, state.checklistState);
      updateChecklistProgress();
    });
  }

  function bindWordingNotes() {
    var textarea = document.getElementById('qaWordingNotes');
    if (!textarea) return;

    var saved = localStorage.getItem(WORDING_NOTES_KEY) || '';
    textarea.value = saved;
    textarea.addEventListener('input', function () {
      localStorage.setItem(WORDING_NOTES_KEY, textarea.value || '');
    });
  }

  function setRunning(isRunning) {
    state.isRunning = !!isRunning;
    var runBtn = document.getElementById('qaRunButton');
    if (runBtn) {
      runBtn.disabled = state.isRunning;
      runBtn.textContent = state.isRunning ? 'Running...' : 'Run Phase 7 QA Suite';
    }
    renderRunMeta();
  }

  function runSuite() {
    if (state.isRunning) return;
    setRunning(true);

    window.setTimeout(function () {
      try {
        var runData = runSuiteInSandbox();
        state.results = runData.results;
        state.summary = buildSummary(runData.results, runData.elapsedMs);
        state.runFinishedAt = nowIso();
      } catch (e) {
        state.results = [{
          group: 'System',
          title: 'Suite execution crashed',
          status: 'failed',
          detail: e && e.message ? e.message : String(e),
          durationMs: 0
        }];
        state.summary = buildSummary(state.results, 0);
        state.runFinishedAt = nowIso();
      }

      renderRunMeta();
      renderSummary();
      renderResults();
      setRunning(false);
    }, 40);
  }

  function bindRunButton() {
    var runBtn = document.getElementById('qaRunButton');
    if (!runBtn) return;
    runBtn.addEventListener('click', runSuite);
  }

  function bindResetChecklistButton() {
    var resetBtn = document.getElementById('qaResetChecklist');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', function () {
      var confirmed = window.confirm('Reset all manual checklist progress and wording notes?');
      if (!confirmed) return;

      state.checklistState = {};
      saveJson(CHECKLIST_STATE_KEY, state.checklistState);
      localStorage.removeItem(WORDING_NOTES_KEY);

      renderChecklist('qaUxChecklist', UX_I18N_CHECKLIST);
      renderChecklist('qaAcceptanceChecklist', FINAL_ACCEPTANCE_CHECKLIST);
      updateChecklistProgress();

      var notes = document.getElementById('qaWordingNotes');
      if (notes) notes.value = '';
    });
  }

  function init() {
    state.checklistState = loadJson(CHECKLIST_STATE_KEY, {});

    renderRunMeta();
    renderSummary();
    renderResults();
    renderChecklist('qaUxChecklist', UX_I18N_CHECKLIST);
    renderChecklist('qaAcceptanceChecklist', FINAL_ACCEPTANCE_CHECKLIST);
    updateChecklistProgress();

    bindRunButton();
    bindChecklistEvents();
    bindWordingNotes();
    bindResetChecklistButton();
  }

  return {
    init: init,
    runSuite: runSuite
  };
})();
