/* =============================================
   AUTH.JS - AutoLuxe Supercar Web
   Authentication: validation, register, login, logout, UI sync
   ============================================= */

var Auth = (function () {
  'use strict';

  var KEYS = {
    users: 'autoluxe_users',
    session: 'autoluxe_session'
  };

  /* ===========================
     VALIDATION
     =========================== */

  function validateFullName(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) return 'Vui lòng nhập tên hiển thị.';
    if (trimmed.length < 2) return 'Tên phải có ít nhất 2 ký tự.';
    return null;
  }

  function validateEmail(email) {
    var trimmed = (email || '').trim();
    if (!trimmed) return 'Vui lòng nhập email.';
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Email không đúng định dạng.';
    return null;
  }

  function validatePassword(password) {
    if (!password) return 'Vui lòng nhập mật khẩu.';
    if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    return null;
  }

  function validateConfirmPassword(password, confirm) {
    if (!confirm) return 'Vui lòng xác nhận mật khẩu.';
    if (password !== confirm) return 'Mật khẩu xác nhận không khớp.';
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

    // Check duplicate email
    var users = Storage.get(KEYS.users, []);
    var duplicate = users.some(function (u) {
      return u.email === email;
    });
    if (duplicate) {
      return { success: false, errors: [{ field: 'regEmail', message: 'Email này đã được đăng ký.' }] };
    }

    // Create user object
    var newUser = {
      id: generateId(),
      fullName: fullName,
      email: email,
      password: password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Storage.set(KEYS.users, users);

    // Auto login after register
    var session = {
      userId: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      loginAt: new Date().toISOString()
    };
    Storage.set(KEYS.session, session);

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
      if (users[i].email === email) {
        user = users[i];
        break;
      }
    }

    if (!user) {
      return { success: false, errors: [{ field: 'loginEmail', message: 'Email chưa được đăng ký.' }] };
    }

    if (user.password !== password) {
      return { success: false, errors: [{ field: 'loginPassword', message: 'Mật khẩu không đúng.' }] };
    }

    // Create session
    var session = {
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      loginAt: new Date().toISOString()
    };
    Storage.set(KEYS.session, session);

    return { success: true, session: session };
  }

  /* ===========================
     LOGOUT
     =========================== */

  function logout() {
    Storage.remove(KEYS.session);
  }

  /* ===========================
     SESSION
     =========================== */

  function getSession() {
    return Storage.get(KEYS.session, null);
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  /* ===========================
     UI UPDATE (Header)
     =========================== */

  /**
   * Update the header CTA area based on login state.
   * Call this on every page load.
   */
  function updateHeaderUI() {
    var ctaContainer = document.querySelector('.site-header__cta');
    if (!ctaContainer) return;

    var session = getSession();

    if (session) {
      ctaContainer.innerHTML =
        '<span class="auth-greeting">Xin chào, <strong>' + escapeHtml(session.fullName) + '</strong></span>' +
        '<button class="btn btn--secondary btn--sm" id="btnLogout">Đăng xuất</button>';

      var logoutBtn = document.getElementById('btnLogout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          logout();
          updateHeaderUI();
          // If on auth page, reset forms
          if (typeof resetAuthForms === 'function') {
            resetAuthForms();
          }
        });
      }
    } else {
      // Determine correct path to auth.html
      var isInPages = window.location.pathname.indexOf('/pages/') !== -1;
      var authPath = isInPages ? './auth.html' : './pages/auth.html';
      ctaContainer.innerHTML =
        '<a href="' + authPath + '" class="btn btn--primary btn--sm">Đăng nhập</a>';
    }

    // Phase 10: Refresh notification badge after login state changes
    if (typeof Notifications !== 'undefined' && typeof Notifications.updateBadge === 'function') {
      Notifications.updateBadge();
    }
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
    getSession: getSession,
    isLoggedIn: isLoggedIn,
    updateHeaderUI: updateHeaderUI,
    validateFullName: validateFullName,
    validateEmail: validateEmail,
    validatePassword: validatePassword,
    validateConfirmPassword: validateConfirmPassword
  };
})();

// Auto-update header on page load
document.addEventListener('DOMContentLoaded', function () {
  Auth.updateHeaderUI();
});
