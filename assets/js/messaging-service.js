/* =============================================
   MESSAGING-SERVICE.JS - AutoLuxe Phase 13
   ============================================= */

var MessagingService = (function () {
  'use strict';

  var listApi = AutoLuxeData.list('threads');

  function currentUser() {
    try {
      var session = Auth.getSession();
      if (!session) return null;
      return { id: session.userId, email: normalizeEmail(session.email) };
    } catch (e) {
      return null;
    }
  }

  function normalizeEmail(v) {
    return String(v || '').trim().toLowerCase();
  }

  function threadIdForPost(postId, buyerEmail) {
    return 'th_' + postId + '_' + normalizeEmail(buyerEmail);
  }

  function getAllThreads() {
    return listApi.getAll();
  }

  function getThread(id) {
    var all = getAllThreads();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function getOrCreateThread(post) {
    var user = currentUser();
    if (!user || !post) return null;
    var sellerEmail = normalizeEmail(post.ownerEmail || post.sellerEmail);
    if (sellerEmail === user.email) return null;

    var id = threadIdForPost(post.id, user.email);
    var existing = getThread(id);
    if (existing) return existing;

    var thread = {
      id: id,
      postId: post.id,
      postTitle: (post.brand || '') + ' ' + (post.model || ''),
      buyerId: user.id,
      buyerEmail: user.email,
      sellerId: post.ownerId || '',
      sellerEmail: sellerEmail,
      messages: [],
      updatedAt: Date.now(),
      inquiryCount: 0
    };
    listApi.update(function (all) {
      all.push(thread);
      return all;
    });
    incrementPostInquiry(post.id);
    return thread;
  }

  function incrementPostInquiry(postId) {
    if (typeof Marketplace === 'undefined' || !Marketplace.updatePost) return;
    var post = Marketplace.getPostById(postId);
    if (!post) return;
    Marketplace.updatePost(postId, { inquiryCount: (Number(post.inquiryCount) || 0) + 1 });
  }

  function getMyThreads() {
    var user = currentUser();
    if (!user) return [];
    return getAllThreads().filter(function (t) {
      return t.buyerEmail === user.email || t.sellerEmail === user.email;
    }).sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }

  function sendMessage(threadId, body) {
    var user = currentUser();
    if (!user || !body || !String(body).trim()) return { ok: false };
    var trimmed = String(body).trim();
    var msg = {
      id: 'msg_' + Date.now().toString(36),
      from: user.email,
      body: trimmed,
      at: Date.now()
    };
    var recipient = null;
    listApi.update(function (all) {
      return all.map(function (t) {
        if (t.id !== threadId) return t;
        if (t.buyerEmail !== user.email && t.sellerEmail !== user.email) return t;
        recipient = t.buyerEmail === user.email ? t.sellerEmail : t.buyerEmail;
        var messages = (t.messages || []).slice();
        messages.push(msg);
        return Object.assign({}, t, { messages: messages, updatedAt: Date.now() });
      });
    });
    if (recipient && typeof Notifications !== 'undefined' && Notifications.emitEvent) {
      Notifications.emitEvent('new_message', {
        userKey: recipient,
        threadId: threadId,
        params: { preview: trimmed.slice(0, 80) }
      });
    }
    bumpUnread(recipient);
    return { ok: true };
  }

  function bumpUnread(email) {
    if (!email) return;
    var map = AutoLuxeData.getScalar('autoluxe_inbox_unread', {});
    map[normalizeEmail(email)] = (Number(map[normalizeEmail(email)]) || 0) + 1;
    AutoLuxeData.setScalar('autoluxe_inbox_unread', map);
    try {
      document.dispatchEvent(new CustomEvent('autoluxe:inbox-changed'));
    } catch (e) { /* ignore */ }
  }

  function clearUnread(email) {
    var map = AutoLuxeData.getScalar('autoluxe_inbox_unread', {});
    delete map[normalizeEmail(email)];
    AutoLuxeData.setScalar('autoluxe_inbox_unread', map);
    try {
      document.dispatchEvent(new CustomEvent('autoluxe:inbox-changed'));
    } catch (e) { /* ignore */ }
  }

  function getUnreadCount() {
    var user = currentUser();
    if (!user) return 0;
    var map = AutoLuxeData.getScalar('autoluxe_inbox_unread', {});
    return Number(map[user.email]) || 0;
  }

  function markThreadRead(threadId) {
    var user = currentUser();
    if (!user) return;
    clearUnread(user.email);
  }

  return {
    getOrCreateThread: getOrCreateThread,
    getMyThreads: getMyThreads,
    getThread: getThread,
    sendMessage: sendMessage,
    getUnreadCount: getUnreadCount,
    markThreadRead: markThreadRead
  };
})();
