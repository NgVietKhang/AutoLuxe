/* =============================================
   ACCOUNT.JS - AutoLuxe Supercar Web
   Account page: profile form, avatar upload, tabs
   Phase 2 (P2.1–P2.8)
   ============================================= */

var Account = (function () {
  'use strict';

  var KEYS = {
    profiles: 'autoluxe_profiles',
    users: 'autoluxe_users',
    session: 'autoluxe_session'
  };

  var MAX_AVATAR_BYTES = 500 * 1024;

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function normalizeEmail(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  function getProfiles() {
    var raw = Storage.get(KEYS.profiles, []);
    return Array.isArray(raw) ? raw : [];
  }

  function findProfileIndex(profiles, userId, email) {
    var normalizedEmail = normalizeEmail(email);
    for (var i = 0; i < profiles.length; i++) {
      var profile = profiles[i];
      if (!isObject(profile)) continue;
      if (userId && profile.userId === userId) return i;
      if (normalizedEmail && normalizeEmail(profile.email) === normalizedEmail) return i;
    }
    return -1;
  }

  function validatePhone(phone) {
    var trimmed = (phone || '').trim();
    if (!trimmed) return null;
    var normalized = trimmed.replace(/[\s.-]/g, '');
    var phoneRegex = /^(\+?84|0)[0-9]{8,10}$/;
    if (!phoneRegex.test(normalized)) {
      return (typeof I18n !== 'undefined') ? I18n.t('val.invalid_phone') : 'SĐT không hợp lệ.';
    }
    return null;
  }

  function getDisplayInitials(name) {
    var trimmed = (name || '').trim();
    if (!trimmed) return 'AL';
    var parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function getProfileForSession(session) {
    if (!isObject(session)) return null;

    var profiles = getProfiles();
    var index = findProfileIndex(profiles, session.userId, session.email);

    if (index >= 0) {
      return profiles[index];
    }

    return {
      userId: session.userId,
      email: normalizeEmail(session.email),
      fullName: session.fullName || '',
      phone: '',
      address: '',
      avatar: ''
    };
  }

  function getDisplayName(session) {
    if (!isObject(session)) return '';
    var profile = getProfileForSession(session);
    var fromProfile = profile && profile.fullName ? String(profile.fullName).trim() : '';
    if (fromProfile) return fromProfile;
    return (session.fullName || '').trim();
  }

  function getAvatarDataUrl(session) {
    var profile = getProfileForSession(session);
    if (profile && profile.avatar) return profile.avatar;
    return '';
  }

  function getAvatarByEmail(email) {
    var normalized = normalizeEmail(email);
    if (!normalized) return '';

    var profiles = getProfiles();
    for (var i = 0; i < profiles.length; i++) {
      var profile = profiles[i];
      if (!isObject(profile)) continue;
      if (normalizeEmail(profile.email) === normalized && profile.avatar) {
        return profile.avatar;
      }
    }
    return '';
  }

  function saveAvatar(session, avatarDataUrl) {
    if (!isObject(session)) {
      return { success: false, error: 'no_session' };
    }

    var profile = getProfileForSession(session);
    var displayName = (profile.fullName || session.fullName || '').trim();
    if (!displayName) {
      displayName = (session.email || 'User').split('@')[0];
    }

    return saveProfile(session, {
      fullName: displayName,
      phone: profile.phone || '',
      address: profile.address || '',
      avatar: avatarDataUrl
    });
  }

  function syncUserAndSession(session, profileData) {
    if (!isObject(session)) return;

    var users = Storage.get(KEYS.users, []);
    if (!Array.isArray(users)) users = [];

    var displayName = (profileData.fullName || '').trim();
    var changed = false;

    for (var i = 0; i < users.length; i++) {
      if (users[i] && users[i].id === session.userId) {
        if (displayName && users[i].fullName !== displayName) {
          users[i].fullName = displayName;
          changed = true;
        }
        break;
      }
    }

    if (changed) {
      Storage.set(KEYS.users, users);
    }

    if (displayName && session.fullName !== displayName) {
      session.fullName = displayName;
      Storage.set(KEYS.session, session);
    }
  }

  function saveProfile(session, payload) {
    if (!isObject(session)) {
      return { success: false, error: 'no_session' };
    }

    var displayName = (payload.fullName || '').trim();
    var nameErr = Auth.validateFullName(displayName);
    if (nameErr) {
      return { success: false, error: 'validation', message: nameErr, field: 'displayName' };
    }

    var phoneErr = validatePhone(payload.phone);
    if (phoneErr) {
      return { success: false, error: 'validation', message: phoneErr, field: 'phone' };
    }

    var profiles = getProfiles();
    var index = findProfileIndex(profiles, session.userId, session.email);
    var nowIso = new Date().toISOString();

    var nextProfile = {
      userId: session.userId,
      email: normalizeEmail(session.email),
      fullName: displayName,
      phone: (payload.phone || '').trim(),
      address: (payload.address || '').trim(),
      avatar: payload.avatar !== undefined ? payload.avatar : '',
      updatedAt: nowIso
    };

    if (index >= 0) {
      nextProfile.createdAt = profiles[index].createdAt || nowIso;
      if (payload.avatar === undefined) {
        nextProfile.avatar = profiles[index].avatar || '';
      }
      profiles[index] = nextProfile;
    } else {
      nextProfile.createdAt = nowIso;
      profiles.push(nextProfile);
    }

    if (!Storage.set(KEYS.profiles, profiles)) {
      return { success: false, error: 'storage' };
    }

    syncUserAndSession(session, nextProfile);
    return { success: true, profile: nextProfile };
  }

  function readImageAsDataUrl(file, callback) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      callback({ success: false, error: 'type' });
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      callback({ success: false, error: 'size' });
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      callback({ success: true, dataUrl: reader.result });
    };
    reader.onerror = function () {
      callback({ success: false, error: 'read' });
    };
    reader.readAsDataURL(file);
  }

  return {
    getProfileForSession: getProfileForSession,
    getDisplayName: getDisplayName,
    getAvatarDataUrl: getAvatarDataUrl,
    getAvatarByEmail: getAvatarByEmail,
    getDisplayInitials: getDisplayInitials,
    validatePhone: validatePhone,
    saveProfile: saveProfile,
    saveAvatar: saveAvatar,
    readImageAsDataUrl: readImageAsDataUrl,
    MAX_AVATAR_BYTES: MAX_AVATAR_BYTES
  };
})();

