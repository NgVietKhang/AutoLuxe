/* =============================================
   MARKETPLACE.JS - AutoLuxe Supercar Web
   Marketplace CRUD: list, search, filter, delete
   ============================================= */

var Marketplace = (function () {
  'use strict';

  var KEYS = {
    posts: 'autoluxe_market_posts'
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

  function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('en-US');
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
            '<h3 class="market-state__title">Chưa có tin rao nào</h3>' +
            '<p class="market-state__desc">Hãy là người đầu tiên đăng tin bán siêu xe trên AutoLuxe!</p>' +
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
              (p.fuel ? '<span class="market-card__spec">' + escapeHtml(p.fuel) + '</span>' : '') +
              (p.transmission ? '<span class="market-card__spec">' + escapeHtml(p.transmission) + '</span>' : '') +
            '</div>' +
            '<p class="market-card__meta">📍 ' + escapeHtml(p.location || 'N/A') + ' &bull; ' + escapeHtml(p.ownerName || 'Ẩn danh') + '</p>' +
            '<p class="market-card__price">' + formatPrice(p.price) + '</p>' +
          '</div>' +
          '<div class="market-card__footer">' +
            '<span style="font-size:var(--fs-xs);color:var(--color-text-muted);">' + formatDate(p.createdAt) + '</span>' +
            '<div class="market-card__actions">' +
              '<a href="./market-detail.html?id=' + encodeURIComponent(p.id) + '" class="btn btn--primary btn--sm">Xem xe</a>' +
              (isOwner
                ? '<a href="./post-editor.html?id=' + encodeURIComponent(p.id) + '" class="btn btn--secondary btn--sm">Sửa</a>' +
                  '<button class="btn btn--danger btn--sm" data-delete-id="' + escapeHtml(p.id) + '">Xóa</button>'
                : '') +
            '</div>' +
          '</div>' +
        '</article>';
    }

    grid.innerHTML = html;
    bindDeleteButtons();
  }

  function formatDate(isoStr) {
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

    var posts = getAllPosts();

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
      showToast('Bạn cần đăng nhập để xóa tin.', 'error');
      return;
    }

    var post = getPostById(id);
    if (!post) {
      showToast('Tin rao không tồn tại.', 'error');
      return;
    }

    if (post.ownerEmail !== session.email) {
      showToast('Bạn không có quyền xóa tin này.', 'error');
      return;
    }

    var confirmed = confirm('Bạn có chắc muốn xóa tin "' + post.title + '"?');
    if (!confirmed) return;

    var success = deletePost(id);
    if (success) {
      showToast('Đã xóa tin thành công!', 'success');
      applyFilters();
    } else {
      showToast('Xóa tin thất bại. Vui lòng thử lại.', 'error');
    }
  }

  /* ===========================
     INIT MARKETPLACE PAGE
     =========================== */

  function initListPage() {
    Seed.run();

    applyFilters();

    var searchInput = document.getElementById('marketSearch');
    var sortSelect = document.getElementById('marketSort');
    var brandSelect = document.getElementById('marketBrand');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (brandSelect) brandSelect.addEventListener('change', applyFilters);

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('created') === '1') {
      showToast('Đăng tin thành công!', 'success');
    } else if (urlParams.get('updated') === '1') {
      showToast('Cập nhật tin thành công!', 'success');
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
        showToast('Tin rao không tồn tại.', 'error');
        setTimeout(function () { window.location.href = './marketplace.html'; }, 1500);
        return;
      }
      if (existingPost.ownerEmail !== session.email) {
        showToast('Bạn không có quyền sửa tin này.', 'error');
        setTimeout(function () { window.location.href = './marketplace.html'; }, 1500);
        return;
      }
      if (titleEl) titleEl.textContent = 'Chỉnh Sửa Tin Rao';
      if (submitBtn) submitBtn.textContent = 'Cập nhật tin';
      prefillForm(existingPost);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      var data = collectFormData();

      if (isEdit && existingPost) {
        var ok = updatePost(editId, data);
        if (ok) {
          window.location.href = './marketplace.html?updated=1';
        } else {
          showToast('Cập nhật thất bại. Vui lòng thử lại.', 'error');
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
          description: data.description,
          createdAt: new Date().toISOString()
        };
        var saved = savePost(newPost);
        if (saved) {
          window.location.href = './marketplace.html?created=1';
        } else {
          showToast('Đăng tin thất bại. Vui lòng thử lại.', 'error');
        }
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
    setVal('postImage', post.image);
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
      image: getVal('postImage'),
      description: getVal('postDesc')
    };
  }

  /* ===========================
     VALIDATION
     =========================== */

  function validateForm() {
    clearErrors();
    var valid = true;

    if (!getVal('postTitle')) { showFieldError('postTitle', 'Vui lòng nhập tiêu đề.'); valid = false; }
    if (!getVal('postBrand')) { showFieldError('postBrand', 'Vui lòng chọn hãng xe.'); valid = false; }
    if (!getVal('postModel')) { showFieldError('postModel', 'Vui lòng nhập model xe.'); valid = false; }

    var year = parseInt(getVal('postYear'), 10);
    if (!year || year < 1990 || year > new Date().getFullYear() + 1) {
      showFieldError('postYear', 'Năm sản xuất phải từ 1990 đến ' + (new Date().getFullYear() + 1) + '.');
      valid = false;
    }

    var price = parseFloat(getVal('postPrice'));
    if (!price || price <= 0) {
      showFieldError('postPrice', 'Giá phải lớn hơn 0.');
      valid = false;
    }

    var mileage = parseInt(getVal('postMileage'), 10);
    if (isNaN(mileage) || mileage < 0) {
      showFieldError('postMileage', 'Số km phải >= 0.');
      valid = false;
    }

    if (!getVal('postDesc')) { showFieldError('postDesc', 'Vui lòng nhập mô tả.'); valid = false; }

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
    updatePost: updatePost,
    showToast: showToast
  };
})();
