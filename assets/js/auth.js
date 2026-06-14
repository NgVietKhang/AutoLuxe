/* =============================================
   AUTH.JS - AutoLuxe Supercar Web
   Authentication: validation, register, login, logout, UI sync
   ============================================= */

var Auth = (function () {
  'use strict';

  var KEYS = {
    users: 'autoluxe_users',
    session: 'autoluxe_session',
    orders: 'autoluxe_orders',
    guestId: 'autoluxe_guest_id'
  };

  var ADMIN_EMAIL = 'admin@autoluxe.local';
  var ADMIN_DEFAULT_PASSWORD = 'Admin@123456';

  function normalizeEmail(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  function isAdminEmail(email) {
    return normalizeEmail(email) === normalizeEmail(ADMIN_EMAIL);
  }

  function getUserRole(user) {
    if (!user) return 'user';
    if (user.role === 'admin' || isAdminEmail(user.email)) return 'admin';
    return 'user';
  }

  function isAdmin(session) {
    if (!session) return false;
    if (session.role === 'admin') return true;
    return isAdminEmail(session.email);
  }

  /**
   * Ensure the single admin account exists (idempotent).
   */
  function bootstrapAdminUser() {
    var users = Storage.get(KEYS.users, []);
    if (!Array.isArray(users)) users = [];

    var adminEmail = normalizeEmail(ADMIN_EMAIL);
    var foundIndex = -1;

    for (var i = 0; i < users.length; i++) {
      if (users[i] && normalizeEmail(users[i].email) === adminEmail) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      users.push({
        id: 'admin_' + Date.now().toString(36),
        fullName: 'AutoLuxe Admin',
        email: adminEmail,
        password: ADMIN_DEFAULT_PASSWORD,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      Storage.set(KEYS.users, users);
      return;
    }

    if (users[foundIndex].role !== 'admin') {
      users[foundIndex].role = 'admin';
      Storage.set(KEYS.users, users);
    }
  }

  function buildSessionFromUser(user) {
    return {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      role: getUserRole(user),
      loginAt: new Date().toISOString()
    };
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function pushOrderTimeline(order, status, message, metadata) {
    if (!Array.isArray(order.timeline)) return;
    order.timeline.push({
      status: status,
      message: message,
      metadata: metadata || {},
      at: new Date().toISOString()
    });
  }

  function mergeGuestOrdersForSession(session) {
    if (!isObject(session) || !session.userId) return { changed: false, merged: 0 };

    var guestId = '';
    try {
      guestId = localStorage.getItem(KEYS.guestId) || '';
    } catch (e) {
      guestId = '';
    }

    var rawOrders = Storage.get(KEYS.orders, []);
    if (!Array.isArray(rawOrders) || rawOrders.length === 0) {
      return { changed: false, merged: 0 };
    }

    var userEmail = normalizeEmail(session.email);
    var changed = false;
    var mergedCount = 0;

    for (var i = 0; i < rawOrders.length; i++) {
      var order = rawOrders[i];
      if (!isObject(order)) continue;

      var belongsUserById = order.buyerUserId && order.buyerUserId === session.userId;
      var belongsUserByEmail = userEmail && normalizeEmail(order.buyerUserEmail) === userEmail;

      if (belongsUserById || belongsUserByEmail) {
        if (order.buyerUserId !== session.userId) {
          order.buyerUserId = session.userId;
          changed = true;
        }
        if (userEmail && normalizeEmail(order.buyerUserEmail) !== userEmail) {
          order.buyerUserEmail = userEmail;
          changed = true;
        }
        if (order.checkoutMode === 'guest') {
          order.checkoutMode = 'user';
          changed = true;
        }
        continue;
      }

      if (!guestId) continue;

      if (order.buyerGuestId !== guestId) continue;

      order.buyerUserId = session.userId;
      order.buyerUserEmail = userEmail || null;
      order.checkoutMode = 'user';
      order.updatedAt = new Date().toISOString();
      pushOrderTimeline(order, order.orderStatus || order.status || 'confirmed', 'guest_merged_after_login', {
        userId: session.userId,
        userEmail: userEmail || ''
      });

      if (isObject(order.buyer) && userEmail && !normalizeEmail(order.buyer.email)) {
        order.buyer.email = userEmail;
      }

      mergedCount += 1;
      changed = true;
    }

    if (changed) {
      Storage.set(KEYS.orders, rawOrders);
    }

    return { changed: changed, merged: mergedCount };
  }

  /* ===========================
     VALIDATION
     =========================== */

  function validateFullName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) return (typeof I18n !== 'undefined') ? I18n.t('val.required_name') : 'Vui lòng nhập tên hiển thị.';
    if (trimmed.length < 2) return (typeof I18n !== 'undefined') ? I18n.t('val.min_name') : 'Tên phải có ít nhất 2 ký tự.';
    return null;
  }

  function validateEmail(email) {
    var trimmed = (email || '').trim();
    if (!trimmed) return (typeof I18n !== 'undefined') ? I18n.t('val.required_email') : 'Vui lòng nhập email.';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return (typeof I18n !== 'undefined') ? I18n.t('val.invalid_email') : 'Email không đúng định dạng.';
    return null;
  }

  function validatePassword(password) {
    if (!password) return (typeof I18n !== 'undefined') ? I18n.t('val.required_password') : 'Vui lòng nhập mật khẩu.';
    if (password.length < 6) return (typeof I18n !== 'undefined') ? I18n.t('val.min_password') : 'Mật khẩu phải có ít nhất 6 ký tự.';
    return null;
  }

  function validateConfirmPassword(password, confirm) {
    if (!confirm) return (typeof I18n !== 'undefined') ? I18n.t('val.required_confirm') : 'Vui lòng xác nhận mật khẩu.';
    if (password !== confirm) return (typeof I18n !== 'undefined') ? I18n.t('val.password_mismatch') : 'Mật khẩu xác nhận không khớp.';
    return null;
  }

  /* ===========================
     REGISTER
     =========================== */

  /**
   * Register a new user.
   * Returns { success: true } or { success: false, error: string }
   */
  function register(fullName, email, password, confirmPassword) {
    // Trim inputs
    fullName = (fullName || '').trim();
    email = (email || '').trim().toLowerCase();

    // Validate all fields
    var errors = [];
    var nameErr = validateFullName(fullName);
    var emailErr = validateEmail(email);
    var passErr = validatePassword(password);
    var confirmErr = validateConfirmPassword(password, confirmPassword);

    if (nameErr) errors.push({ field: 'regName', message: nameErr });
    if (emailErr) errors.push({ field: 'regEmail', message: emailErr });
    if (passErr) errors.push({ field: 'regPassword', message: passErr });
    if (confirmErr) errors.push({ field: 'regConfirm', message: confirmErr });

    if (errors.length > 0) {
      return { success: false, errors: errors };
    }

    if (isAdminEmail(email)) {
      return {
        success: false,
        errors: [{
          field: 'regEmail',
          message: (typeof I18n !== 'undefined') ? I18n.t('val.admin_email_reserved') : 'Email admin được bảo lưu cho hệ thống.'
        }]
      };
    }

    // Check duplicate email
    var users = Storage.get(KEYS.users, []);
    var duplicate = users.some(function (u) {
      return normalizeEmail(u.email) === email;
    });
    if (duplicate) {
      return { success: false, errors: [{ field: 'regEmail', message: (typeof I18n !== 'undefined') ? I18n.t('val.email_duplicate') : 'Email này đã được đăng ký.' }] };
    }

    // Create user object
    var newUser = {
      id: generateId(),
      fullName: fullName,
      email: email,
      password: password,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Storage.set(KEYS.users, users);

    // Auto login after register
    var session = buildSessionFromUser(newUser);
    Storage.set(KEYS.session, session);
    mergeGuestOrdersForSession(session);

    return { success: true, user: newUser };
  }

  /* ===========================
     LOGIN
     =========================== */

  /**
   * Login with email and password.
   * Returns { success: true, session } or { success: false, errors: [] }
   */
  function login(email, password) {
    email = (email || '').trim().toLowerCase();

    var errors = [];
    var emailErr = validateEmail(email);
    var passErr = validatePassword(password);

    if (emailErr) errors.push({ field: 'loginEmail', message: emailErr });
    if (passErr) errors.push({ field: 'loginPassword', message: passErr });

    if (errors.length > 0) {
      return { success: false, errors: errors };
    }

    // Find user
    var users = Storage.get(KEYS.users, []);
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (normalizeEmail(users[i].email) === email) {
        user = users[i];
        break;
      }
    }

    if (!user) {
      return { success: false, errors: [{ field: 'loginEmail', message: (typeof I18n !== 'undefined') ? I18n.t('val.email_not_found') : 'Email chưa được đăng ký.' }] };
    }

    if (user.password !== password) {
      return { success: false, errors: [{ field: 'loginPassword', message: (typeof I18n !== 'undefined') ? I18n.t('val.wrong_password') : 'Mật khẩu không đúng.' }] };
    }

    var session = buildSessionFromUser(user);
    Storage.set(KEYS.session, session);
    mergeGuestOrdersForSession(session);

    if (typeof AutoLuxeData !== 'undefined' && typeof AutoLuxeData.syncOnLogin === 'function') {
      AutoLuxeData.syncOnLogin().catch(function () { /* remote stub until configured */ });
    }

    return { success: true, session: session };
  }

  /* ===========================
     LOGOUT
     =========================== */

  function logout() {
    Storage.remove(KEYS.session);
  }

  /* ===========================
     CHANGE PASSWORD
     =========================== */

  /**
   * Change password for the logged-in user (requires current password).
   */
  function changePassword(currentPassword, newPassword, confirmPassword) {
    var session = getSession();
    if (!session) {
      return { success: false, error: 'no_session' };
    }

    var errors = [];
    if (!currentPassword) {
      errors.push({ field: 'currentPassword', message: t('val.required_current_password') });
    }
    var newPassErr = validatePassword(newPassword);
    if (newPassErr) {
      errors.push({ field: 'newPassword', message: newPassErr });
    }
    var confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmErr) {
      errors.push({ field: 'confirmPassword', message: confirmErr });
    }

    if (errors.length > 0) {
      return { success: false, errors: errors };
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        errors: [{ field: 'newPassword', message: t('val.same_password') }]
      };
    }

    var users = Storage.get(KEYS.users, []);
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i] && users[i].id === session.userId) {
        userIndex = i;
        break;
      }
    }

    if (userIndex < 0) {
      return { success: false, error: 'user_not_found' };
    }

    if (users[userIndex].password !== currentPassword) {
      return {
        success: false,
        errors: [{ field: 'currentPassword', message: t('val.wrong_password') }]
      };
    }

    users[userIndex].password = newPassword;
    if (!Storage.set(KEYS.users, users)) {
      return { success: false, error: 'storage' };
    }

    return { success: true };
  }

  /* ===========================
     SESSION
     =========================== */

  function getSession() {
    var session = Storage.get(KEYS.session, null);
    if (!session || !session.userId) return session;

    if (!session.role) {
      var users = Storage.get(KEYS.users, []);
      if (Array.isArray(users)) {
        for (var i = 0; i < users.length; i++) {
          if (users[i] && users[i].id === session.userId) {
            session.role = getUserRole(users[i]);
            Storage.set(KEYS.session, session);
            break;
          }
        }
      }
      if (!session.role) {
        session.role = isAdminEmail(session.email) ? 'admin' : 'user';
      }
    }

    return session;
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  /* ===========================
     UI UPDATE (Header)
     =========================== */

  var accountMenuDocListenerBound = false;

  function t(key) {
    return (typeof I18n !== 'undefined') ? I18n.t(key) : key;
  }

  function getAccountPaths() {
    var isInPages = window.location.pathname.indexOf('/pages/') !== -1;
    return {
      auth: isInPages ? './auth.html' : './pages/auth.html',
      account: isInPages ? './account.html' : './pages/account.html',
      purchases: isInPages ? './my-purchases.html' : './pages/my-purchases.html',
      admin: isInPages ? './admin.html' : './pages/admin.html'
    };
  }

  function getHeaderDisplayMeta(session) {
    var displayName = session.fullName || '';
    var avatarUrl = '';

    if (typeof Account !== 'undefined') {
      displayName = Account.getDisplayName(session) || displayName;
      avatarUrl = Account.getAvatarDataUrl(session) || '';
    }

    var initials = (typeof Account !== 'undefined')
      ? Account.getDisplayInitials(displayName)
      : (displayName.charAt(0) || 'A').toUpperCase();

    return {
      displayName: displayName,
      avatarUrl: avatarUrl,
      initials: initials
    };
  }

  function closeAccountMenus() {
    var menus = document.querySelectorAll('.account-menu__dropdown.is-open');
    for (var i = 0; i < menus.length; i++) {
      menus[i].classList.remove('is-open');
    }
    var triggers = document.querySelectorAll('.account-menu__trigger.is-open');
    for (var j = 0; j < triggers.length; j++) {
      triggers[j].classList.remove('is-open');
      triggers[j].setAttribute('aria-expanded', 'false');
    }
  }

  function bindAccountMenuDocListener() {
    if (accountMenuDocListenerBound) return;
    accountMenuDocListenerBound = true;

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.account-menu')) {
        closeAccountMenus();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAccountMenus();
    });
  }

  function renderLoggedInHeader(authSlot, session) {
    var paths = getAccountPaths();
    var meta = getHeaderDisplayMeta(session);

    var menu = document.createElement('div');
    menu.className = 'account-menu';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'account-menu__trigger';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', t('account.menu_open'));

    var avatar = document.createElement('span');
    avatar.className = 'account-menu__avatar';
    if (meta.avatarUrl) {
      var avatarImg = document.createElement('img');
      avatarImg.src = meta.avatarUrl;
      avatarImg.alt = '';
      avatar.appendChild(avatarImg);
    } else {
      avatar.textContent = meta.initials;
    }

    var nameSpan = document.createElement('span');
    nameSpan.className = 'account-menu__name';
    nameSpan.textContent = meta.displayName;

    var chevron = document.createElement('span');
    chevron.className = 'account-menu__chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '▼';

    trigger.appendChild(avatar);
    trigger.appendChild(nameSpan);
    trigger.appendChild(chevron);

    var dropdown = document.createElement('div');
    dropdown.className = 'account-menu__dropdown';
    dropdown.setAttribute('role', 'menu');

    var accountLink = document.createElement('a');
    accountLink.href = paths.account;
    accountLink.className = 'account-menu__item';
    accountLink.setAttribute('role', 'menuitem');
    accountLink.textContent = t('account.menu_account');

    var purchasesLink = document.createElement('a');
    purchasesLink.href = paths.purchases;
    purchasesLink.className = 'account-menu__item';
    purchasesLink.setAttribute('role', 'menuitem');
    purchasesLink.textContent = t('account.menu_purchases');

    var divider = document.createElement('div');
    divider.className = 'account-menu__divider';
    divider.setAttribute('role', 'separator');

    var logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'account-menu__item account-menu__item--danger';
    logoutBtn.setAttribute('role', 'menuitem');
    logoutBtn.textContent = t('common.logout');
    logoutBtn.addEventListener('click', function () {
      closeAccountMenus();
      logout();
      updateHeaderUI();
      if (typeof resetAuthForms === 'function') {
        resetAuthForms();
      }
      if (window.location.pathname.indexOf('account.html') !== -1) {
        window.location.reload();
      }
    });

    dropdown.appendChild(accountLink);
    dropdown.appendChild(purchasesLink);

    if (isAdmin(session)) {
      var adminLink = document.createElement('a');
      adminLink.href = paths.admin;
      adminLink.className = 'account-menu__item account-menu__item--admin';
      adminLink.setAttribute('role', 'menuitem');
      adminLink.textContent = t('account.menu_admin');
      dropdown.appendChild(adminLink);
    }

    dropdown.appendChild(divider);
    dropdown.appendChild(logoutBtn);

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('is-open');
      closeAccountMenus();
      if (!isOpen) {
        dropdown.classList.add('is-open');
        trigger.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    menu.appendChild(trigger);
    menu.appendChild(dropdown);
    authSlot.appendChild(menu);
    bindAccountMenuDocListener();
  }

  /**
   * Show theme/language on navbar for guests; hide for logged-in users (managed in Account settings).
   */
  function syncNavbarPreferenceControls() {
    var loggedIn = isLoggedIn();
    var themeBtn = document.getElementById('themeToggle');

    if (themeBtn) {
      themeBtn.hidden = loggedIn;
    }

    var langSwitchers = document.querySelectorAll('.site-header__cta .lang-switch');
    if (loggedIn) {
      for (var i = 0; i < langSwitchers.length; i++) {
        if (langSwitchers[i].parentNode) {
          langSwitchers[i].parentNode.removeChild(langSwitchers[i]);
        }
      }
    } else if (typeof I18n !== 'undefined' && typeof I18n.injectSwitcher === 'function') {
      I18n.injectSwitcher();
    }
  }

  /**
   * Update footer account link based on login state (home page full footer).
   */
  function updateFooterUI() {
    var footerLink = document.querySelector('[data-auth-footer]');
    if (!footerLink) return;

    var paths = getAccountPaths();
    var session = getSession();

    if (session) {
      footerLink.href = paths.account;
      footerLink.setAttribute('data-i18n', 'account.menu_account');
      footerLink.textContent = t('account.menu_account');
    } else {
      footerLink.href = paths.auth;
      footerLink.setAttribute('data-i18n', 'common.login');
      footerLink.textContent = t('common.login');
    }
  }

  /**
   * Update the header CTA area based on login state.
   * Call this on every page load.
   */
  function updateHeaderUI() {
    var ctaContainer = document.querySelector('.site-header__cta');
    if (!ctaContainer) return;

    closeAccountMenus();

    // Find or create a dedicated auth slot, preserving #themeToggle
    var authSlot = ctaContainer.querySelector('[data-auth-slot]');
    if (!authSlot) {
      // First run: remove static auth markup from HTML, keep #themeToggle
      var els = Array.prototype.slice.call(ctaContainer.children);
      for (var i = 0; i < els.length; i++) {
        if (els[i].id !== 'themeToggle') {
          els[i].parentNode.removeChild(els[i]);
        }
      }
      authSlot = document.createElement('span');
      authSlot.setAttribute('data-auth-slot', '');
      ctaContainer.appendChild(authSlot);
    }

    // Clear only the auth slot
    authSlot.innerHTML = '';

    var session = getSession();

    if (session) {
      renderLoggedInHeader(authSlot, session);
    } else {
      var paths = getAccountPaths();
      var loginLink = document.createElement('a');
      loginLink.href = paths.auth;
      loginLink.className = 'btn btn--primary btn--sm';
      loginLink.textContent = t('common.login');
      authSlot.appendChild(loginLink);
    }

    // Phase 10: Refresh notification badge after login state changes
    if (typeof Notifications !== 'undefined' && typeof Notifications.updateBadge === 'function') {
      Notifications.updateBadge();
    }

    syncNavbarPreferenceControls();
    updateFooterUI();
  }

  /* ===========================
     HELPERS
     =========================== */

  function generateId() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    register: register,
    login: login,
    logout: logout,
    changePassword: changePassword,
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    isAdminEmail: isAdminEmail,
    getUserRole: getUserRole,
    bootstrapAdminUser: bootstrapAdminUser,
    ADMIN_EMAIL: ADMIN_EMAIL,
    updateHeaderUI: updateHeaderUI,
    updateFooterUI: updateFooterUI,
    syncNavbarPreferenceControls: syncNavbarPreferenceControls,
    validateFullName: validateFullName,
    validateEmail: validateEmail,
    validatePassword: validatePassword,
    validateConfirmPassword: validateConfirmPassword
  };
})();

// Auto-update header on page load
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Auth.bootstrapAdminUser === 'function') {
    Auth.bootstrapAdminUser();
  }
  Auth.updateHeaderUI();
});

document.addEventListener('autoluxe:locale-changed', function () {
  Auth.updateHeaderUI();
});
