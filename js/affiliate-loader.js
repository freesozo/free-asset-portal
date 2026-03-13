/* ========================================
   Affiliate Loader – affiliate-loader.js
   Loads data/affiliates.json and renders
   recommendation cards into .affiliate-slot
   elements on the page.
   ======================================== */
(function () {
  'use strict';

  var CACHE = null;

  function escapeHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getLang() {
    try { return localStorage.getItem('lang') || 'ja'; } catch (e) { return 'ja'; }
  }

  function loc(ja, en) {
    return getLang() === 'en' && en ? en : (ja || '');
  }

  /** Fetch affiliates.json (cached) */
  async function fetchAffiliates() {
    if (CACHE) return CACHE;
    try {
      var res = await fetch('data/affiliates.json');
      if (!res.ok) throw new Error(res.status);
      var data = await res.json();
      CACHE = data.affiliates || [];
      return CACHE;
    } catch (e) {
      console.warn('[affiliate-loader] Failed to load affiliates.json', e);
      return [];
    }
  }

  /** Filter & sort by page and priority */
  async function loadAffiliates(pageId) {
    var all = await fetchAffiliates();
    return all
      .filter(function (a) { return a.display_pages.indexOf(pageId) !== -1; })
      .sort(function (a, b) { return a.priority - b.priority; });
  }

  /** Render star rating as text */
  function renderStars(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return '<span class="aff-stars">' +
      Array(full + 1).join('<span class="aff-star full">&#9733;</span>') +
      (half ? '<span class="aff-star half">&#9733;</span>' : '') +
      Array(empty + 1).join('<span class="aff-star empty">&#9734;</span>') +
      '</span> <span class="aff-rating-num">' + rating.toFixed(1) + '</span>';
  }

  /** Build one affiliate card HTML */
  function renderCard(aff) {
    var lang = getLang();
    var name = escapeHtml(loc(aff.name, aff.nameEn));
    var badge = escapeHtml(loc(aff.badge, aff.badgeEn));
    var price = escapeHtml(loc(aff.price, aff.priceEn));
    var features = (lang === 'en' && aff.featuresEn) ? aff.featuresEn : aff.features;
    var ctaText = lang === 'en' ? 'Learn more' : '詳しく見る';
    var prLabel = 'PR';

    var featHtml = '';
    if (features && features.length) {
      featHtml = '<ul class="aff-features">';
      features.forEach(function (f) {
        featHtml += '<li>' + escapeHtml(f) + '</li>';
      });
      featHtml += '</ul>';
    }

    return '<div class="aff-card">' +
      '<span class="aff-pr-label">' + prLabel + '</span>' +
      '<div class="aff-card-head">' +
        '<span class="aff-name">' + name + '</span>' +
        '<span class="aff-badge">' + badge + '</span>' +
      '</div>' +
      featHtml +
      '<div class="aff-card-meta">' +
        '<span class="aff-price">' + price + '</span>' +
        '<span class="aff-rating">' + renderStars(aff.rating) + '</span>' +
      '</div>' +
      '<a href="' + escapeHtml(aff.url) + '" class="aff-cta" target="_blank" ' +
        'rel="nofollow sponsored noopener" ' +
        'onclick="if(typeof trackClick===\'function\')trackClick(\'' + escapeHtml(aff.id) + '\')">' +
        ctaText + ' &rarr;</a>' +
    '</div>';
  }

  /** Insert cards into all .affiliate-slot elements on the page */
  async function insertAffiliateSlots() {
    var slots = document.querySelectorAll('.affiliate-slot');
    if (!slots.length) return;

    slots.forEach(async function (slot) {
      var pageId = slot.getAttribute('data-page') || 'index';
      var maxItems = parseInt(slot.getAttribute('data-max') || '4', 10);
      var affiliates = await loadAffiliates(pageId);
      if (!affiliates.length) return;

      var items = affiliates.slice(0, maxItems);
      var sectionTitle = getLang() === 'en'
        ? 'Upgrade your workflow'
        : '制作環境をもっと快適に';

      var html = '<section class="aff-section">' +
        '<h3 class="aff-section-title">' + sectionTitle + '</h3>' +
        '<div class="aff-grid">';
      items.forEach(function (a) { html += renderCard(a); });
      html += '</div></section>';

      slot.innerHTML = html;
    });
  }

  // Re-render on language change
  window.addEventListener('langchange', function () {
    CACHE = null; // bust potential stale loc
    insertAffiliateSlots();
  });

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertAffiliateSlots);
  } else {
    insertAffiliateSlots();
  }

  // Expose for manual calls
  window.AffiliateLoader = { load: insertAffiliateSlots };
})();
