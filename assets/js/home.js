/* =============================================
   HOME.JS - AutoLuxe Supercar Web
   Landing page animations: hero timeline, parallax,
   scroll-reveal, count-up stats, 3D tilt, scroll progress,
   back-to-top. Progressive enhancement: works without GSAP.
   ============================================= */

(function () {
  'use strict';

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  var doc = document;
  var root = doc.documentElement;
  var prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasGSAP = !!window.gsap;

  /* ===========================
     PRELOAD COORDINATOR (hero GLB)
     =========================== */
  var preloadProgressEl = null;
  var preloadBarEl = null;
  var preloadBarWrap = null;

  function setBarWidth(bar, pct, immediate) {
    if (!bar) return;
    var width = pct + '%';
    if (immediate !== false) {
      bar.style.transition = 'none';
      bar.style.width = width;
      void bar.offsetWidth;
      bar.style.transition = '';
      return;
    }
    bar.style.width = width;
  }

  function shouldPreloadHero() {
    if (prefersReduced) return false;
    return !!doc.getElementById('heroStage');
  }

  var FINISH_DELAY_MS = 350;

  window.AutoLuxePreload = {
    total: 0,
    done: 0,
    revealed: false,
    finishScheduled: false,
    heroActive: false,
    assetProgress: { hero: 0 },

    expect: function (n) {
      if (n > 0) this.total += n;
      this.updateUI();
      this.check();
    },

    bump: function () {
      this.done = Math.min(this.done + 1, this.total || this.done + 1);
      this.updateUI();
      this.check();
    },

    setAssetProgress: function (id, ratio) {
      var r = Math.max(0, Math.min(1, ratio));
      if (id === 'hero') {
        this.assetProgress.hero = r;
        this.heroActive = true;
      }
      this.updateUI();
    },

    getOverallPercent: function () {
      if (this.heroActive) {
        return Math.min(100, Math.floor(this.assetProgress.hero * 100));
      }
      if (this.total > 0) {
        return Math.min(100, Math.floor((this.done / this.total) * 100));
      }
      return 0;
    },

    updateUI: function () {
      if (!preloadProgressEl) {
        preloadProgressEl = doc.getElementById('alPageTransitionProgress');
        preloadBarEl = doc.getElementById('alPageTransitionBar');
        preloadBarWrap = preloadBarEl ? preloadBarEl.parentElement : null;
      }
      var pct = this.getOverallPercent();
      if (preloadProgressEl) preloadProgressEl.textContent = pct + '%';
      setBarWidth(preloadBarEl, pct, true);
      if (preloadBarWrap) preloadBarWrap.setAttribute('aria-valuenow', String(pct));
    },

    check: function () {
      if (this.revealed) return;
      var assetsOk = this.total === 0 || this.done >= this.total;
      if (assetsOk) this.scheduleFinish();
    },

    scheduleFinish: function () {
      if (this.finishScheduled) return;
      this.finishScheduled = true;
      this.finish();
    },

    finish: function () {
      if (this.heroActive) this.setAssetProgress('hero', 1);
      this.updateUI();

      function runReveal() {
        if (typeof window.__autoluxeFinishReveal === 'function') {
          window.__autoluxeFinishReveal();
        }
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          setTimeout(runReveal, FINISH_DELAY_MS);
        });
      });
    }
  };

  if (shouldPreloadHero()) {
    window.AutoLuxePreload.heroActive = true;
    window.AutoLuxePreload.expect(1);
  }

  function ready(fn) {
    if (doc.readyState !== 'loading') {
      fn();
    } else {
      doc.addEventListener('DOMContentLoaded', fn);
    }
  }

  /* ===========================
     COUNT-UP STATS (no GSAP needed)
     =========================== */
  function formatCount(value) {
    var rounded = Math.round(value);
    if (window.I18n && typeof I18n.formatNumber === 'function') {
      try {
        return I18n.formatNumber(rounded, { maximumFractionDigits: 0 });
      } catch (e) { /* fall through */ }
    }
    return String(rounded);
  }

  function setFinalCount(el) {
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';
    el.textContent = formatCount(target) + suffix;
    el.classList.add('is-counted');
  }

  function animateCount(el) {
    if (el.classList.contains('is-counted')) return;
    var target = parseFloat(el.getAttribute('data-count-to')) || 0;
    var suffix = el.getAttribute('data-count-suffix') || '';
    var duration = 1600;
    var startTime = null;

    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCount(target * eased) + suffix;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        setFinalCount(el);
      }
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = doc.querySelectorAll('.stats__num');
    if (!counters.length) return;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      for (var i = 0; i < counters.length; i++) setFinalCount(counters[i]);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      for (var j = 0; j < counters.length; j++) io.observe(counters[j]);
    }

    // Reformat already-counted numbers when locale switches
    doc.addEventListener('autoluxe:locale-changed', function () {
      var done = doc.querySelectorAll('.stats__num.is-counted');
      for (var k = 0; k < done.length; k++) setFinalCount(done[k]);
    });
  }

  /* ===========================
     BRAND MARQUEE (seamless loop)
     =========================== */
  function initMarquee() {
    var track = doc.querySelector('[data-marquee]');
    if (!track || track.getAttribute('data-cloned')) return;
    track.innerHTML += track.innerHTML;
    track.setAttribute('data-cloned', '1');
  }

  /* ===========================
     SCROLL PROGRESS BAR
     =========================== */
  function initScrollProgress() {
    var bar = doc.querySelector('.scroll-progress__bar');
    if (!bar) return;
    var ticking = false;

    function update() {
      var max = root.scrollHeight - root.clientHeight;
      var y = window.pageYOffset || root.scrollTop || 0;
      var p = max > 0 ? (y / max) : 0;
      bar.style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ===========================
     BACK TO TOP
     =========================== */
  function initBackToTop() {
    var btn = doc.getElementById('backToTop');
    if (!btn) return;
    var ticking = false;

    function update() {
      var y = window.pageYOffset || root.scrollTop || 0;
      btn.classList.toggle('is-visible', y > 500);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
    update();
  }

  /* ===========================
     GSAP-DRIVEN ANIMATIONS
     =========================== */
  function splitHeroTitle() {
    var title = doc.querySelector('.hero__title');
    if (!title || title.getAttribute('data-split')) return;

    var nodes = Array.prototype.slice.call(title.childNodes);
    var frag = doc.createDocumentFragment();

    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var parts = node.textContent.split(/(\s+)/);
        parts.forEach(function (part) {
          if (part === '') return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(doc.createTextNode(part));
          } else {
            var w = doc.createElement('span');
            w.className = 'hero__word';
            w.textContent = part;
            frag.appendChild(w);
          }
        });
      } else if (node.nodeType === 1) {
        var wrap = doc.createElement('span');
        wrap.className = 'hero__word';
        wrap.appendChild(node.cloneNode(true));
        frag.appendChild(wrap);
      }
    });

    title.innerHTML = '';
    title.appendChild(frag);
    title.setAttribute('data-split', '1');
  }

  function playHeroIntro(gsap) {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.set('.hero__title', { opacity: 1 });
    tl.fromTo('.hero__eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    tl.fromTo('.hero__word', { opacity: 0, y: 44 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7 }, '-=0.2');
    tl.fromTo('.hero__subtitle', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.35');
    tl.fromTo('.hero__actions', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.45');
    tl.fromTo('.hero__scroll-cue', { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.2');
  }

  function initReveals(gsap) {
    var hasST = !!window.ScrollTrigger;
    var items = gsap.utils.toArray('[data-reveal]');

    if (!hasST) {
      gsap.set(items, { opacity: 1, y: 0, clearProps: 'transform' });
      items.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    items.forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'transform',
          onComplete: function () {
            el.classList.add('is-revealed');
          },
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });
  }

  function isHeroScrollPrefEnabled() {
    if (prefersReduced) return false;
    if (typeof MotionPrefs !== 'undefined' && typeof MotionPrefs.isHeroScrollEnabled === 'function') {
      return MotionPrefs.isHeroScrollEnabled();
    }
    return root.getAttribute('data-hero-scroll') !== 'off';
  }

  function initParallax(gsap) {
    if (!window.ScrollTrigger) return;

    var heroBg = doc.querySelector('.hero__bg');
    if (heroBg && !doc.querySelector('.hero__stage') && isHeroScrollPrefEnabled()) {
      gsap.fromTo(heroBg,
        { yPercent: -8, scale: 1.05 },
        {
          yPercent: 8, scale: 1.05, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        }
      );
    }

    var ctaBg = doc.querySelector('.cta-banner__bg');
    if (ctaBg) {
      gsap.fromTo(ctaBg,
        { yPercent: -10 },
        {
          yPercent: 10, ease: 'none',
          scrollTrigger: { trigger: '.cta-banner', start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    }
  }

  /* 3D tilt + glare is now handled site-wide by app.js (window.AutoLuxeMotion).
     The shared engine targets .card--tilt via document delegation, so the
     per-card listeners that used to live here were removed to avoid a double
     bind that fought over the inline transform. */

  var hero3dCinematicBuilt = false;

  function initHero3DCinematic(gsap) {
    if (!isHeroScrollPrefEnabled()) return;
    if (!window.ScrollTrigger || hero3dCinematicBuilt) return;
    if (window.matchMedia && !window.matchMedia('(min-width: 768px)').matches) return;

    function build() {
      if (hero3dCinematicBuilt) return;
      if (!window.AutoLuxeHero3D || !window.AutoLuxeHero3D.active) return;
      hero3dCinematicBuilt = true;

      window.AutoLuxeHeroScrollEnd = function () { return window.innerHeight * 1.1; };

      gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 0,
          end: function () { return window.innerHeight * 1.1; },
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) {
            window.AutoLuxeHero3D.setExitProgress(self.progress);
          }
        }
      })
        .to('.hero__content', { xPercent: -135, opacity: 0, ease: 'power2.in', duration: 1 }, 0)
        .to('.hero__speedo', { opacity: 0, ease: 'power1.in', duration: 1 }, 0)
        .to('.hero__scroll-cue', { opacity: 0, ease: 'none', duration: 1 }, 0);

      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }

    if (window.AutoLuxeHero3D && window.AutoLuxeHero3D.active) {
      build();
    } else {
      doc.addEventListener('autoluxe:hero3d-ready', build, { once: true });
    }
  }

  function initGSAP() {
    var gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    splitHeroTitle();
    initReveals(gsap);
    initParallax(gsap);
    initHero3DCinematic(gsap);

    window.addEventListener('load', function () {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  }

  var heroRevealed = false;

  function dismissHomeTransition() {
    var overlay = doc.getElementById('alPageTransition');
    if (!overlay) return;
    overlay.classList.remove('is-active', 'is-home-preload');
  }

  function revealHero() {
    if (heroRevealed) return;
    heroRevealed = true;
    if (window.AutoLuxePreload) window.AutoLuxePreload.revealed = true;

    try {
      sessionStorage.removeItem('autoluxe_home_preload');
    } catch (e) { /* ignore */ }

    window.scrollTo(0, 0);
    root.classList.remove('is-loading');
    dismissHomeTransition();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();

    if (!prefersReduced && hasGSAP && window.gsap) {
      playHeroIntro(window.gsap);
    } else {
      root.classList.remove('anim-ready');
    }

    if (window.AutoLuxeHero3D && typeof window.AutoLuxeHero3D.playIntro === 'function') {
      window.AutoLuxeHero3D.playIntro();
    }
  }

  function scheduleHeroReveal() {
    var preload = window.AutoLuxePreload;
    var needsAssets = preload && preload.total > 0;

    window.__autoluxeFinishReveal = revealHero;

    if (needsAssets) {
      preload.updateUI();
      preload.check();
      setTimeout(function () {
        if (!preload.revealed) revealHero();
      }, 15000);
    } else {
      revealHero();
    }
  }

  function bootHeroReveal() {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', scheduleHeroReveal, { once: true });
    } else {
      scheduleHeroReveal();
    }
  }

  /* ===========================
     INIT
     =========================== */
  ready(function () {
    window.scrollTo(0, 0);
    initMarquee();
    initScrollProgress();
    initBackToTop();
    initCounters();

    if (!prefersReduced && hasGSAP) {
      initGSAP();
    }

    bootHeroReveal();
  });
})();