(function () {
  'use strict';

  var gateEl = document.getElementById('accountGate');
  var appEl = document.getElementById('accountApp');
  if (!gateEl || !appEl) return;

  var session = Auth.getSession();
  var pendingAvatar = undefined;
  var currentAvatar = '';
  var focusPostId = '';

  init();

  function init() {
    session = Auth.getSession();
    if (!session) {
      renderLoginGate();
      return;
    }

    appEl.hidden = false;
    gateEl.innerHTML = '';
    if (typeof Seed !== 'undefined') Seed.run();

    handleListingsDeepLink();
    bindTabs();
    bindProfileForm();
    bindPasswordForm();
    bindSettingsPanel();
    loadProfileIntoForm();

    requestAnimationFrame(refreshAccountTabIndicator);
    window.addEventListener('resize', refreshAccountTabIndicator);
    document.addEventListener('autoluxe:locale-changed', refreshAccountTabIndicator);

    if (typeof Auth !== 'undefined' && typeof Auth.syncNavbarPreferenceControls === 'function') {
      Auth.syncNavbarPreferenceControls();
    }
  }

  function renderLoginGate() {
    appEl.hidden = true;
    gateEl.innerHTML =
      '<div class="account-gate">' +
        '<div class="account-gate__icon">🔒</div>' +
        '<h2 class="account-gate__title">' + _t('account.login_title') + '</h2>' +
        '<p class="account-gate__desc">' + _t('account.login_desc') + '</p>' +
        '<a href="./auth.html" class="btn btn--primary">' + _t('common.login') + '</a>' +
      '</div>';
  }

  function bindTabs() {
    var tabButtons = document.querySelectorAll('[data-account-tab]');
    for (var i = 0; i < tabButtons.length; i++) {
      tabButtons[i].addEventListener('click', function () {
        var tab = this.getAttribute('data-account-tab');
        switchTab(tab);
      });
    }

    var hash = (window.location.hash || '').replace('#', '');
    if (hash === 'settings') {
      switchTab('settings');
    } else if (hash === 'listings') {
      switchTab('listings');
    }
  }

  function handleListingsDeepLink() {
    var params = new URLSearchParams(window.location.search);
    focusPostId = String(params.get('postId') || '').trim();
    if (params.get('submitted') === '1') {
      Toast.show(_t('editor.submitted_pending'), 'info');
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '#listings');
      }
    } else if (params.get('resubmitted') === '1') {
      Toast.show(_t('editor.resubmitted_pending'), 'info');
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '#listings');
      }
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function getListingStatusLabel(moderation) {
    if (moderation === 'pending_approval') return _t('account.listing_pending');
    if (moderation === 'rejected') return _t('account.listing_rejected');
    return _t('account.listing_approved');
  }

  function renderMyListings() {
    var container = document.getElementById('accountListingsList');
    if (!container) return;

    session = Auth.getSession();
    if (!session || typeof Marketplace === 'undefined') {
      container.innerHTML = '';
      return;
    }

    var posts = Marketplace.getPostsByOwnerEmail(session.email);
    posts.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    if (posts.length === 0) {
      container.innerHTML =
        '<div class="account-gate account-gate--inline">' +
          '<p>' + _t('account.my_listings_empty') + '</p>' +
          '<a href="./post-editor.html" class="btn btn--primary btn--sm">' + _t('footer.post_ad') + '</a>' +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var moderation = Marketplace.getPostModeration(post);
      var imageStyle = post.image
        ? 'background-image:url(\'' + String(post.image).replace(/'/g, '%27') + '\');'
        : '';
      var reasonHtml = '';

      if (moderation === 'rejected' && post.moderationReason) {
        reasonHtml =
          '<p class="account-listing-card__meta">' +
            _t('account.listing_reject_reason', { reason: post.moderationReason }) +
          '</p>';
      }

      html +=
        '<article class="account-listing-card" data-post-id="' + escapeHtml(post.id) + '">' +
          '<div class="account-listing-card__image" style="' + imageStyle + '"></div>' +
          '<div>' +
            '<h3 class="account-listing-card__title">' + escapeHtml(post.title) + '</h3>' +
            '<p class="account-listing-card__meta">' + escapeHtml(post.brand) + ' · ' + escapeHtml(post.model) + '</p>' +
            '<span class="account-listing-status account-listing-status--' + moderation + '">' +
              getListingStatusLabel(moderation) +
            '</span>' +
            reasonHtml +
            '<p class="account-listing-card__meta">' +
              _t('seller.stats_line', {
                views: Number(post.viewCount) || 0,
                inquiries: Number(post.inquiryCount) || 0
              }) +
            '</p>' +
          '</div>' +
          '<div class="account-listing-card__actions">' +
            '<a href="./post-editor.html?id=' + encodeURIComponent(post.id) + '" class="btn btn--secondary btn--sm">' + _t('common.edit') + '</a>' +
            (moderation === 'approved'
              ? '<a href="./market-detail.html?id=' + encodeURIComponent(post.id) + '" class="btn btn--primary btn--sm">' + _t('market.view_car') + '</a>'
              : '') +
          '</div>' +
        '</article>';
    }

    container.innerHTML = html;
    focusListingCardIfNeeded();
  }

  function focusListingCardIfNeeded() {
    if (!focusPostId) return;
    var selector = '.account-listing-card[data-post-id="' + focusPostId.replace(/"/g, '\\"') + '"]';
    var card = document.querySelector(selector);
    if (!card) return;
    card.classList.add('account-listing-card--focus');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      card.classList.remove('account-listing-card--focus');
    }, 2200);
  }

  function updateAccountTabIndicator(activeTabBtn) {
    var strip = document.querySelector('.account-tabs');
    if (!strip || !activeTabBtn) return;
    var motion = window.AutoLuxeMotion;
    if (motion && typeof motion.updateTabStripIndicator === 'function') {
      motion.updateTabStripIndicator(strip, activeTabBtn);
      return;
    }
    strip.classList.add('tab-strip');
    var stripRect = strip.getBoundingClientRect();
    var btnRect = activeTabBtn.getBoundingClientRect();
    var left = btnRect.left - stripRect.left + strip.scrollLeft;
    strip.style.setProperty('--tab-indicator-left', left + 'px');
    strip.style.setProperty('--tab-indicator-width', btnRect.width + 'px');
  }

  function refreshAccountTabIndicator() {
    var activeBtn = document.querySelector('.account-tabs .is-active-tab');
    if (activeBtn) updateAccountTabIndicator(activeBtn);
  }

  function switchTab(tabName) {
    var active = tabName === 'settings' ? 'settings' : (tabName === 'listings' ? 'listings' : 'profile');

    var tabProfile = document.getElementById('tabProfile');
    var tabListings = document.getElementById('tabListings');
    var tabSettings = document.getElementById('tabSettings');
    var panelProfile = document.getElementById('panelProfile');
    var panelListings = document.getElementById('panelListings');
    var panelSettings = document.getElementById('panelSettings');

    var tabMap = {
      profile: { tab: tabProfile, panel: panelProfile },
      listings: { tab: tabListings, panel: panelListings },
      settings: { tab: tabSettings, panel: panelSettings }
    };

    var keys = ['profile', 'listings', 'settings'];
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      var entry = tabMap[key];
      if (!entry.tab) continue;
      var isActive = active === key;
      entry.tab.classList.toggle('is-active-tab', isActive);
      entry.tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }

    var activeEntry = tabMap[active];
    var motion = window.AutoLuxeMotion;

    for (var p = 0; p < keys.length; p++) {
      var panel = tabMap[keys[p]].panel;
      if (!panel) continue;
      var show = keys[p] === active;
      panel.hidden = !show;
      if (!show) {
        panel.classList.remove('tab-panel--enter', 'account-panel--enter');
      }
    }

    if (activeEntry && activeEntry.panel && !activeEntry.panel.hidden) {
      if (motion && typeof motion.animateTabPanel === 'function') {
        motion.animateTabPanel(activeEntry.panel);
      } else {
        activeEntry.panel.classList.add('account-panel--enter');
        setTimeout(function () {
          activeEntry.panel.classList.remove('account-panel--enter');
        }, 450);
      }
    }

    if (activeEntry && activeEntry.tab) {
      updateAccountTabIndicator(activeEntry.tab);
    }

    if (active === 'settings') {
      window.location.hash = 'settings';
      syncSettingsControlsUI();
    } else if (active === 'listings') {
      window.location.hash = 'listings';
      renderMyListings();
    } else if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function bindPasswordForm() {
    var form = document.getElementById('passwordForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitPasswordChange();
    });
  }

  function clearPasswordErrors() {
    setFieldError('currentPassword', '');
    setFieldError('newPassword', '');
    setFieldError('confirmPassword', '');
  }

  function submitPasswordChange() {
    session = Auth.getSession();
    if (!session) {
      renderLoginGate();
      return;
    }

    clearPasswordErrors();

    var current = getFieldValue('currentPassword');
    var next = getFieldValue('newPassword');
    var confirm = getFieldValue('confirmPassword');

    var result = Auth.changePassword(current, next, confirm);

    if (!result.success) {
      if (result.errors && result.errors.length) {
        for (var i = 0; i < result.errors.length; i++) {
          var err = result.errors[i];
          setFieldError(err.field, err.message);
        }
        return;
      }
      Toast.show(_t('account.password_change_fail'), 'error');
      return;
    }

    var form = document.getElementById('passwordForm');
    if (form) form.reset();
    clearPasswordErrors();
    Toast.show(_t('account.password_changed'), 'success');
  }

  function bindSettingsPanel() {
    var langSwitch = document.getElementById('settingsLangSwitch');
    if (langSwitch) {
      langSwitch.addEventListener('click', function (e) {
        var btn = e.target.closest('.lang-switch__btn');
        if (!btn) return;
        var lang = btn.getAttribute('data-lang');
        if (lang && typeof I18n !== 'undefined' && typeof I18n.setLocale === 'function' && lang !== I18n.getLocale()) {
          I18n.setLocale(lang);
        }
      });
    }

    if (typeof Theme !== 'undefined' && typeof Theme.bindToggleButtons === 'function') {
      Theme.bindToggleButtons();
    }

    var heroScrollInput = document.getElementById('settingsHeroScroll');
    if (heroScrollInput && typeof MotionPrefs !== 'undefined') {
      if (heroScrollInput.getAttribute('data-motion-bound') !== 'true') {
        heroScrollInput.setAttribute('data-motion-bound', 'true');
        heroScrollInput.addEventListener('change', function () {
          MotionPrefs.setHeroScrollEnabled(heroScrollInput.checked);
          Toast.show(_t('account.settings_motion_saved'), 'success');
        });
      }
    }

    var liteFxInput = document.getElementById('settingsLiteFx');
    if (liteFxInput && typeof MotionPrefs !== 'undefined') {
      if (liteFxInput.getAttribute('data-motion-bound') !== 'true') {
        liteFxInput.setAttribute('data-motion-bound', 'true');
        liteFxInput.addEventListener('change', function () {
          MotionPrefs.setLiteFxEnabled(liteFxInput.checked);
          Toast.show(_t('account.settings_motion_saved'), 'success');
        });
      }
    }

    var motionPreset = document.getElementById('settingsMotionPreset');
    if (motionPreset && typeof MotionPrefs !== 'undefined') {
      if (motionPreset.getAttribute('data-motion-bound') !== 'true') {
        motionPreset.setAttribute('data-motion-bound', 'true');
        motionPreset.addEventListener('change', function () {
          MotionPrefs.setMotionPreset(motionPreset.value);
          Toast.show(_t('account.settings_motion_saved'), 'success');
        });
      }
    }

    renderSavedSearches();
    syncSettingsControlsUI();
  }

  function renderSavedSearches() {
    var el = document.getElementById('accountSavedSearches');
    if (!el || typeof SavedSearchService === 'undefined') return;
    var items = SavedSearchService.getMine();
    if (!items.length) {
      el.innerHTML = '<p class="account-section-hint">' + _t('saved_search.empty') + '</p>';
      return;
    }
    var html = '<ul class="account-saved-search-list">';
    items.forEach(function (s) {
      var q = SavedSearchService.buildFilterQuery(s);
      var href = './marketplace.html?' + Object.keys(q).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]);
      }).join('&');
      html += '<li class="account-saved-search-item"><span>' + escapeHtml(s.label) + '</span>' +
        '<a href="' + href + '" class="btn btn--secondary btn--sm">' + _t('common.view_detail') + '</a>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-remove-search="' + escapeHtml(s.id) + '">' + _t('common.delete') + '</button></li>';
    });
    html += '</ul>';
    el.innerHTML = html;
    el.querySelectorAll('[data-remove-search]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        SavedSearchService.remove(btn.getAttribute('data-remove-search'));
        renderSavedSearches();
      });
    });
  }

  function syncSettingsControlsUI() {
    if (typeof Theme !== 'undefined' && typeof Theme.updateAllToggleUI === 'function') {
      Theme.updateAllToggleUI();
    }

    if (typeof MotionPrefs !== 'undefined') {
      var heroScrollInput = document.getElementById('settingsHeroScroll');
      if (heroScrollInput) heroScrollInput.checked = MotionPrefs.isHeroScrollEnabled();
      var liteFxInput = document.getElementById('settingsLiteFx');
      if (liteFxInput) liteFxInput.checked = MotionPrefs.isLiteFxEnabled();
      var motionPreset = document.getElementById('settingsMotionPreset');
      if (motionPreset) motionPreset.value = MotionPrefs.getMotionPreset();
    }

    var locale = (typeof I18n !== 'undefined' && typeof I18n.getLocale === 'function')
      ? I18n.getLocale()
      : 'vi';
    var btns = document.querySelectorAll('#settingsLangSwitch .lang-switch__btn');
    for (var i = 0; i < btns.length; i++) {
      var lang = btns[i].getAttribute('data-lang');
      btns[i].classList.toggle('is-active', lang === locale);
    }
  }

  function bindProfileForm() {
    var form = document.getElementById('profileForm');
    var avatarInput = document.getElementById('avatarInput');
    var uploadZone = document.getElementById('avatarUploadZone');
    var btnUpload = document.getElementById('btnAvatarUpload');
    var btnRemove = document.getElementById('btnAvatarRemove');

    function handleAvatarFile(file) {
      if (!file) return;

      Account.readImageAsDataUrl(file, function (result) {
        if (!result.success) {
          if (result.error === 'size') {
            Toast.show(_t('account.avatar_too_large'), 'error');
          } else {
            Toast.show(_t('account.avatar_invalid'), 'error');
          }
          if (avatarInput) avatarInput.value = '';
          return;
        }

        if (!persistAvatar(result.dataUrl)) {
          if (avatarInput) avatarInput.value = '';
          return;
        }

        updateAvatarPreview(currentAvatar, getFieldValue('profileDisplayName'));
        if (btnRemove) btnRemove.hidden = false;
        setUploadButtonLabel(true);
        if (avatarInput) avatarInput.value = '';
      });
    }

    if (btnUpload && avatarInput) {
      btnUpload.addEventListener('click', function () {
        avatarInput.click();
      });

      avatarInput.addEventListener('change', function () {
        var file = avatarInput.files && avatarInput.files[0];
        handleAvatarFile(file);
      });
    }

    if (uploadZone) {
      uploadZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadZone.classList.add('is-dragover');
      });

      uploadZone.addEventListener('dragleave', function () {
        uploadZone.classList.remove('is-dragover');
      });

      uploadZone.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadZone.classList.remove('is-dragover');
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        handleAvatarFile(file);
      });
    }

    if (btnRemove) {
      btnRemove.addEventListener('click', function () {
        if (!persistAvatar('')) return;
        updateAvatarPreview('', getFieldValue('profileDisplayName'));
        btnRemove.hidden = true;
        setUploadButtonLabel(false);
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitProfile();
      });
    }
  }

  function persistAvatar(dataUrl) {
    session = Auth.getSession();
    if (!session) {
      renderLoginGate();
      return false;
    }

    var result = Account.saveAvatar(session, dataUrl);
    if (!result.success) {
      if (result.error === 'storage') {
        Toast.show(_t('account.avatar_quota'), 'error');
      } else {
        Toast.show(_t('account.profile_save_fail'), 'error');
      }
      return false;
    }

    pendingAvatar = undefined;
    currentAvatar = result.profile.avatar || '';
    session = Auth.getSession();
    Auth.updateHeaderUI();
    Toast.show(_t('account.avatar_saved'), 'success');
    return true;
  }

  function getFieldValue(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function setFieldError(id, message) {
    var input = document.getElementById(id);
    var err = document.getElementById(id + 'Error');
    if (input) input.classList.toggle('input--error', !!message);
    if (err) {
      err.textContent = message || '';
      err.classList.toggle('is-visible', !!message);
    }
  }

  function loadProfileIntoForm() {
    session = Auth.getSession();
    if (!session) return;

    var profile = Account.getProfileForSession(session);
    currentAvatar = profile.avatar || '';
    pendingAvatar = undefined;

    var nameInput = document.getElementById('profileDisplayName');
    var emailInput = document.getElementById('profileEmail');
    var phoneInput = document.getElementById('profilePhone');
    var addressInput = document.getElementById('profileAddress');
    var btnRemove = document.getElementById('btnAvatarRemove');

    if (nameInput) nameInput.value = profile.fullName || session.fullName || '';
    if (emailInput) emailInput.value = profile.email || session.email || '';
    if (phoneInput) phoneInput.value = profile.phone || '';
    if (addressInput) addressInput.value = profile.address || '';

    updateAvatarPreview(currentAvatar, nameInput ? nameInput.value : '');
    if (btnRemove) btnRemove.hidden = !currentAvatar;
    setUploadButtonLabel(!!currentAvatar);
  }

  function updateAvatarPreview(avatarUrl, displayName) {
    var img = document.getElementById('avatarImg');
    var initials = document.getElementById('avatarInitials');
    if (!img || !initials) return;

    if (avatarUrl) {
      img.src = avatarUrl;
      img.hidden = false;
      initials.hidden = true;
    } else {
      img.removeAttribute('src');
      img.hidden = true;
      initials.hidden = false;
      initials.textContent = Account.getDisplayInitials(displayName);
    }
  }

  function setUploadButtonLabel(hasAvatar) {
    var btn = document.getElementById('btnAvatarUpload');
    if (!btn) return;
    btn.textContent = hasAvatar ? _t('account.avatar_change') : _t('account.avatar_upload');
  }

  function submitProfile() {
    session = Auth.getSession();
    if (!session) {
      renderLoginGate();
      return;
    }

    setFieldError('profileDisplayName', '');
    setFieldError('profilePhone', '');

    var payload = {
      fullName: getFieldValue('profileDisplayName'),
      phone: getFieldValue('profilePhone'),
      address: getFieldValue('profileAddress')
    };

    if (pendingAvatar !== undefined) {
      payload.avatar = pendingAvatar;
    }

    var result = Account.saveProfile(session, payload);

    if (!result.success) {
      if (result.field === 'displayName') {
        setFieldError('profileDisplayName', result.message || _t('val.required_name'));
      } else if (result.field === 'phone') {
        setFieldError('profilePhone', result.message || _t('val.invalid_phone'));
      } else {
        Toast.show(_t('account.profile_save_fail'), 'error');
      }
      return;
    }

    pendingAvatar = undefined;
    currentAvatar = result.profile.avatar || '';
    session = Auth.getSession();
    loadProfileIntoForm();
    Auth.updateHeaderUI();

    Toast.show(_t('account.profile_saved'), 'success');
  }

  document.addEventListener('autoluxe:locale-changed', function () {
    setUploadButtonLabel(!!currentAvatar);
    syncSettingsControlsUI();
    renderMyListings();
    if (typeof I18n !== 'undefined' && I18n.applyTranslations) {
      I18n.applyTranslations(appEl);
    }
    if (typeof Auth !== 'undefined' && typeof Auth.syncNavbarPreferenceControls === 'function') {
      Auth.syncNavbarPreferenceControls();
    }
  });
})();
