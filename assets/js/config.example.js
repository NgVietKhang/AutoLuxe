/**
 * Copy this file to config.local.js for optional local overrides.
 * config.local.js is gitignored — never commit secrets.
 *
 * Catalog model names come from free NHTSA vPIC.
 * Vehicle images/specs come from CAR_DATABASE (assets/js/car-data.js).
 */
window.AUTOLUXE_CONFIG = window.AUTOLUXE_CONFIG || {};

/**
 * Data layer (Phase 8+)
 * - dataProvider: 'local' (default) | 'remote'
 * - remoteUrl: API base when remote is enabled (stub until Phase 15)
 */
window.AUTOLUXE_CONFIG.dataProvider = window.AUTOLUXE_CONFIG.dataProvider || 'local';
window.AUTOLUXE_CONFIG.remoteUrl = window.AUTOLUXE_CONFIG.remoteUrl || '';

/**
 * Contact / consult channels (copy values into config.local.js)
 */
window.AUTOLUXE_CONFIG.contact = window.AUTOLUXE_CONFIG.contact || {
  enabled: true,
  hotline: '',
  zalo: '',
  messenger: '',
  whatsapp: '',
  hours: '8:00 - 22:00'
};
