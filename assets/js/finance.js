/* =============================================
   FINANCE.JS - AutoLuxe Phase 11
   Loan / financing calculator (simulation)
   ============================================= */

var FinanceCalculator = (function () {
  'use strict';

  var DRAFT_KEY = AutoLuxeData.COLLECTION_KEYS.finance_draft;

  function monthlyPayment(principal, annualRate, months) {
    if (months <= 0) return 0;
    if (!annualRate || annualRate <= 0) return principal / months;
    var r = annualRate / 100 / 12;
    return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  function calculate(opts) {
    var price = Math.max(0, Number(opts.price) || 0);
    var downPct = Math.min(90, Math.max(0, Number(opts.downPct) || 20));
    var months = Math.min(84, Math.max(12, Number(opts.months) || 60));
    var rate = Math.max(0, Number(opts.rate) || 6.5);
    var down = price * (downPct / 100);
    var principal = Math.max(0, price - down);
    var monthly = monthlyPayment(principal, rate, months);
    var totalPaid = monthly * months + down;
    var totalInterest = totalPaid - price;
    return {
      price: price,
      down: down,
      downPct: downPct,
      principal: principal,
      months: months,
      rate: rate,
      monthly: monthly,
      totalPaid: totalPaid,
      totalInterest: totalInterest
    };
  }

  function saveDraft(data) {
    AutoLuxeData.setScalar(DRAFT_KEY, data);
  }

  function loadDraft() {
    return AutoLuxeData.getScalar(DRAFT_KEY, null);
  }

  function mount(selector, opts) {
    var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;

    var price = Number(opts.price) || 0;
    var draft = loadDraft();
    var state = {
      price: price,
      downPct: (draft && draft.downPct) || 20,
      months: (draft && draft.months) || 60,
      rate: (draft && draft.rate) || 6.5
    };

    function render() {
      var result = calculate(state);
      saveDraft({ downPct: state.downPct, months: state.months, rate: state.rate });

      el.innerHTML =
        '<section class="finance-panel" data-reveal>' +
        '<h2 class="detail-specs__title">' + esc(_t('finance.title')) + '</h2>' +
        '<p class="finance-panel__disclaimer">' + esc(_t('finance.disclaimer')) + '</p>' +
        '<div class="finance-panel__grid">' +
        '<label class="finance-field"><span>' + esc(_t('finance.price')) + '</span>' +
        '<input type="number" id="finPrice" min="0" step="1000" value="' + Math.round(state.price) + '"></label>' +
        '<label class="finance-field"><span>' + esc(_t('finance.down_pct')) + ' (' + state.downPct + '%)</span>' +
        '<input type="range" id="finDown" min="0" max="80" value="' + state.downPct + '"></label>' +
        '<label class="finance-field"><span>' + esc(_t('finance.term')) + '</span>' +
        '<select id="finMonths">' +
        [12, 24, 36, 48, 60, 72, 84].map(function (m) {
          return '<option value="' + m + '"' + (m === state.months ? ' selected' : '') + '>' + m + ' ' + _t('finance.months') + '</option>';
        }).join('') +
        '</select></label>' +
        '<label class="finance-field"><span>' + esc(_t('finance.rate')) + '</span>' +
        '<input type="number" id="finRate" min="0" max="30" step="0.1" value="' + state.rate + '"></label>' +
        '</div>' +
        '<div class="finance-results">' +
        '<div class="finance-result"><span class="finance-result__label">' + esc(_t('finance.monthly')) + '</span>' +
        '<strong class="finance-result__value">' + formatMoney(result.monthly) + '</strong></div>' +
        '<div class="finance-result"><span class="finance-result__label">' + esc(_t('finance.total_interest')) + '</span>' +
        '<strong>' + formatMoney(result.totalInterest) + '</strong></div>' +
        '<div class="finance-result"><span class="finance-result__label">' + esc(_t('finance.total_paid')) + '</span>' +
        '<strong>' + formatMoney(result.totalPaid) + '</strong></div>' +
        '</div></section>';

      var finPrice = el.querySelector('#finPrice');
      var finDown = el.querySelector('#finDown');
      var finMonths = el.querySelector('#finMonths');
      var finRate = el.querySelector('#finRate');

      function refresh() {
        state.price = Number(finPrice.value) || 0;
        state.downPct = Number(finDown.value) || 0;
        state.months = Number(finMonths.value) || 60;
        state.rate = Number(finRate.value) || 0;
        render();
      }

      finPrice.addEventListener('change', refresh);
      finDown.addEventListener('input', refresh);
      finMonths.addEventListener('change', refresh);
      finRate.addEventListener('change', refresh);
    }

    render();
  }

  function formatMoney(n) {
    if (typeof I18n !== 'undefined' && I18n.formatCurrency) {
      return I18n.formatCurrency(n);
    }
    return '$' + Math.round(n).toLocaleString();
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  return {
    calculate: calculate,
    mount: mount,
    saveDraft: saveDraft,
    loadDraft: loadDraft
  };
})();
