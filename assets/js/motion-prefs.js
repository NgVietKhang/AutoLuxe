/* =============================================
   MOTION-PREFS.JS - AutoLuxe Supercar Web
   Hero scroll + lite FX preferences (localStorage)
   ============================================= */

var MotionPrefs = (function () {
  'use strict';

  var KEY_HERO_SCROLL = 'autoluxe_hero_scroll';
  var KEY_LITE_FX = 'autoluxe_lite_fx';
  var KEY_MOTION_PRESET = 'autoluxe_motion_preset';

  function readFlag(key, defaultOn) {
    try {
      var saved = localStorage.getItem(key);
      if (saved === '1') return true;
      if (saved === '0') return false;
    } catch (e) { /* localStorage unavailable */ }
    return defaultOn;
  }

  function writeFlag(key, on) {
    try {
      localStorage.setItem(key, on ? '1' : '0');
    } catch (e) { /* ignore */ }
  }

  function isHeroScrollEnabled() {
    return readFlag(KEY_HERO_SCROLL, true);
  }

  function isLiteFxEnabled() {
    return readFlag(KEY_LITE_FX, false);
  }

  function setHeroScrollEnabled(on) {
    writeFlag(KEY_HERO_SCROLL, !!on);
    applyToDocument();
    dispatchChanged();
  }

  function setLiteFxEnabled(on) {
    writeFlag(KEY_LITE_FX, !!on);
    applyToDocument();
    dispatchChanged();
  }

  function getMotionPreset() {
    try {
      var v = localStorage.getItem(KEY_MOTION_PRESET);
      if (v === 'cinematic' || v === 'balanced' || v === 'minimal') return v;
    } catch (e) { /* ignore */ }
    return 'balanced';
  }

  function setMotionPreset(preset) {
    var v = preset === 'cinematic' || preset === 'minimal' ? preset : 'balanced';
    try {
      localStorage.setItem(KEY_MOTION_PRESET, v);
    } catch (e) { /* ignore */ }
    if (v === 'minimal') {
      setLiteFxEnabled(true);
      setHeroScrollEnabled(false);
    } else if (v === 'cinematic') {
      setLiteFxEnabled(false);
      setHeroScrollEnabled(true);
    }
    applyToDocument();
    dispatchChanged();
  }

  function applyToDocument() {
    var root = document.documentElement;
    root.setAttribute('data-hero-scroll', isHeroScrollEnabled() ? 'on' : 'off');
    root.setAttribute('data-fx-lite', isLiteFxEnabled() ? 'on' : 'off');
    root.setAttribute('data-motion-preset', getMotionPreset());
  }

  function dispatchChanged() {
    try {
      document.dispatchEvent(new CustomEvent('autoluxe:motion-prefs-changed'));
    } catch (e) { /* ignore */ }
  }

  function init() {
    applyToDocument();
  }

  return {
    KEY_HERO_SCROLL: KEY_HERO_SCROLL,
    KEY_LITE_FX: KEY_LITE_FX,
    isHeroScrollEnabled: isHeroScrollEnabled,
    isLiteFxEnabled: isLiteFxEnabled,
    setHeroScrollEnabled: setHeroScrollEnabled,
    setLiteFxEnabled: setLiteFxEnabled,
    getMotionPreset: getMotionPreset,
    setMotionPreset: setMotionPreset,
    applyToDocument: applyToDocument,
    init: init
  };
})();

(function () {
  'use strict';

  if (typeof MotionPrefs !== 'undefined' && typeof MotionPrefs.applyToDocument === 'function') {
    MotionPrefs.applyToDocument();
  }
})();
