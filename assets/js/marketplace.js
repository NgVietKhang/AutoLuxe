/* =============================================
   MARKETPLACE.JS - AutoLuxe Supercar Web
   Marketplace CRUD: list, search, filter, delete
   ============================================= */

var Marketplace = (function () {
  'use strict';

  var KEYS = {
    posts: 'autoluxe_market_posts',
    postImagesDraft: 'autoluxe_post_images_draft'
  };
  var MAX_POST_IMAGES = 8;
  var MAX_POST_IMAGE_BYTES = 800 * 1024;
  var postImageDraft = null;
  var pagePrefill = {
    brand: '',
    model: ''
  };

  /* ===========================
     DATA ACCESS
     =========================== */

  function getAllPosts() {
    try {
      var posts = Storage.get(KEYS.posts, []);
      return Array.isArray(posts) ? posts : [];
    } catch (e) {
      return [];
    }
  }

  function getPostById(id) {
    var posts = getAllPosts();
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) return posts[i];
    }
    return null;
  }

  function savePost(post) {
    try {
      var posts = getAllPosts();
      posts.push(post);
      return Storage.set(KEYS.posts, posts);
    } catch (e) {
      return false;
    }
  }

  function updatePost(id, updatedData) {
    try {
      var posts = getAllPosts();
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].id === id) {
          for (var key in updatedData) {
            if (updatedData.hasOwnProperty(key)) {
              posts[i][key] = updatedData[key];
            }
          }
          posts[i].updatedAt = new Date().toISOString();
          return Storage.set(KEYS.posts, posts);
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function deletePost(id) {
    try {
      var posts = getAllPosts();
      var filtered = posts.filter(function (p) { return p.id !== id; });
      if (filtered.length === posts.length) return false;
      return Storage.set(KEYS.posts, filtered);
    } catch (e) {
      return false;
    }
  }

  function generatePostId() {
    return 'post_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function generateImageId() {
    return 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }

  function getPostImages(post) {
    if (!post) return [];
    if (post.images && Array.isArray(post.images) && post.images.length) {
      return post.images.filter(function (url) { return !!url; });
    }
    if (post.image) return [post.image];
    return [];
  }

  function readPostImageAsDataUrl(file, callback) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      callback({ success: false, error: 'type' });
      return;
    }
    if (file.size > MAX_POST_IMAGE_BYTES) {
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

  function loadImageDraftFromStorage(ownerEmail, editPostId) {
    try {
      var draft = Storage.get(KEYS.postImagesDraft, null);
      if (!draft || typeof draft !== 'object') return null;
      if (String(draft.ownerEmail || '').trim().toLowerCase() !== String(ownerEmail || '').trim().toLowerCase()) {
        return null;
      }
      var draftEditId = draft.editPostId || null;
      var contextEditId = editPostId || null;
      if (draftEditId !== contextEditId) return null;
      if (!Array.isArray(draft.images)) draft.images = [];
      return draft;
    } catch (e) {
      return null;
    }
  }

  function persistImageDraft() {
    if (!postImageDraft) return true;
    postImageDraft.updatedAt = new Date().toISOString();
    var ok = Storage.set(KEYS.postImagesDraft, postImageDraft);
    if (!ok) {
      showToast(_t('editor.post_images_quota'), 'error');
    }
    return ok;
  }

  function clearImageDraft() {
    postImageDraft = null;
    Storage.remove(KEYS.postImagesDraft);
  }

  function imagesFromUrls(urls) {
    var items = [];
    for (var i = 0; i < urls.length; i++) {
      if (!urls[i]) continue;
      items.push({
        id: generateImageId(),
        dataUrl: urls[i],
        name: '',
        addedAt: new Date().toISOString()
      });
    }
    return items;
  }

  function initPostImagesState(session, isEdit, existingPost, editId) {
    postImageDraft = {
      ownerEmail: session.email,
      editPostId: isEdit ? editId : null,
      images: [],
      updatedAt: new Date().toISOString()
    };

    var storedDraft = loadImageDraftFromStorage(session.email, isEdit ? editId : null);
    if (storedDraft && storedDraft.images.length) {
      postImageDraft = storedDraft;
    } else if (isEdit && existingPost) {
      postImageDraft.images = imagesFromUrls(getPostImages(existingPost));
    }

    renderPostImagesPreview();
  }

  function getImagesForSubmit() {
    if (!postImageDraft || !Array.isArray(postImageDraft.images)) return [];
    return postImageDraft.images.map(function (item) { return item.dataUrl; }).filter(function (url) { return !!url; });
  }

  function renderPostImagesPreview() {
    var preview = document.getElementById('postImagesPreview');
    if (!preview) return;

    var images = (postImageDraft && postImageDraft.images) ? postImageDraft.images : [];
    if (!images.length) {
      preview.innerHTML = '';
      return;
    }

    var html = '';
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      html +=
        '<div class="post-images-preview__item" data-image-id="' + escapeHtml(img.id) + '">' +
          '<img src="' + escapeHtml(img.dataUrl) + '" alt="">' +
          (i === 0
            ? '<span class="post-images-preview__cover">' + escapeHtml(_t('editor.post_images_cover')) + '</span>'
            : '') +
          '<button type="button" class="post-images-preview__remove" data-remove-id="' + escapeHtml(img.id) + '" aria-label="' + escapeHtml(_t('editor.post_images_remove')) + '">&times;</button>' +
        '</div>';
    }
    preview.innerHTML = html;

    var removeBtns = preview.querySelectorAll('[data-remove-id]');
    for (var j = 0; j < removeBtns.length; j++) {
      removeBtns[j].addEventListener('click', function () {
        removePostImage(this.getAttribute('data-remove-id'));
      });
    }
  }

  function removePostImage(imageId) {
    if (!postImageDraft || !imageId) return;
    postImageDraft.images = postImageDraft.images.filter(function (item) {
      return item.id !== imageId;
    });
    if (!persistImageDraft()) return;
    renderPostImagesPreview();
  }

  function addPostImageFiles(fileList) {
    if (!postImageDraft || !fileList || !fileList.length) return;

    var files = [];
    for (var i = 0; i < fileList.length; i++) {
      files.push(fileList[i]);
    }

    var remaining = MAX_POST_IMAGES - postImageDraft.images.length;
    if (remaining <= 0) {
      showToast(_t('editor.post_images_max', { max: MAX_POST_IMAGES }), 'error');
      return;
    }

    if (files.length > remaining) {
      showToast(_t('editor.post_images_max', { max: MAX_POST_IMAGES }), 'error');
      files = files.slice(0, remaining);
    }

    var newItems = [];
    var pending = files.length;

    function finishBatch() {
      if (pending > 0) return;
      if (!newItems.length) return;

      var snapshot = postImageDraft.images.slice();
      postImageDraft.images = snapshot.concat(newItems);
      if (!persistImageDraft()) {
        postImageDraft.images = snapshot;
        return;
      }
      renderPostImagesPreview();
    }

    for (var j = 0; j < files.length; j++) {
      (function (file) {
        readPostImageAsDataUrl(file, function (result) {
          pending -= 1;
          if (!result.success) {
            if (result.error === 'size') {
              showToast(_t('editor.post_image_too_large'), 'error');
            } else {
              showToast(_t('editor.post_image_invalid'), 'error');
            }
            finishBatch();
            return;
          }

          newItems.push({
            id: generateImageId(),
            dataUrl: result.dataUrl,
            name: file.name || '',
            addedAt: new Date().toISOString()
          });
          finishBatch();
        });
      })(files[j]);
    }
  }

  function bindPostImagesUpload() {
    var uploadZone = document.getElementById('postImagesUpload');
    var fileInput = document.getElementById('postImagesInput');
    var uploadBtn = document.getElementById('postImagesBtn');
    if (!uploadZone || !fileInput) return;

    if (uploadBtn) {
      uploadBtn.addEventListener('click', function () {
        fileInput.click();
      });
    }

    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length) {
        addPostImageFiles(fileInput.files);
      }
      fileInput.value = '';
    });

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
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        addPostImageFiles(e.dataTransfer.files);
      }
    });
  }

  function normalizeModeration(value) {
    var normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'pending_approval' || normalized === 'pending') return 'pending_approval';
    if (normalized === 'rejected' || normalized === 'reject') return 'rejected';
    if (normalized === 'approved' || normalized === 'approve') return 'approved';
    return normalized ? 'approved' : 'approved';
  }

  function getPostModeration(post) {
    if (!post) return 'approved';
    return normalizeModeration(post.moderation);
  }

  function isPostPubliclyVisible(post) {
    if (!post) return false;
    return getPostModeration(post) === 'approved';
  }

  function isPostOwner(post, session) {
    if (!post || !session || !session.email) return false;
    return String(post.ownerEmail || '').trim().toLowerCase() === String(session.email).trim().toLowerCase();
  }

  function canViewPost(post, session) {
    if (!post) return false;
    if (isPostPubliclyVisible(post)) return true;
    return isPostOwner(post, session);
  }

  function filterPublicPosts(posts) {
    if (!Array.isArray(posts)) return [];
    return posts.filter(function (p) {
      return isPostPubliclyVisible(p);
    });
  }

  function getPostsByOwnerEmail(email) {
    var normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return [];
    return getAllPosts().filter(function (p) {
      return String(p.ownerEmail || '').trim().toLowerCase() === normalized;
    });
  }

  function getPendingPosts() {
    return getAllPosts().filter(function (p) {
      return getPostModeration(p) === 'pending_approval';
    });
  }

  function normalizeToken(value) {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function normalizeAvailability(value) {
    if (value === true) return 'available';
    if (value === false) return 'sold';
    var normalized = normalizeToken(value);
    if (!normalized) return 'available';
    if (normalized === 'available') return 'available';
    if (normalized === 'pending' || normalized === 'pending_payment' || normalized === 'reserved' || normalized === 'on_hold') {
      return 'pending_payment';
    }
    if (normalized === 'sold' || normalized === 'unavailable' || normalized === 'completed') {
      return 'sold';
    }
    return 'available';
  }

  function isApprovedAndAvailable(post) {
    if (!post) return false;
    if (getPostModeration(post) !== 'approved') return false;
    var source = post.availability;
    if (source === undefined || source === null || source === '') {
      source = post.status;
    }
    return normalizeAvailability(source) === 'available';
  }

  function getAvailableListingsByBrandModel(brand, model) {
    var targetBrand = normalizeToken(brand);
    var targetModel = normalizeToken(model);
    if (!targetBrand || !targetModel) return [];

    return getAllPosts().filter(function (post) {
      return isApprovedAndAvailable(post) &&
        normalizeToken(post.brand) === targetBrand &&
        normalizeToken(post.model) === targetModel;
    });
  }

  function getAvailableListingCountByBrandModel(brand, model) {
    return getAvailableListingsByBrandModel(brand, model).length;
  }

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

  function formatNumber(num) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatNumber === 'function') {
      return I18n.formatNumber(num || 0, { maximumFractionDigits: 0 });
    }
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('en-US');
  }

  function translateFuel(val) {
    if (!val) return '';
    var map = { 'Xăng': 'data.fuel_gasoline', 'Dầu': 'data.fuel_diesel', 'Hybrid': 'data.fuel_hybrid', 'Điện': 'data.fuel_electric' };
    return map[val] ? _t(map[val]) : val;
  }

  function translateTransmission(val) {
    if (!val) return '';
    var map = { 'Tự động': 'data.trans_auto', 'Số sàn': 'data.trans_manual', 'PDK': 'data.trans_pdk', 'DCT': 'data.trans_dct' };
    return map[val] ? _t(map[val]) : val;
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
     RENDER LISTING
     =========================== */

  function renderGrid(posts) {
    var grid = document.getElementById('marketGrid');
    var stateEl = document.getElementById('marketState');
    if (!grid) return;

    if (!posts || posts.length === 0) {
      grid.innerHTML = '';
      if (stateEl) {
        stateEl.innerHTML =
          '<div class="market-state">' +
            '<div class="market-state__icon">🏎️</div>' +
            '<h3 class="market-state__title">' + _t('market.empty_title') + '</h3>' +
            '<p class="market-state__desc">' + _t('market.empty_desc') + '</p>' +
          '</div>';
        stateEl.style.display = 'block';
      }
      return;
    }

    if (stateEl) stateEl.style.display = 'none';

    var session = Auth.getSession();
    var currentEmail = session ? session.email : null;

    var html = '';
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      var isOwner = currentEmail && p.ownerEmail === currentEmail;
      var imageStyle = p.image
        ? 'background-image:url(\'' + escapeHtml(p.image) + '\');'
        : '';

      html +=
        '<article class="market-card">' +
          '<div class="market-card__image" style="' + imageStyle + '">' +
            '<span class="market-card__badge">' + escapeHtml(p.brand) + '</span>' +
          '</div>' +
          '<div class="market-card__body">' +
            '<h3 class="market-card__title">' + escapeHtml(p.title) + '</h3>' +
            '<div class="market-card__specs">' +
              '<span class="market-card__spec">' + escapeHtml(String(p.year)) + '</span>' +
              '<span class="market-card__spec">' + formatNumber(p.mileage) + ' km</span>' +
              (p.fuel ? '<span class="market-card__spec">' + escapeHtml(translateFuel(p.fuel)) + '</span>' : '') +
              (p.transmission ? '<span class="market-card__spec">' + escapeHtml(translateTransmission(p.transmission)) + '</span>' : '') +
            '</div>' +
            '<p class="market-card__meta">📍 ' + escapeHtml(p.location || _t('common.na')) + ' &bull; ' + escapeHtml(p.ownerName || _t('market.anonymous')) + '</p>' +
            '<p class="market-card__price">' + formatPrice(p.price) + '</p>' +
          '</div>' +
          '<div class="market-card__footer">' +
            '<span style="font-size:var(--fs-xs);color:var(--color-text-muted);">' + formatDate(p.createdAt) + '</span>' +
            '<div class="market-card__actions">' +
              (isOwner
                ? '<div class="market-card__manage-actions">' +
                    '<a href="./post-editor.html?id=' + encodeURIComponent(p.id) + '" class="btn btn--secondary btn--sm">' + _t('common.edit') + '</a>' +
                    '<button class="btn btn--danger btn--sm" data-delete-id="' + escapeHtml(p.id) + '">' + _t('common.delete') + '</button>' +
                  '</div>'
                : '') +
              '<a href="./market-detail.html?id=' + encodeURIComponent(p.id) + '" class="btn btn--primary btn--sm">' + _t('market.view_car') + '</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    }

    grid.innerHTML = html;
    bindDeleteButtons();
    animateMarketCards();
  }

  function formatDate(isoStr) {
    if (typeof I18n !== 'undefined' && typeof I18n.formatDate === 'function') {
      return I18n.formatDate(isoStr);
    }
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      var day = ('0' + d.getDate()).slice(-2);
      var month = ('0' + (d.getMonth() + 1)).slice(-2);
      return day + '/' + month + '/' + d.getFullYear();
    } catch (e) {
      return '';
    }
  }

  /* ===========================
     SEARCH & FILTER & SORT
     =========================== */

  function applyFilters() {
    var searchInput = document.getElementById('marketSearch');
    var sortSelect = document.getElementById('marketSort');
    var brandSelect = document.getElementById('marketBrand');

    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var sort = sortSelect ? sortSelect.value : 'newest';
    var brand = brandSelect ? brandSelect.value : '';

    var posts = filterPublicPosts(getAllPosts());

    if (keyword) {
      posts = posts.filter(function (p) {
        var haystack = (
          (p.title || '') + ' ' +
          (p.brand || '') + ' ' +
          (p.model || '') + ' ' +
          (p.description || '')
        ).toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      });
    }

    if (brand) {
      posts = posts.filter(function (p) {
        return p.brand === brand;
      });
    }

    var minPriceEl = document.getElementById('marketMinPrice');
    var maxPriceEl = document.getElementById('marketMaxPrice');
    var minPrice = minPriceEl && minPriceEl.value ? Number(minPriceEl.value) : null;
    var maxPrice = maxPriceEl && maxPriceEl.value ? Number(maxPriceEl.value) : null;
    if (minPrice != null && !isNaN(minPrice)) {
      posts = posts.filter(function (p) { return (Number(p.price) || 0) >= minPrice; });
    }
    if (maxPrice != null && !isNaN(maxPrice)) {
      posts = posts.filter(function (p) { return (Number(p.price) || 0) <= maxPrice; });
    }

    if (pagePrefill.brand && pagePrefill.model) {
      var targetBrand = normalizeToken(pagePrefill.brand);
      var targetModel = normalizeToken(pagePrefill.model);
      posts = posts.filter(function (p) {
        return normalizeToken(p.brand) === targetBrand &&
          normalizeToken(p.model) === targetModel &&
          isApprovedAndAvailable(p);
      });
    }

    if (sort === 'price-asc') {
      posts.sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
    } else if (sort === 'price-desc') {
      posts.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
    } else {
      posts.sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    }

    renderGrid(posts);
  }

  /* ===========================
     DELETE
     =========================== */

  function bindDeleteButtons() {
    var buttons = document.querySelectorAll('[data-delete-id]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', handleDelete);
    }
  }

  function handleDelete(e) {
    var id = e.currentTarget.getAttribute('data-delete-id');
    if (!id) return;

    var session = Auth.getSession();
    if (!session) {
      showToast(_t('market.delete_login'), 'error');
      return;
    }

    var post = getPostById(id);
    if (!post) {
      showToast(_t('market.delete_notfound'), 'error');
      return;
    }

    if (post.ownerEmail !== session.email) {
      showToast(_t('market.delete_noperm'), 'error');
      return;
    }

    ConfirmDialog.show({
      title: _t('market.delete_confirm_title'),
      message: _t('market.delete_confirm', { title: post.title }),
      confirmText: _t('common.delete'),
      cancelText: _t('common.cancel'),
      confirmVariant: 'danger'
    }).then(function (confirmed) {
      if (!confirmed) return;

      var success = deletePost(id);
      if (success) {
        showToast(_t('market.delete_success'), 'success');
        applyFilters();
      } else {
        showToast(_t('market.delete_fail'), 'error');
      }
    });
  }

  /* ===========================
     INIT MARKETPLACE PAGE
     =========================== */

  function initListPage() {
    Seed.run();

    var searchInput = document.getElementById('marketSearch');
    var sortSelect = document.getElementById('marketSort');
    var brandSelect = document.getElementById('marketBrand');

    pagePrefill = readPrefillFromQuery();
    applyPrefillToControls(searchInput, brandSelect);
    applyFilters();

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        if (pagePrefill.model && normalizeToken(searchInput.value) !== normalizeToken(pagePrefill.model)) {
          pagePrefill.model = '';
        }
        applyFilters();
      });
    }
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (brandSelect) {
      brandSelect.addEventListener('change', function () {
        if (pagePrefill.brand && normalizeToken(brandSelect.value) !== normalizeToken(pagePrefill.brand)) {
          pagePrefill.brand = '';
          pagePrefill.model = '';
        }
        applyFilters();
      });
    }

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === '1') {
      showToast(_t('editor.submitted_pending'), 'info');
    } else if (urlParams.get('created') === '1') {
      showToast(_t('market.created_toast'), 'success');
    } else if (urlParams.get('updated') === '1') {
      showToast(_t('market.updated_toast'), 'success');
    } else if (pagePrefill.brand || pagePrefill.model) {
      showToast(
        _t('market.prefill_applied', {
          brand: pagePrefill.brand || _t('common.updating'),
          model: pagePrefill.model || _t('common.updating')
        }),
        'info'
      );
    }

    bindSavedSearchControls();
    if (typeof SavedSearchService !== 'undefined' && typeof Marketplace.filterPublicPosts === 'function') {
      SavedSearchService.runMatcherOnPosts(Marketplace.filterPublicPosts(getAllPosts()));
    }
  }

  function bindSavedSearchControls() {
    var btn = document.getElementById('btnSaveSearch');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (typeof SavedSearchService === 'undefined') return;
      try {
        if (!Auth.getSession()) {
          showToast(_t('saved_search.login_required'), 'warning');
          return;
        }
      } catch (e) {
        showToast(_t('saved_search.login_required'), 'warning');
        return;
      }
      var brandEl = document.getElementById('marketBrand');
      var searchEl = document.getElementById('marketSearch');
      var minEl = document.getElementById('marketMinPrice');
      var maxEl = document.getElementById('marketMaxPrice');
      var result = SavedSearchService.add({
        brand: brandEl ? brandEl.value : '',
        model: searchEl ? searchEl.value : '',
        minPrice: minEl && minEl.value ? Number(minEl.value) : null,
        maxPrice: maxEl && maxEl.value ? Number(maxEl.value) : null
      });
      if (result.ok) showToast(_t('saved_search.saved'), 'success');
    });
  }

  function animateMarketCards() {
    if (!window.gsap || window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cards = document.querySelectorAll('#marketGrid .market-card');
    if (!cards.length) return;
    gsap.fromTo(cards, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out' });
  }

  function readPrefillFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      return {
        brand: String(params.get('brand') || '').trim(),
        model: String(params.get('model') || '').trim()
      };
    } catch (e) {
      return { brand: '', model: '' };
    }
  }

  function applyPrefillToControls(searchInput, brandSelect) {
    if (brandSelect && pagePrefill.brand) {
      var selected = false;
      var options = brandSelect.querySelectorAll('option');
      for (var i = 0; i < options.length; i++) {
        var val = options[i].value;
        if (normalizeToken(val) === normalizeToken(pagePrefill.brand)) {
          brandSelect.value = val;
          pagePrefill.brand = val;
          selected = true;
          break;
        }
      }
      if (!selected) {
        pagePrefill.brand = '';
      }
    }

    if (searchInput && pagePrefill.model) {
      searchInput.value = pagePrefill.model;
    }
  }

  /* ===========================
     POST EDITOR (CREATE / EDIT)
     =========================== */

  function initEditorPage() {
    Seed.run();

    var form = document.getElementById('postForm');
    var titleEl = document.getElementById('editorPageTitle');
    var submitBtn = document.getElementById('postSubmitBtn');
    var warningEl = document.getElementById('loginWarning');

    if (!form) return;

    var session = Auth.getSession();
    var urlParams = new URLSearchParams(window.location.search);
    var editId = urlParams.get('id');
    var isEdit = !!editId;
    var existingPost = null;

    if (!session) {
      form.style.display = 'none';
      if (warningEl) warningEl.style.display = 'block';
      return;
    }

    if (warningEl) warningEl.style.display = 'none';

    if (isEdit) {
      existingPost = getPostById(editId);
      if (!existingPost) {
        showToast(_t('editor.post_notfound'), 'error');
        setTimeout(function () { window.location.href = './marketplace.html'; }, 1500);
        return;
      }
      if (existingPost.ownerEmail !== session.email) {
        showToast(_t('editor.no_edit_perm'), 'error');
        setTimeout(function () { window.location.href = './marketplace.html'; }, 1500);
        return;
      }
      if (titleEl) titleEl.textContent = _t('editor.title_edit');
      if (submitBtn) submitBtn.textContent = _t('editor.btn_update');
      prefillForm(existingPost);
      renderEditorModerationBanner(existingPost);
    } else {
      renderEditorModerationBanner(null);
    }

    initPostImagesState(session, isEdit, existingPost, editId);
    bindPostImagesUpload();

    var cancelBtn = document.getElementById('postCancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        clearImageDraft();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      var data = collectFormData();

      if (isEdit && existingPost) {
        var editPayload = data;
        var currentModeration = getPostModeration(existingPost);
        var requiresReapproval = currentModeration === 'approved' || currentModeration === 'rejected';

        if (requiresReapproval) {
          editPayload.moderation = 'pending_approval';
          editPayload.moderationReason = '';
          editPayload.moderatedAt = null;
        }

        var ok = updatePost(editId, editPayload);
        if (ok) {
          clearImageDraft();
          if (requiresReapproval) {
            notifyAdminPendingPost(Object.assign({}, existingPost, editPayload, { id: editId }));
            window.location.href = './account.html?resubmitted=1#listings';
          } else {
            window.location.href = './account.html#listings';
          }
        } else {
          showToast(_t('editor.update_fail'), 'error');
        }
      } else {
        var newPost = {
          id: generatePostId(),
          ownerEmail: session.email,
          ownerName: session.fullName,
          title: data.title,
          brand: data.brand,
          model: data.model,
          year: data.year,
          price: data.price,
          mileage: data.mileage,
          fuel: data.fuel,
          transmission: data.transmission,
          location: data.location,
          image: data.image,
          images: data.images,
          description: data.description,
          moderation: 'pending_approval',
          moderationReason: '',
          availability: 'available',
          status: 'available',
          createdAt: new Date().toISOString()
        };
        var saved = savePost(newPost);
        if (saved) {
          clearImageDraft();
          notifyAdminPendingPost(newPost);
          window.location.href = './account.html?submitted=1#listings';
        } else {
          showToast(_t('editor.post_fail'), 'error');
        }
      }
    });
  }

  function renderEditorModerationBanner(post) {
    var bannerHost = document.getElementById('editorModerationBanner');
    if (!bannerHost) return;

    if (!post) {
      bannerHost.innerHTML =
        '<div class="editor-moderation-banner editor-moderation-banner--info">' +
          '<p>' + escapeHtml(_t('editor.new_pending_hint')) + '</p>' +
        '</div>';
      return;
    }

    var moderation = getPostModeration(post);
    if (moderation === 'pending_approval') {
      bannerHost.innerHTML =
        '<div class="editor-moderation-banner editor-moderation-banner--pending">' +
          '<p>' + escapeHtml(_t('account.listing_pending')) + '</p>' +
        '</div>';
      return;
    }

    if (moderation === 'rejected') {
      var reason = post.moderationReason || _t('account.listing_reject_no_reason');
      bannerHost.innerHTML =
        '<div class="editor-moderation-banner editor-moderation-banner--rejected">' +
          '<p>' + escapeHtml(_t('account.listing_reject_reason', { reason: reason })) + '</p>' +
          '<p>' + escapeHtml(_t('editor.resubmit_hint')) + '</p>' +
        '</div>';
      return;
    }

    if (moderation === 'approved') {
      bannerHost.innerHTML =
        '<div class="editor-moderation-banner editor-moderation-banner--info">' +
          '<p>' + escapeHtml(_t('editor.edit_reapproval_hint')) + '</p>' +
        '</div>';
      return;
    }

    bannerHost.innerHTML = '';
  }

  function notifyAdminPendingPost(post) {
    if (typeof Notifications === 'undefined' || typeof Notifications.emitEvent !== 'function' || typeof Auth === 'undefined') return;
    Notifications.emitEvent('admin_pending_post', {
      userKey: Auth.ADMIN_EMAIL,
      postId: post.id,
      params: { title: post.title || '' },
      metadata: {
        postId: post.id,
        moderation: 'pending_approval'
      }
    });
  }

  function prefillForm(post) {
    setVal('postTitle', post.title);
    setVal('postBrand', post.brand);
    setVal('postModel', post.model);
    setVal('postYear', post.year);
    setVal('postPrice', post.price);
    setVal('postMileage', post.mileage);
    setVal('postFuel', post.fuel);
    setVal('postTransmission', post.transmission);
    setVal('postLocation', post.location);
    setVal('postDesc', post.description);
  }

  function setVal(id, value) {
    var el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.value = value;
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function collectFormData() {
    var images = getImagesForSubmit();
    return {
      title: getVal('postTitle'),
      brand: getVal('postBrand'),
      model: getVal('postModel'),
      year: parseInt(getVal('postYear'), 10) || 0,
      price: parseFloat(getVal('postPrice')) || 0,
      mileage: parseInt(getVal('postMileage'), 10) || 0,
      fuel: getVal('postFuel'),
      transmission: getVal('postTransmission'),
      location: getVal('postLocation'),
      images: images,
      image: images.length ? images[0] : '',
      description: getVal('postDesc')
    };
  }

  /* ===========================
     VALIDATION
     =========================== */

  function validateForm() {
    clearErrors();
    var valid = true;

    if (!getVal('postTitle')) { showFieldError('postTitle', _t('val.required_title')); valid = false; }
    if (!getVal('postBrand')) { showFieldError('postBrand', _t('val.required_brand')); valid = false; }
    if (!getVal('postModel')) { showFieldError('postModel', _t('val.required_model')); valid = false; }

    var year = parseInt(getVal('postYear'), 10);
    if (!year || year < 1990 || year > new Date().getFullYear() + 1) {
      showFieldError('postYear', _t('val.invalid_year', { max: new Date().getFullYear() + 1 }));
      valid = false;
    }

    var price = parseFloat(getVal('postPrice'));
    if (!price || price <= 0) {
      showFieldError('postPrice', _t('val.invalid_price'));
      valid = false;
    }

    var mileage = parseInt(getVal('postMileage'), 10);
    if (isNaN(mileage) || mileage < 0) {
      showFieldError('postMileage', _t('val.invalid_mileage'));
      valid = false;
    }

    if (!getVal('postDesc')) { showFieldError('postDesc', _t('val.required_desc')); valid = false; }

    return valid;
  }

  function showFieldError(inputId, message) {
    var input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input--error');
    var errorEl = input.parentElement.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('span');
      errorEl.className = 'field-error is-visible';
      input.parentElement.appendChild(errorEl);
    } else {
      errorEl.classList.add('is-visible');
    }
    errorEl.textContent = message;
  }

  function clearErrors() {
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
     PUBLIC API
     =========================== */

  return {
    initListPage: initListPage,
    initEditorPage: initEditorPage,
    getAllPosts: getAllPosts,
    getPostById: getPostById,
    getPostImages: getPostImages,
    getPostModeration: getPostModeration,
    isPostPubliclyVisible: isPostPubliclyVisible,
    canViewPost: canViewPost,
    isPostOwner: isPostOwner,
    filterPublicPosts: filterPublicPosts,
    getPostsByOwnerEmail: getPostsByOwnerEmail,
    getPendingPosts: getPendingPosts,
    getAvailableListingsByBrandModel: getAvailableListingsByBrandModel,
    getAvailableListingCountByBrandModel: getAvailableListingCountByBrandModel,
    updatePost: updatePost,
    showToast: showToast
  };
})();
