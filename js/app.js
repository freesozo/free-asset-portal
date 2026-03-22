// app.js – 検索・フィルター・カード描画・モーダル・ページネーション・ダークモード・お気に入り・比較・詳細
const App = (() => {
  let data = { sites: [], categories: [], useCases: [], premiumSites: [] };
  let state = {
    search: '',
    category: null,
    useCase: null,
    region: null,
    filters: { freeOnly: false, commercial: false, creditFree: false, regFree: false, beginner: false },
    sort: 'rating',
    page: 1,
    perPage: 24,
    showFavoritesOnly: false,
    compareMode: false,
    compareIds: [],
  };

  let activeFormats = [];

  // DOM refs (set on init)
  let $grid, $recGrid, $searchInput, $sortSelect, $resultCount;
  let $modalOverlay;
  let $loadMoreBtn;
  let isCategory = false;

  // ── Favorites (localStorage) ──
  let favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
  function saveFavorites() { localStorage.setItem('favorites', JSON.stringify([...favorites])); }
  function isFavorite(id) { return favorites.has(id); }
  function toggleFavorite(id) {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
  }

  // ── Debounce ──
  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  // ── Fetch data ──
  async function loadData() {
    const base = document.querySelector('script[data-base]')?.dataset.base || '.';
    const res = await fetch(`${base}/data/sites.json`);
    data = await res.json();
  }

  // ── Stars ──
  function stars(n) {
    const filled = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const empty = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    return filled.repeat(n) + empty.repeat(5 - n);
  }

  // ── Category colors for initials icon ──
  var catColors = {
    photo:'#3d5a80', illustration:'#8b7bb8', icon:'#457b6e', music:'#6d597a',
    video:'#b56b4f', font:'#2d3142', '3d':'#4a6fa5', template:'#9e8c6c',
    texture:'#7d8570', asset:'#6a4c93', sound:'#5c6b73', archive:'#8b8589', mockup:'#a68a64'
  };
  function gradeLabel(r) {
    if (r >= 5) return { letter: 'S', cls: 'grade-s' };
    if (r >= 4) return { letter: 'A', cls: 'grade-a' };
    if (r >= 3) return { letter: 'B', cls: 'grade-b' };
    if (r >= 2) return { letter: 'C', cls: 'grade-c' };
    return { letter: 'D', cls: 'grade-d' };
  }
  function getInitials(name) {
    if (!name) return '??';
    // For ASCII names take first 2 chars; for CJK take first 1-2
    const c = name.charAt(0);
    if (c.charCodeAt(0) > 255) return name.substring(0, 1);
    return name.substring(0, 2);
  }

  // ── Card HTML ──
  function cardHTML(site) {
    const name = I18n.localize(site.name);
    const highlight = I18n.localize(site.highlight);
    const badges = [];
    if (site.commercial) badges.push(`<span class="badge badge-ok">${I18n.t('commercial')}</span>`);
    if (!site.creditRequired) badges.push(`<span class="badge badge-credit">${I18n.t('creditFree')}</span>`);
    if (!site.registrationRequired) badges.push(`<span class="badge badge-info">${I18n.t('regFree')}</span>`);

    const cat = data.categories.find(c => c.id === site.category);
    const isNew = site.dateAdded && (Date.now() - new Date(site.dateAdded).getTime()) < 30 * 86400000;
    const newBadge = isNew ? ' <span class="new-badge">NEW</span>' : '';
    const favFill = isFavorite(site.id) ? '#ef4444' : 'none';
    const favStroke = isFavorite(site.id) ? '#ef4444' : 'currentColor';
    const favIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="${favFill}" stroke="${favStroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    const favLabel = isFavorite(site.id) ? I18n.t('unfavorite') : I18n.t('favorite');

    const compareOverlay = state.compareMode
      ? `<div class="compare-check">${state.compareIds.includes(site.id) ? '✓' : ''}</div>`
      : '';
    const selectedClass = state.compareMode && state.compareIds.includes(site.id) ? ' compare-selected' : '';

    const initials = getInitials(name);
    const iconColor = catColors[site.category] || '#8b8589';
    const grade = gradeLabel(site.rating);
    const domain = (site.url || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const formats = (site.tags || []).filter(t => ['png','svg','jpg','mp3','mp4','otf'].includes(t)).map(t => t.toUpperCase()).join('  ');

    return `
      <article class="card${selectedClass}" data-id="${site.id}" role="button" tabindex="0" aria-label="${name}">
        ${compareOverlay}
        <div class="card-top">
          <div class="card-initials" style="background:${iconColor}">${initials}</div>
          <div class="card-identity">
            <span class="card-name">${name}${newBadge}</span>
            <span class="card-domain">${domain}</span>
          </div>
          <div class="card-score">
            <span class="card-grade ${grade.cls}">${grade.letter}</span>
            <span class="card-rating-num"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${site.rating}</span>
          </div>
          <button class="fav-btn" data-id="${site.id}" aria-label="${favLabel}" title="${favLabel}">${favIcon}</button>
        </div>
        <p class="card-highlight">${highlight}</p>
        <div class="card-badges">${badges.join('')}</div>
        <div class="card-meta">
          <span class="card-formats">${formats}</span>
          <span class="card-verified">${I18n.t('verifiedDate')}</span>
        </div>
      </article>`;
  }

  // ── Filter logic ──
  function filtered() {
    let list = data.sites.filter(s => {
      if (state.category && s.category !== state.category) return false;
      if (state.useCase && !s.useCases.includes(state.useCase)) return false;
      if (state.region === 'jp' && !s.tags.includes('japanese')) return false;
      if (state.filters.freeOnly && s.isPaid) return false;
      if (state.filters.commercial && !s.commercial) return false;
      if (state.filters.creditFree && s.creditRequired) return false;
      if (state.filters.regFree && s.registrationRequired) return false;
      if (state.filters.beginner && !s.beginnerFriendly) return false;
      if (state.showFavoritesOnly && !isFavorite(s.id)) return false;
      if (state.search) {
        const q = state.search.toLowerCase();
        const haystack = [
          I18n.localize(s.name),
          I18n.localize(s.description),
          I18n.localize(s.highlight),
          ...s.tags
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    // Format filter (AND with other filters, OR among selected formats)
    if (activeFormats.length > 0) {
      list = list.filter(s => {
        const tags = s.tags || [];
        return activeFormats.some(f => tags.includes(f));
      });
    }
    return list;
  }

  function sorted(list) {
    if (state.sort === 'name') {
      return [...list].sort((a, b) => I18n.localize(a.name).localeCompare(I18n.localize(b.name)));
    }
    return [...list].sort((a, b) => b.rating - a.rating);
  }

  // ── Render ──
  function render() {
    const allSites = sorted(filtered());
    const visible = allSites.slice(0, state.page * state.perPage);

    // Main grid
    if ($grid) {
      if (allSites.length === 0) {
        $grid.innerHTML = `<div class="no-results">${I18n.t('noResults')}</div>`;
      } else {
        $grid.innerHTML = visible.map(cardHTML).join('');
        // Staggered fade-in for cards
        if (typeof IntersectionObserver !== 'undefined') {
          $grid.querySelectorAll('.card').forEach(function(card, i) {
            card.classList.add('fade-in-up');
            card.style.transitionDelay = (i % 12) * 0.05 + 's';
            fadeObserver && fadeObserver.observe(card);
          });
        }
      }
    }

    // Load more button
    if ($loadMoreBtn) {
      $loadMoreBtn.style.display = visible.length < allSites.length ? '' : 'none';
    }

    // Recommended: hide when any filter is active
    const $recSection = document.getElementById('recSection');
    const hasActiveFilter = state.category || state.useCase || state.search || state.region ||
      state.filters.freeOnly || state.filters.commercial || state.filters.creditFree || state.filters.regFree || state.filters.beginner ||
      state.showFavoritesOnly || activeFormats.length > 0;

    if ($recSection) {
      $recSection.style.display = hasActiveFilter ? 'none' : '';
    }

    if ($recGrid && !isCategory && !hasActiveFilter) {
      const rec = data.sites
        .filter(s => s.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
      $recGrid.innerHTML = rec.map(cardHTML).join('');
    }

    // Result count
    if ($resultCount) {
      $resultCount.textContent = `${visible.length} / ${allSites.length}`;
    }

    // Personalized sections
    renderRecentlyViewed();
    renderFavoritesHome();

    // Compare bar
    updateCompareBar();
  }

  // ── Compare bar ──
  function updateCompareBar() {
    let $bar = document.getElementById('compareBar');
    if (!state.compareMode || state.compareIds.length === 0) {
      if ($bar) $bar.style.display = 'none';
      return;
    }
    if (!$bar) {
      $bar = document.createElement('div');
      $bar.id = 'compareBar';
      $bar.className = 'compare-bar';
      document.body.appendChild($bar);
    }
    const names = state.compareIds.map(id => {
      const s = data.sites.find(x => x.id === id);
      return s ? I18n.localize(s.name) : id;
    });
    $bar.innerHTML = `
      <div class="compare-bar-inner container">
        <span class="compare-bar-names">${names.join(' / ')}</span>
        <button class="btn-compare-now" id="compareNowBtn">${I18n.t('compareNow')} (${state.compareIds.length})</button>
      </div>`;
    $bar.style.display = '';
    document.getElementById('compareNowBtn').addEventListener('click', openCompareModal);
  }

  // ── Compare modal ──
  function openCompareModal() {
    if (state.compareIds.length < 2) return;
    const sites = state.compareIds.map(id => data.sites.find(s => s.id === id)).filter(Boolean);

    const rows = [
      { label: I18n.t('modalRating'), fn: s => stars(s.rating) },
      { label: I18n.t('modalCategory'), fn: s => {
        const cat = data.categories.find(c => c.id === s.category);
        return cat ? `${cat.icon} ${I18n.localize(cat.name)}` : '';
      }},
      { label: I18n.t('commercial'), fn: s => s.commercial ? '✓' : '✗' },
      { label: I18n.t('creditFree'), fn: s => s.creditRequired ? '⚠ ' + I18n.t('creditRequired') : '✓ ' + I18n.t('creditFree') },
      { label: I18n.t('regFree'), fn: s => s.registrationRequired ? '⚠ ' + I18n.t('regRequired') : '✓ ' + I18n.t('regFree') },
      { label: I18n.t('beginnerOk'), fn: s => s.beginnerFriendly ? '✓' : '—' },
      { label: I18n.t('modalUseCases'), fn: s => s.useCases.map(uid => {
        const uc = data.useCases.find(u => u.id === uid);
        return uc ? I18n.localize(uc.name) : '';
      }).filter(Boolean).join(', ') },
    ];

    const headerCols = sites.map(s => `<th>${I18n.localize(s.name)}</th>`).join('');
    const bodyRows = rows.map(r =>
      `<tr><th>${r.label}</th>${sites.map(s => `<td>${r.fn(s)}</td>`).join('')}</tr>`
    ).join('');
    const visitRow = `<tr><th></th>${sites.map(s =>
      `<td><a href="${s.affiliateUrl || s.url}" target="_blank" rel="noopener noreferrer" class="btn-visit" style="font-size:.82rem;padding:8px 14px;">${I18n.t('visitSite')} ↗</a></td>`
    ).join('')}</tr>`;

    document.getElementById('modalTitle').textContent = I18n.t('compareHeading');
    document.getElementById('modalBody').innerHTML = `
      <div class="compare-table-wrap">
        <table class="compare-table">
          <thead><tr><th></th>${headerCols}</tr></thead>
          <tbody>${bodyRows}${visitRow}</tbody>
        </table>
      </div>`;
    $modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // ── Modal ──
  function openModal(id) {
    const site = data.sites.find(s => s.id === id);
    if (!site) return;

    trackRecentlyViewed(site.id);

    const cat = data.categories.find(c => c.id === site.category);
    const ucLabels = site.useCases.map(uid => {
      const uc = data.useCases.find(u => u.id === uid);
      return uc ? `<span class="badge badge-info">${uc.icon} ${I18n.localize(uc.name)}</span>` : '';
    }).join('');

    const favIcon = isFavorite(site.id) ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    const favLabel = isFavorite(site.id) ? I18n.t('unfavorite') : I18n.t('favorite');

    document.getElementById('modalTitle').textContent = I18n.localize(site.name);
    document.getElementById('modalBody').innerHTML = `
      <div class="modal-rating">${stars(site.rating)}</div>
      <div class="modal-highlight">${I18n.localize(site.highlight)}</div>
      <p class="modal-desc">${I18n.localize(site.description)}</p>

      <div class="modal-section-label">${I18n.t('modalLicense')}</div>
      <div class="modal-meta">
        <div class="meta-item">
          <span class="meta-icon ${site.commercial ? 'meta-ok' : 'meta-warn'}">${site.commercial ? '✓' : '✗'}</span>
          ${I18n.t(site.commercial ? 'commercial' : 'commercial')}
          ${site.commercial ? '' : ' ✗'}
        </div>
        <div class="meta-item">
          <span class="meta-icon ${!site.creditRequired ? 'meta-ok' : 'meta-warn'}">${!site.creditRequired ? '✓' : '⚠'}</span>
          ${I18n.t(site.creditRequired ? 'creditRequired' : 'creditFree')}
        </div>
        <div class="meta-item">
          <span class="meta-icon ${!site.registrationRequired ? 'meta-ok' : 'meta-warn'}">${!site.registrationRequired ? '✓' : '⚠'}</span>
          ${I18n.t(site.registrationRequired ? 'regRequired' : 'regFree')}
        </div>
        <div class="meta-item">
          <span class="meta-icon ${site.beginnerFriendly ? 'meta-ok' : ''}">${site.beginnerFriendly ? '✓' : '—'}</span>
          ${I18n.t('beginnerOk')}
        </div>
      </div>

      <div class="modal-section-label">${I18n.t('modalCategory')}</div>
      <div class="modal-tags">
        ${cat ? `<span class="badge badge-info">${cat.icon} ${I18n.localize(cat.name)}</span>` : ''}
      </div>

      <div class="modal-section-label">${I18n.t('modalUseCases')}</div>
      <div class="modal-usecases">${ucLabels}</div>

      <div class="modal-section-label">Tags</div>
      <div class="modal-tags">${site.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>

      <div class="modal-actions">
        <button class="modal-fav-btn fav-btn" data-id="${site.id}" aria-label="${favLabel}">${favIcon} ${favLabel}</button>
        <a href="detail.html?id=${site.id}" class="btn-detail">${I18n.t('viewDetail')} →</a>
      </div>

      <a href="${site.affiliateUrl || site.url}" target="_blank" rel="noopener noreferrer" class="btn-visit">
        ${I18n.t('visitSite')} ↗
      </a>
    `;

    // Modal fav button
    const $modalFav = document.querySelector('.modal-fav-btn');
    if ($modalFav) {
      $modalFav.addEventListener('click', e => {
        e.stopPropagation();
        toggleFavorite(site.id);
        openModal(site.id);
        render();
      });
    }

    $modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    renderRecentlyViewed();
  }

  // ── Category nav rendering ──
  // SVG icons for category cards (simple, self-contained, no external deps)
  var catSVG = {
    illustration: '<path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.24 3.93L12 22l-.76-12.07A4.002 4.002 0 0 1 12 2z"/><circle cx="7" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="5" cy="14" r="2"/><circle cx="19" cy="14" r="2"/>',
    photo: '<rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M15 2h-2l-1 4h4z"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    sound: '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    video: '<rect x="2" y="4" width="15" height="16" rx="2"/><polygon points="22,8 17,12 22,16"/>',
    icon: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    texture: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    asset: '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>',
    mockup: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/>',
    archive: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    font: '<polyline points="4,7 4,4 20,4 20,7"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/>',
    '3d': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    template: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>'
  };

  function renderCategoryNav() {
    const $catNav = document.getElementById('categoryNav');
    if (!$catNav) return;
    // Use card layout if cat-card-grid class exists, otherwise fallback to pills
    const useCards = $catNav.classList.contains('cat-card-grid');
    if (!useCards) {
      // Fallback: pill layout for category.html etc.
      const allBtn = `<button class="nav-pill ${!state.category ? 'active' : ''}" data-cat="">${I18n.t('all')}</button>`;
      const pills = data.categories.map(c => `
        <button class="nav-pill ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}">
          <span class="pill-icon">${c.icon}</span> ${I18n.localize(c.name)}
        </button>`).join('');
      $catNav.innerHTML = allBtn + pills;
    } else {
      // Card layout for index.html
      const lang = I18n.getLang();
      const sitesLabel = lang === 'en' ? 'sites' : 'サイト';
      const allCount = data.sites.length;
      const allCard = `<button class="cat-card ${!state.category ? 'active' : ''}" data-cat="">
        <span class="cat-card-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
        <span class="cat-card-body"><span class="cat-card-name">${I18n.t('all')}</span><span class="cat-card-count">${allCount} ${sitesLabel}</span></span>
      </button>`;
      const cards = data.categories.map(c => {
        const count = data.sites.filter(s => s.category === c.id).length;
        const svg = catSVG[c.id] || '';
        return `<button class="cat-card ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}">
          <span class="cat-card-icon"><svg viewBox="0 0 24 24">${svg}</svg></span>
          <span class="cat-card-body"><span class="cat-card-name">${I18n.localize(c.name)}</span><span class="cat-card-count">${count} ${sitesLabel}</span></span>
        </button>`;
      }).join('');
      $catNav.innerHTML = allCard + cards;
    }
    $catNav.querySelectorAll('.cat-card, .nav-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.cat || null;
        state.page = 1;
        renderCategoryNav();
        render();
        updateURL();
      });
    });
  }

  function renderUseCaseNav() {
    const $ucNav = document.getElementById('useCaseNav');
    if (!$ucNav) return;
    const allBtn = `<button class="nav-pill ${!state.useCase ? 'active' : ''}" data-uc="">${I18n.t('all')}</button>`;
    const pills = data.useCases.map(u => `
      <button class="nav-pill ${state.useCase === u.id ? 'active' : ''}" data-uc="${u.id}">
        <span class="pill-icon">${u.icon}</span> ${I18n.localize(u.name)}
      </button>`).join('');
    $ucNav.innerHTML = allBtn + pills;
    $ucNav.querySelectorAll('.nav-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        state.useCase = btn.dataset.uc || null;
        state.page = 1;
        renderUseCaseNav();
        render();
        updateURL();
      });
    });
  }

  // ── Quick filter buttons ──
  function bindQuickFilters() {
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filter;
        state.filters[key] = !state.filters[key];
        btn.classList.toggle('active', state.filters[key]);
        state.page = 1;
        render();
      });
    });

    // Region toggle buttons
    document.querySelectorAll('.region-btn[data-region]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.region || null;
        state.region = (state.region === val) ? null : val;
        document.querySelectorAll('.region-btn').forEach(b => b.classList.remove('active'));
        if (state.region) btn.classList.add('active');
        state.page = 1;
        render();
      });
    });

    // Favorites filter
    const $favBtn = document.getElementById('filterFavBtn');
    if ($favBtn) {
      $favBtn.addEventListener('click', () => {
        state.showFavoritesOnly = !state.showFavoritesOnly;
        $favBtn.classList.toggle('active', state.showFavoritesOnly);
        state.page = 1;
        render();
      });
    }
  }

  // ── Format Filters ──
  function initFormatFilters() {
    document.getElementById('formatFilters')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-format]');
      if (!btn) return;
      btn.classList.toggle('active');
      activeFormats = [...document.querySelectorAll('#formatFilters .filter-btn.active')].map(b => b.dataset.format);
      state.page = 1;
      render();
    });
  }

  // ── URL params ──
  function readURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cat')) state.category = params.get('cat');
    if (params.get('use')) state.useCase = params.get('use');
  }

  function updateURL() {
    const params = new URLSearchParams();
    if (state.category) params.set('cat', state.category);
    if (state.useCase) params.set('use', state.useCase);
    const qs = params.toString();
    const url = window.location.pathname + (qs ? '?' + qs : '');
    history.replaceState(null, '', url);

    if (isCategory) updateCategoryPageMeta();
  }

  function updateCategoryPageMeta() {
    let titleParts = [I18n.t('siteTitle')];
    if (state.category) {
      const cat = data.categories.find(c => c.id === state.category);
      if (cat) titleParts.unshift(`${cat.icon} ${I18n.localize(cat.name)}`);
    }
    if (state.useCase) {
      const uc = data.useCases.find(u => u.id === state.useCase);
      if (uc) titleParts.unshift(`${uc.icon} ${I18n.localize(uc.name)}`);
    }
    document.title = titleParts.join(' | ');

    const $bc = document.getElementById('breadcrumbCurrent');
    if ($bc) {
      if (state.category) {
        const cat = data.categories.find(c => c.id === state.category);
        $bc.textContent = cat ? `${cat.icon} ${I18n.localize(cat.name)}` : '';
      } else if (state.useCase) {
        const uc = data.useCases.find(u => u.id === state.useCase);
        $bc.textContent = uc ? `${uc.icon} ${I18n.localize(uc.name)}` : '';
      } else {
        $bc.textContent = I18n.t('allCategories');
      }
    }
  }

  // ── Dark Mode ──
  function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });

    const $themeBtn = document.getElementById('themeBtn');
    if ($themeBtn) {
      $themeBtn.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        applyTheme(next);
      });
    }
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const $themeBtn = document.getElementById('themeBtn');
    if ($themeBtn) {
      $themeBtn.innerHTML = theme === 'dark' ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      $themeBtn.setAttribute('aria-label', theme === 'dark' ? I18n.t('themeLightLabel') : I18n.t('themeDarkLabel'));
    }
  }

  // ── Event delegation for grids ──
  function handleGridClick(e) {
    // Favorite button
    const favBtn = e.target.closest('.fav-btn');
    if (favBtn) {
      e.stopPropagation();
      toggleFavorite(favBtn.dataset.id);
      render();
      return;
    }

    // Card click
    const card = e.target.closest('.card[data-id]');
    if (card) {
      if (state.compareMode) {
        const id = card.dataset.id;
        const idx = state.compareIds.indexOf(id);
        if (idx >= 0) {
          state.compareIds.splice(idx, 1);
        } else if (state.compareIds.length < 3) {
          state.compareIds.push(id);
        }
        render();
      } else {
        openModal(card.dataset.id);
      }
    }
  }

  function handleGridKeydown(e) {
    if (e.key === 'Enter') {
      const card = e.target.closest('.card[data-id]');
      if (card && !state.compareMode) openModal(card.dataset.id);
    }
  }

  // ── Init (index.html & category.html) ──
  async function init(options = {}) {
    isCategory = options.isCategory || false;

    await loadData();
    readURL();

    // Category page override (e.g., font.html, 3d.html)
    if (options.category) {
      state.category = options.category;
      isCategory = true;
    }

    $grid = document.getElementById('siteGrid');
    $recGrid = document.getElementById('recGrid');
    $searchInput = document.getElementById('searchInput');
    $sortSelect = document.getElementById('sortSelect');
    $resultCount = document.getElementById('resultCount');
    $modalOverlay = document.getElementById('modalOverlay');
    $loadMoreBtn = document.getElementById('loadMoreBtn');

    // Search with debounce
    if ($searchInput) {
      const debouncedSearch = debounce(() => {
        state.page = 1;
        render();
      }, 250);
      $searchInput.addEventListener('input', e => {
        state.search = e.target.value.trim();
        debouncedSearch();
      });
    }

    // Sort
    if ($sortSelect) {
      $sortSelect.addEventListener('change', e => {
        state.sort = e.target.value;
        state.page = 1;
        render();
      });
    }

    // Load more
    if ($loadMoreBtn) {
      $loadMoreBtn.addEventListener('click', () => {
        state.page++;
        render();
      });
    }

    // Event delegation on grids
    if ($grid) {
      $grid.addEventListener('click', handleGridClick);
      $grid.addEventListener('keydown', handleGridKeydown);
    }
    if ($recGrid) {
      $recGrid.addEventListener('click', handleGridClick);
      $recGrid.addEventListener('keydown', handleGridKeydown);
    }

    // Personalized grids delegation
    const $recentGrid = document.getElementById('recentGrid');
    if ($recentGrid) {
      $recentGrid.addEventListener('click', handleGridClick);
      $recentGrid.addEventListener('keydown', handleGridKeydown);
    }
    const $favHomeGrid = document.getElementById('favHomeGrid');
    if ($favHomeGrid) {
      $favHomeGrid.addEventListener('click', handleGridClick);
      $favHomeGrid.addEventListener('keydown', handleGridKeydown);
    }

    // Modal close
    if ($modalOverlay) {
      document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
      $modalOverlay.addEventListener('click', e => {
        if (e.target === $modalOverlay) closeModal();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
      });
    }

    // Compare mode toggle
    const $compareToggle = document.getElementById('compareToggleBtn');
    if ($compareToggle) {
      $compareToggle.addEventListener('click', () => {
        state.compareMode = !state.compareMode;
        if (!state.compareMode) state.compareIds = [];
        $compareToggle.classList.toggle('active', state.compareMode);
        render();
      });
    }

    // Lang change
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', () => I18n.toggle());

    window.addEventListener('langchange', () => {
      renderCategoryNav();
      renderUseCaseNav();
      renderRecentlyViewed();
      renderFavoritesHome();
      render();
      renderPremiumSection();
      renderAdSlots();
      renderBlogHighlights();
      if (isCategory) updateCategoryPageMeta();
      const lb = document.getElementById('langBtn');
      if (lb) lb.innerHTML = I18n.t('lang');
      applyTheme(document.documentElement.dataset.theme || 'light');
    });

    initTheme();
    bindQuickFilters();
    initFormatFilters();
    renderCategoryNav();
    renderUseCaseNav();
    renderRecentlyViewed();
    renderFavoritesHome();
    render();
    renderPremiumSection();
    bindNewsletter();
    renderAdSlots();
    renderBlogHighlights();
    initHamburger();
    initBackToTop();
    initQuiz();

    if (isCategory) updateCategoryPageMeta();
    I18n.applyAll();
  }

  // ── Detail page init ──
  async function initDetail() {
    await loadData();
    initTheme();

    $modalOverlay = document.getElementById('modalOverlay');

    // Modal close
    if ($modalOverlay) {
      document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
      $modalOverlay.addEventListener('click', e => {
        if (e.target === $modalOverlay) closeModal();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
      });
    }

    // Related grid delegation (bound once)
    const $relatedGrid = document.getElementById('relatedGrid');
    if ($relatedGrid) {
      $relatedGrid.addEventListener('click', e => {
        const favBtn = e.target.closest('.fav-btn');
        if (favBtn) {
          e.stopPropagation();
          toggleFavorite(favBtn.dataset.id);
          renderDetailPage();
          return;
        }
        const card = e.target.closest('.card[data-id]');
        if (card) openModal(card.dataset.id);
      });
    }

    // Lang
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', () => I18n.toggle());

    window.addEventListener('langchange', () => {
      renderDetailPage();
      const lb = document.getElementById('langBtn');
      if (lb) lb.innerHTML = I18n.t('lang');
      applyTheme(document.documentElement.dataset.theme || 'light');
    });

    renderDetailPage();
    initHamburger();
    initBackToTop();
    I18n.applyAll();
  }

  function renderDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const site = data.sites.find(s => s.id === id);
    const $content = document.getElementById('detailContent');

    if (!site) {
      if ($content) $content.innerHTML = `<div class="no-results">${I18n.t('siteNotFound')}</div>`;
      return;
    }

    // Track recently viewed
    trackRecentlyViewed(site.id);

    // Update page meta
    const name = I18n.localize(site.name);
    document.title = `${name} – ${I18n.t('siteTitle')}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = I18n.localize(site.description);
    // Dynamic OGP
    const pageUrl = 'https://freesozo.com/detail.html?id=' + site.id;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', name + ' – フリー素材ポータル');
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', I18n.localize(site.description));
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', pageUrl);
    // JSON-LD BreadcrumbList
    const existingLd = document.querySelectorAll('script[data-dynamic-ld]');
    existingLd.forEach(el => el.remove());
    const bcLd = document.createElement('script');
    bcLd.type = 'application/ld+json';
    bcLd.dataset.dynamicLd = '1';
    const cat0 = data.categories.find(c => c.id === site.category);
    bcLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://freesozo.com/" },
        { "@type": "ListItem", "position": 2, "name": cat0 ? I18n.localize(cat0.name) : site.category, "item": "https://freesozo.com/category.html?cat=" + site.category },
        { "@type": "ListItem", "position": 3, "name": name }
      ]
    });
    document.head.appendChild(bcLd);

    // Breadcrumb
    const cat = data.categories.find(c => c.id === site.category);
    const $bcCat = document.getElementById('breadcrumbCat');
    const $bcSite = document.getElementById('breadcrumbSite');
    if ($bcCat && cat) {
      $bcCat.href = `category.html?cat=${cat.id}`;
      $bcCat.textContent = `${cat.icon} ${I18n.localize(cat.name)}`;
    }
    if ($bcSite) $bcSite.textContent = name;

    // Detail content
    const ucLabels = site.useCases.map(uid => {
      const uc = data.useCases.find(u => u.id === uid);
      return uc ? `<span class="badge badge-info">${uc.icon} ${I18n.localize(uc.name)}</span>` : '';
    }).join('');

    const favIcon = isFavorite(site.id) ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    const favLabel = isFavorite(site.id) ? I18n.t('unfavorite') : I18n.t('favorite');

    if ($content) {
      $content.innerHTML = `
        <div class="detail-hero">
          <div class="detail-name">${name}</div>
          <div class="detail-rating">${stars(site.rating)}</div>
          <button class="fav-btn detail-fav-btn" data-id="${site.id}" aria-label="${favLabel}">${favIcon} ${favLabel}</button>
        </div>
        <div class="detail-highlight">${I18n.localize(site.highlight)}</div>
        <p class="detail-desc">${I18n.localize(site.description)}</p>

        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-icon ${site.commercial ? 'meta-ok' : 'meta-warn'}">${site.commercial ? '✓' : '✗'}</span>
            ${I18n.t(site.commercial ? 'commercial' : 'commercial')} ${site.commercial ? '' : '✗'}
          </div>
          <div class="meta-item">
            <span class="meta-icon ${!site.creditRequired ? 'meta-ok' : 'meta-warn'}">${!site.creditRequired ? '✓' : '⚠'}</span>
            ${I18n.t(site.creditRequired ? 'creditRequired' : 'creditFree')}
          </div>
          <div class="meta-item">
            <span class="meta-icon ${!site.registrationRequired ? 'meta-ok' : 'meta-warn'}">${!site.registrationRequired ? '✓' : '⚠'}</span>
            ${I18n.t(site.registrationRequired ? 'regRequired' : 'regFree')}
          </div>
          <div class="meta-item">
            <span class="meta-icon ${site.beginnerFriendly ? 'meta-ok' : ''}">${site.beginnerFriendly ? '✓' : '—'}</span>
            ${I18n.t('beginnerOk')}
          </div>
        </div>

        <div class="detail-section">
          <div class="modal-section-label">${I18n.t('modalCategory')}</div>
          <div class="modal-tags">
            ${cat ? `<span class="badge badge-info">${cat.icon} ${I18n.localize(cat.name)}</span>` : ''}
          </div>
        </div>

        <div class="detail-section">
          <div class="modal-section-label">${I18n.t('modalUseCases')}</div>
          <div class="modal-usecases">${ucLabels}</div>
        </div>

        <div class="detail-section">
          <div class="modal-section-label">Tags</div>
          <div class="modal-tags">${site.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>

        <div class="detail-verified">${I18n.t('lastVerifiedLabel')} ${I18n.t('verifiedDate')}</div>

        <div class="detail-disclaimer">
          <p><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${I18n.t('detailDisclaimer')}</p>
        </div>

        <a href="${site.affiliateUrl || site.url}" target="_blank" rel="noopener noreferrer" class="btn-visit" style="align-self:flex-start;">
          ${I18n.t('visitSite')} ↗
        </a>
      `;

      // Detail fav button
      const $detailFav = $content.querySelector('.detail-fav-btn');
      if ($detailFav) {
        $detailFav.addEventListener('click', () => {
          toggleFavorite(site.id);
          renderDetailPage();
        });
      }
    }

    // Related sites
    const $relatedGrid = document.getElementById('relatedGrid');
    const $relatedSection = document.getElementById('relatedSection');
    if ($relatedGrid) {
      const related = data.sites
        .filter(s => s.category === site.category && s.id !== site.id)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
      if (related.length > 0) {
        if ($relatedSection) $relatedSection.style.display = '';
        $relatedGrid.innerHTML = related.map(cardHTML).join('');
      } else {
        if ($relatedSection) $relatedSection.style.display = 'none';
      }
    }

    // JSON-LD
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: name,
      description: I18n.localize(site.description),
      url: window.location.href,
    };
    let ldScript = document.getElementById('detailJsonLd');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'detailJsonLd';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(jsonLd);
  }

  // ── Recently Viewed ──
  function trackRecentlyViewed(id) {
    let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    recent = recent.filter(r => r !== id);
    recent.unshift(id);
    if (recent.length > 8) recent = recent.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
  }

  function renderRecentlyViewed() {
    const section = document.getElementById('recentSection');
    const grid = document.getElementById('recentGrid');
    if (!section || !grid) return;
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const recentSites = recent.map(id => data.sites.find(s => s.id === id)).filter(Boolean);
    if (recentSites.length === 0) { section.style.display = 'none'; return; }
    section.style.display = '';
    grid.innerHTML = recentSites.map(cardHTML).join('');
  }

  function renderFavoritesHome() {
    const section = document.getElementById('favHomeSection');
    const grid = document.getElementById('favHomeGrid');
    if (!section || !grid) return;
    const favSites = data.sites.filter(s => isFavorite(s.id));
    if (favSites.length === 0) { section.style.display = 'none'; return; }
    section.style.display = '';
    grid.innerHTML = favSites.map(cardHTML).join('');
  }

  // ── Premium Sites ──
  function renderPremiumSection() {
    const $premium = document.getElementById('premiumGrid');
    if (!$premium || !data.premiumSites || data.premiumSites.length === 0) return;

    $premium.innerHTML = data.premiumSites.map(ps => {
      const name = I18n.localize(ps.name);
      const highlight = I18n.localize(ps.highlight);
      const pricing = I18n.localize(ps.pricing);
      const badge = I18n.localize(ps.badge);
      const url = ps.affiliateUrl || ps.url;
      return `
        <div class="premium-card">
          <span class="premium-badge">${badge}</span>
          <div class="premium-name">${name}</div>
          <p class="premium-highlight">${highlight}</p>
          <div class="premium-pricing">${I18n.t('premiumPricing')}: ${pricing}</div>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn-premium">
            ${I18n.t('premiumVisit')} ↗
          </a>
        </div>`;
    }).join('');
  }

  function bindNewsletter() { /* removed */ }

  // ── Ad Slot ──
  function renderAdSlots() {
    document.querySelectorAll('.ad-slot-adsense').forEach(slot => {
      slot.innerHTML = `
        <span class="ad-slot-label">${I18n.t('adLabel')}</span>
        <span class="ad-slot-placeholder">Google AdSense</span>
      `;
    });
  }

  // ── Hamburger Menu ──
  function initHamburger() {
    const btn = document.getElementById('hamburgerBtn');
    const nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;
    const hamburgerSVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    const closeSVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      btn.innerHTML = nav.classList.contains('open') ? closeSVG : hamburgerSVG;
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        btn.innerHTML = hamburgerSVG;
      });
    });
  }

  // ── Blog Highlights ──
  function renderBlogHighlights() {
    const grid = document.getElementById('blogHighlightGrid');
    if (!grid) return;
    const articles = [
      {
        tag: I18n.t('blogUnsplashTag'),
        title: I18n.t('blogUnsplashTitle'),
        excerpt: I18n.t('blogUnsplashExcerpt'),
        meta: I18n.t('blogUnsplashMeta'),
        url: 'blog/articles/unsplash-review.html'
      },
      {
        tag: I18n.t('blogBlenderTag'),
        title: I18n.t('blogBlenderTitle'),
        excerpt: I18n.t('blogBlenderExcerpt'),
        meta: I18n.t('blogBlenderMeta'),
        url: 'blog/articles/blender-3d-model-review.html'
      },
      {
        tag: I18n.t('blogFontMistakeTag'),
        title: I18n.t('blogFontMistakeTitle'),
        excerpt: I18n.t('blogFontMistakeExcerpt'),
        meta: I18n.t('blogFontMistakeMeta'),
        url: 'blog/articles/font-license-mistake.html'
      }
    ];
    grid.innerHTML = articles.map(a => `
      <a href="${a.url}" class="blog-highlight-card">
        <span class="blog-highlight-tag">${a.tag}</span>
        <span class="blog-highlight-title">${a.title}</span>
        <p class="blog-highlight-excerpt">${a.excerpt}</p>
        <span class="blog-highlight-meta">${a.meta}</span>
      </a>
    `).join('');
  }

  // ── Back to Top ──
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── Quiz / おすすめ診断 ──
  let quizState = { step: 0, q1: null, q2: null, q3: null };

  function initQuiz() {
    const startBtn = document.getElementById('quizStartBtn');
    const overlay = document.getElementById('quizOverlay');
    const closeBtn = document.getElementById('quizClose');
    if (!startBtn || !overlay) return;

    startBtn.addEventListener('click', () => {
      quizState = { step: 1, q1: null, q2: null, q3: null };
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      renderQuizStep();
    });

    closeBtn.addEventListener('click', closeQuiz);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeQuiz();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') closeQuiz();
    });
  }

  function closeQuiz() {
    const overlay = document.getElementById('quizOverlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  function renderQuizProgress() {
    const container = document.getElementById('quizProgress');
    const steps = [1, 2, 3, 4];
    container.innerHTML = steps.map(s => {
      let cls = 'quiz-dot';
      if (s < quizState.step) cls += ' done';
      else if (s === quizState.step) cls += ' active';
      return `<div class="${cls}"></div>`;
    }).join('');
  }

  function renderQuizStep() {
    renderQuizProgress();
    const content = document.getElementById('quizContent');
    if (quizState.step === 1) renderQuizQ1(content);
    else if (quizState.step === 2) renderQuizQ2(content);
    else if (quizState.step === 3) renderQuizQ3(content);
    else if (quizState.step === 4) renderQuizResults(content);
  }

  function renderQuizQ1(el) {
    const cats = data.categories;
    el.innerHTML = `<h2>${I18n.t('quizQ1')}</h2>
      <div class="quiz-options">${cats.map(c =>
        `<button class="quiz-option" data-value="${c.id}">${c.icon} ${I18n.localize(c.name)}</button>`
      ).join('')}</div>`;
    el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizState.q1 = btn.dataset.value;
        quizState.step = 2;
        renderQuizStep();
      });
    });
  }

  function renderQuizQ2(el) {
    const ucs = data.useCases;
    el.innerHTML = `<h2>${I18n.t('quizQ2')}</h2>
      <div class="quiz-options">
        ${ucs.map(u =>
          `<button class="quiz-option" data-value="${u.id}">${u.icon} ${I18n.localize(u.name)}</button>`
        ).join('')}
        <button class="quiz-option" data-value="any">${I18n.t('quizQ2any')}</button>
      </div>
      <button class="quiz-back" id="quizBackBtn">${I18n.t('quizBack')}</button>`;
    el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizState.q2 = btn.dataset.value;
        quizState.step = 3;
        renderQuizStep();
      });
    });
    document.getElementById('quizBackBtn').addEventListener('click', () => {
      quizState.step = 1;
      renderQuizStep();
    });
  }

  function renderQuizQ3(el) {
    const keys = ['quizQ3a', 'quizQ3b', 'quizQ3c'];
    const values = ['commercial', 'easy', 'beginner'];
    el.innerHTML = `<h2>${I18n.t('quizQ3')}</h2>
      <div class="quiz-options">${keys.map((k, i) =>
        `<button class="quiz-option" data-value="${values[i]}">${I18n.t(k)}</button>`
      ).join('')}</div>
      <button class="quiz-back" id="quizBackBtn">${I18n.t('quizBack')}</button>`;
    el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        quizState.q3 = btn.dataset.value;
        quizState.step = 4;
        renderQuizStep();
      });
    });
    document.getElementById('quizBackBtn').addEventListener('click', () => {
      quizState.step = 2;
      renderQuizStep();
    });
  }

  function quizScoreSites(sites) {
    return sites.map(s => {
      let score = 0;
      // Base rating
      score += s.rating * 2;
      // Q3 priority
      if (quizState.q3 === 'commercial') {
        if (s.commercial) score += 8;
        if (!s.creditRequired) score += 3;
      } else if (quizState.q3 === 'easy') {
        if (!s.registrationRequired) score += 6;
        if (!s.creditRequired) score += 6;
      } else if (quizState.q3 === 'beginner') {
        if (s.beginnerFriendly) score += 8;
        if (!s.registrationRequired) score += 3;
      }
      // Affiliate bonus
      if (s.affiliateUrl) score += 1;
      return { site: s, score };
    }).sort((a, b) => b.score - a.score);
  }

  function renderQuizResults(el) {
    let sites = data.sites.filter(s => s.category === quizState.q1);
    if (quizState.q2 !== 'any') {
      const withUC = sites.filter(s => s.useCases.includes(quizState.q2));
      if (withUC.length > 0) sites = withUC;
    }
    const scored = quizScoreSites(sites);
    const top5 = scored.slice(0, 5);

    let html = `<h2 class="quiz-results-title">${I18n.t('quizResultTitle')}</h2>`;
    if (top5.length === 0) {
      html += `<p class="quiz-no-result">${I18n.t('quizNoResult')}</p>`;
    } else {
      html += '<div class="quiz-results-grid">' +
        top5.map(s => cardHTML(s.site)).join('') +
        '</div>';
    }
    html += `<button class="quiz-retry" id="quizRetryBtn">${I18n.t('quizRetry')}</button>`;
    el.innerHTML = html;

    // Bind card clicks and fav buttons in results
    el.querySelectorAll('.card[data-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn')) return;
        openModal(card.dataset.id);
      });
    });
    el.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.id);
        renderQuizStep();
        render();
      });
    });

    document.getElementById('quizRetryBtn').addEventListener('click', () => {
      quizState = { step: 1, q1: null, q2: null, q3: null };
      renderQuizStep();
    });
  }

  // Re-render quiz on language change
  window.addEventListener('langchange', () => {
    const overlay = document.getElementById('quizOverlay');
    if (overlay && overlay.style.display === 'flex') {
      renderQuizStep();
    }
  });

  // Header scroll effect – add .scrolled class after 50px
  window.addEventListener('scroll', function() {
    var header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
  }, { passive: true });

  // IntersectionObserver – fade-in-up on scroll
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Observe after DOM ready
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.fade-in-up').forEach(function(el) {
        fadeObserver.observe(el);
      });
    });
  }

  // Smooth scroll for hero CTA anchors
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  return { init, initDetail };
})();
