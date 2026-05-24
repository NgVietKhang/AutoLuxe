/* =============================================
   WISHLIST.JS - AutoLuxe Supercar Web
   Wishlist module: add/remove/toggle, per-user storage
   Phase 9
   ============================================= */

var Wishlist = (function () {
  'use strict';

  var STORAGE_KEY = 'autoluxe_wishlist';

  /* ===========================
     HELPERS
     =========================== */

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function generateId() {
    return 'wl_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function getCurrentUserId() {
    try {
      var session = Auth.getSession();
      return session ? session.userId : null;
    } catch (e) {
      return null;
    }
  }

  /* ===========================
     DATA ACCESS
     =========================== */

  function getAll() {
    try {
      var data = Storage.get(STORAGE_KEY, []);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(items) {
    return Storage.set(STORAGE_KEY, items);
  }

  function getByUser(userId) {
    if (!userId) return [];
    return getAll().filter(function (item) {
      return item.ownerId === userId;
    });
  }

  function getMyWishlist() {
    var userId = getCurrentUserId();
    return getByUser(userId);
  }

  function findItem(userId, itemType, itemId) {
    var all = getAll();
    for (var i = 0; i < all.length; i++) {
      if (all[i].ownerId === userId && all[i].itemType === itemType && all[i].itemId === itemId) {
        return all[i];
      }
    }
    return null;
  }

  function isInWishlist(itemType, itemId) {
    var userId = getCurrentUserId();
    if (!userId) return false;
    return findItem(userId, itemType, itemId) !== null;
  }

  /* ===========================
     ADD / REMOVE / TOGGLE
     =========================== */

  function addItem(itemData) {
    var userId = getCurrentUserId();
    if (!userId) return { success: false, reason: 'not_logged_in' };

    var itemType = itemData.itemType;
    var itemId = itemData.itemId;

    if (!itemType || !itemId) return { success: false, reason: 'invalid_data' };

    if (findItem(userId, itemType, itemId)) {
      return { success: false, reason: 'duplicate' };
    }

    var newItem = {
      id: generateId(),
      ownerId: userId,
      itemType: itemType,
      itemId: itemId,
      brand: itemData.brand || '',
      title: itemData.title || '',
      image: itemData.image || '',
      price: itemData.price || 0,
      sourceUrl: itemData.sourceUrl || '',
      createdAt: new Date().toISOString()
    };

    var all = getAll();
    all.push(newItem);
    saveAll(all);
    return { success: true, item: newItem };
  }

  function removeItem(itemType, itemId) {
    var userId = getCurrentUserId();
    if (!userId) return { success: false, reason: 'not_logged_in' };

    var all = getAll();
    var filtered = all.filter(function (item) {
      return !(item.ownerId === userId && item.itemType === itemType && item.itemId === itemId);
    });

    if (filtered.length === all.length) return { success: false, reason: 'not_found' };

    saveAll(filtered);
    return { success: true };
  }

  function removeById(id) {
    var userId = getCurrentUserId();
    if (!userId) return { success: false, reason: 'not_logged_in' };

    var all = getAll();
    var filtered = all.filter(function (item) {
      return !(item.id === id && item.ownerId === userId);
    });

    if (filtered.length === all.length) return { success: false, reason: 'not_found' };

    saveAll(filtered);
    return { success: true };
  }

  function clearMyWishlist() {
    var userId = getCurrentUserId();
    if (!userId) return { success: false, reason: 'not_logged_in' };

    var all = getAll();
    var filtered = all.filter(function (item) {
      return item.ownerId !== userId;
    });

    saveAll(filtered);
    return { success: true };
  }

  function toggleItem(itemData) {
    var userId = getCurrentUserId();
    if (!userId) return { success: false, reason: 'not_logged_in', action: null };

    var exists = findItem(userId, itemData.itemType, itemData.itemId);
    if (exists) {
      var removeResult = removeItem(itemData.itemType, itemData.itemId);
      return { success: removeResult.success, action: 'removed' };
    } else {
      var addResult = addItem(itemData);
      return { success: addResult.success, action: 'added', reason: addResult.reason };
    }
  }

  /* ===========================
     TOAST (reuse pattern)
     =========================== */

  function showToast(message, type) {
    if (typeof Toast !== 'undefined') {
      Toast.show({ message: message, type: type || 'success' });
    }
  }

  /* ===========================
     UI: RENDER WISHLIST BUTTON
     =========================== */

  function createWishlistBtn(itemData, options) {
    options = options || {};
    var btnClass = options.btnClass || 'btn btn--wishlist btn--sm';
    var inWishlist = isInWishlist(itemData.itemType, itemData.itemId);

    var btn = document.createElement('button');
    btn.className = btnClass + (inWishlist ? ' is-wishlisted' : '');
    btn.setAttribute('data-wl-type', itemData.itemType);
    btn.setAttribute('data-wl-id', itemData.itemId);
    btn.innerHTML = inWishlist ? '&#9829; Đã yêu thích' : '&#9825; Yêu thích';

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      handleToggle(btn, itemData);
    });

    return btn;
  }

  function renderWishlistBtnHTML(itemData) {
    var inWishlist = isInWishlist(itemData.itemType, itemData.itemId);
    var cls = inWishlist ? ' is-wishlisted' : '';
    var text = inWishlist ? '&#9829; Đã yêu thích' : '&#9825; Yêu thích';
    return '<button class="btn btn--wishlist btn--sm' + cls + '" ' +
      'data-wl-type="' + escapeHtml(itemData.itemType) + '" ' +
      'data-wl-id="' + escapeHtml(itemData.itemId) + '" ' +
      'data-wl-brand="' + escapeHtml(itemData.brand || '') + '" ' +
      'data-wl-title="' + escapeHtml(itemData.title || '') + '" ' +
      'data-wl-image="' + escapeHtml(itemData.image || '') + '" ' +
      'data-wl-price="' + (itemData.price || 0) + '" ' +
      'data-wl-url="' + escapeHtml(itemData.sourceUrl || '') + '">' +
      text + '</button>';
  }

  function handleToggle(btn, itemData) {
    var userId = getCurrentUserId();
    if (!userId) {
      showToast('Vui lòng đăng nhập để sử dụng Wishlist.', 'error');
      return;
    }

    var result = toggleItem(itemData);

    if (result.success) {
      var isNowIn = result.action === 'added';
      btn.classList.toggle('is-wishlisted', isNowIn);
      btn.innerHTML = isNowIn ? '&#9829; Đã yêu thích' : '&#9825; Yêu thích';
      showToast(
        isNowIn ? 'Đã thêm vào Wishlist!' : 'Đã xóa khỏi Wishlist.',
        isNowIn ? 'success' : 'success'
      );
    }
  }

  function bindDelegatedWishlistButtons(container) {
    container = container || document;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.btn--wishlist');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      var itemData = {
        itemType: btn.getAttribute('data-wl-type'),
        itemId: btn.getAttribute('data-wl-id'),
        brand: btn.getAttribute('data-wl-brand') || '',
        title: btn.getAttribute('data-wl-title') || '',
        image: btn.getAttribute('data-wl-image') || '',
        price: parseFloat(btn.getAttribute('data-wl-price')) || 0,
        sourceUrl: btn.getAttribute('data-wl-url') || ''
      };

      handleToggle(btn, itemData);
    });
  }

  /* ===========================
     PUBLIC API
     =========================== */

  return {
    getMyWishlist: getMyWishlist,
    isInWishlist: isInWishlist,
    addItem: addItem,
    removeItem: removeItem,
    removeById: removeById,
    clearMyWishlist: clearMyWishlist,
    toggleItem: toggleItem,
    createWishlistBtn: createWishlistBtn,
    renderWishlistBtnHTML: renderWishlistBtnHTML,
    bindDelegatedWishlistButtons: bindDelegatedWishlistButtons,
    showToast: showToast
  };
})();
