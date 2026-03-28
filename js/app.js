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
      `<td><a href="${/* affiliateUrl disabled for AdSense review */ s.url}" target="_blank" rel="noopener noreferrer" class="btn-visit" style="font-size:.82rem;padding:8px 14px;">${I18n.t('visitSite')} ↗</a></td>`
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

      <a href="${/* affiliateUrl disabled for AdSense review */ site.url}" target="_blank" rel="noopener noreferrer" class="btn-visit">
        ${I18n.t('visitSite')} ↗
      </a>

      <div id="modalBoardPicker"></div>
    `;

    // Board picker
    const $boardPicker = document.getElementById('modalBoardPicker');
    if ($boardPicker) {
      const collections = JSON.parse(localStorage.getItem('freesozo-collections') || '[]');
      if (collections.length > 0) {
        const opts = collections.map(b => {
          const bName = b.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `<option value="${b.id}">${bName}</option>`;
        }).join('');
        $boardPicker.innerHTML = `<div class="modal-board-picker">
          <label>${I18n.t('collectionsAddToBoard')}</label>
          <select id="boardSelect">${opts}</select>
          <button class="btn-add-to-board" id="addToBoardBtn">${I18n.t('collectionsAddBtn')}</button>
        </div><div id="boardAddMsg"></div>`;
        document.getElementById('addToBoardBtn').addEventListener('click', () => {
          const boardId = document.getElementById('boardSelect').value;
          const cols = JSON.parse(localStorage.getItem('freesozo-collections') || '[]');
          const board = cols.find(b => b.id === boardId);
          const msgEl = document.getElementById('boardAddMsg');
          if (board) {
            if (board.sites.includes(site.id)) {
              msgEl.innerHTML = `<p class="board-added-msg" style="color:var(--c-warning)">${I18n.t('collectionsAlready')}</p>`;
            } else {
              board.sites.push(site.id);
              localStorage.setItem('freesozo-collections', JSON.stringify(cols));
              msgEl.innerHTML = `<p class="board-added-msg">${I18n.t('collectionsAdded')}</p>`;
            }
          }
        });
      } else {
        $boardPicker.innerHTML = `<div class="modal-board-picker" style="border-top:1px solid var(--c-border);padding-top:12px;margin-top:12px;">
          <span style="font-size:0.85rem;color:var(--c-text-sub)">${I18n.t('collectionsNoBoards')}</span>
        </div>`;
      }
    }

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
    const $recentlyAddedGrid = document.getElementById('recentlyAddedGrid');
    if ($recentlyAddedGrid) {
      $recentlyAddedGrid.addEventListener('click', handleGridClick);
      $recentlyAddedGrid.addEventListener('keydown', handleGridKeydown);
    }
    const $weeklyGrid = document.getElementById('weeklyGrid');
    if ($weeklyGrid) {
      $weeklyGrid.addEventListener('click', handleGridClick);
      $weeklyGrid.addEventListener('keydown', handleGridKeydown);
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
      renderPersonalizedSection();
      renderWeeklyPicks();
      renderRecentlyAdded();
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
    renderPersonalizedSection();
    renderWeeklyPicks();
    renderRecentlyAdded();
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

        <a href="${/* affiliateUrl disabled for AdSense review */ site.url}" target="_blank" rel="noopener noreferrer" class="btn-visit" style="align-self:flex-start;">
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

  // ── Weekly Picks ──
  function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek);
  }

  function getWeekDateRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const format = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${format(monday)}〜${format(sunday)}`;
  }

  // ── Personalized Homepage Section ──
  function renderPersonalizedSection() {
    const container = document.getElementById('personalizedSection');
    if (!container) return;
    const inner = container.querySelector('.container') || container;

    const savedType = localStorage.getItem('freesozo-creator-type');
    if (!savedType) {
      // Not diagnosed yet: show CTA
      inner.innerHTML = `
        <div class="personalized-cta">
          <p>${I18n.t('personalizedCtaText')}</p>
          <button class="btn-start-diagnosis" id="personalizedQuizBtn">
            ${I18n.t('personalizedCtaBtn')}
          </button>
        </div>
      `;
      const btn = document.getElementById('personalizedQuizBtn');
      if (btn) btn.addEventListener('click', () => {
        const startBtn = document.getElementById('quizStartBtn');
        if (startBtn) startBtn.click();
      });
      return;
    }

    const type = CREATOR_TYPES[savedType];
    if (!type) return;

    // Get sites matching this type's categories
    const recommended = data.sites
      .filter(s => type.categories.includes(s.category))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);

    const typeName = I18n.localize(type.name);
    const shareText = I18n.localize(type.shareText);

    inner.innerHTML = `
      <div class="personalized-header">
        <span class="personalized-emoji">${type.emoji}</span>
        <div>
          <h2>${typeName}${I18n.t('personalizedSuffix')}</h2>
          <p class="personalized-subtitle">${shareText}</p>
        </div>
        <button class="btn-rediagnose" id="rediagnoseBtn">
          ${I18n.t('personalizedRediagnose')}
        </button>
      </div>
      <div class="card-grid personalized-grid" id="personalizedGrid">
        ${recommended.map(s => cardHTML(s)).join('')}
      </div>
    `;

    // Event delegation for cards
    const grid = document.getElementById('personalizedGrid');
    if (grid) {
      grid.addEventListener('click', handleGridClick);
      grid.addEventListener('keydown', handleGridKeydown);
    }

    // Rediagnose button
    const rediagBtn = document.getElementById('rediagnoseBtn');
    if (rediagBtn) rediagBtn.addEventListener('click', () => {
      const startBtn = document.getElementById('quizStartBtn');
      if (startBtn) startBtn.click();
    });
  }

  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function renderWeeklyPicks() {
    const grid = document.getElementById('weeklyGrid');
    const dateEl = document.getElementById('weeklyDate');
    if (!grid) return;

    if (dateEl) dateEl.textContent = getWeekDateRange();

    const week = getWeekNumber();
    const year = new Date().getFullYear();
    const seed = year * 100 + week;

    // Top 50 sites by quality score sum
    const topSites = data.sites
      .filter(s => s.qualityScore)
      .sort((a, b) => {
        const aScore = Object.values(a.qualityScore || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
        const bScore = Object.values(b.qualityScore || {}).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
        return bScore - aScore;
      })
      .slice(0, 50);

    // Seeded shuffle
    const shuffled = [...topSites].sort((a, b) => {
      const aHash = seededRandom(seed + topSites.indexOf(a));
      const bHash = seededRandom(seed + topSites.indexOf(b));
      return aHash - bHash;
    });

    const picks = shuffled.slice(0, 3);
    const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

    grid.innerHTML = picks.map((site, i) => {
      return `<div class="weekly-card">
        <span class="weekly-rank">${medals[i]}</span>
        ${cardHTML(site)}
      </div>`;
    }).join('');
  }

  // ── Recently Added ──
  function renderRecentlyAdded() {
    const section = document.getElementById('recentlyAddedSection');
    const grid = document.getElementById('recentlyAddedGrid');
    const subtitle = document.getElementById('recentlyAddedSubtitle');
    if (!section || !grid) return;

    const recent = data.sites
      .filter(s => s.dateAdded)
      .sort((a, b) => (b.dateAdded || '').localeCompare(a.dateAdded || ''))
      .slice(0, 6);

    if (recent.length === 0) { section.style.display = 'none'; return; }
    section.style.display = '';

    // Show the latest month in subtitle
    const latestDate = recent[0].dateAdded || '';
    if (subtitle && latestDate) {
      const [y, m] = latestDate.split('-');
      subtitle.textContent = `${y}年${parseInt(m)}月に追加・更新`;
    }

    grid.innerHTML = recent.map(cardHTML).join('');
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
      const url = /* affiliateUrl disabled for AdSense review */ ps.url;
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

  // ── Creator Type Diagnosis / クリエイタータイプ診断 ──
  const CREATOR_TYPES = {
    "visual-storyteller": {
      name: { ja: "\u30d3\u30b8\u30e5\u30a2\u30eb\u30b9\u30c8\u30fc\u30ea\u30fc\u30c6\u30e9\u30fc\u578b", en: "Visual Storyteller" },
      emoji: "\ud83c\udfa8", color: "#3d5a80",
      description: { ja: "\u5199\u771f\u3068\u30a4\u30e9\u30b9\u30c8\u3092\u7d44\u307f\u5408\u308f\u305b\u3001\u8996\u899a\u7684\u306a\u7269\u8a9e\u3092\u7d21\u3050\u30bf\u30a4\u30d7", en: "Weaves visual stories by combining photos and illustrations" },
      categories: ["photo", "illustration", "video"],
      shareText: { ja: "\u5199\u771f\u30fb\u30a4\u30e9\u30b9\u30c8\u30fb\u52d5\u753b\u3092\u99c6\u4f7f\u3059\u308b\u30d3\u30b8\u30e5\u30a2\u30eb\u6d3e", en: "A visual creator using photos, illustrations & videos" }
    },
    "pixel-craftsman": {
      name: { ja: "\u30d4\u30af\u30bb\u30eb\u30af\u30e9\u30d5\u30c8\u30de\u30f3\u578b", en: "Pixel Craftsman" },
      emoji: "\ud83d\udd37", color: "#457b6e",
      description: { ja: "UI\u30c7\u30b6\u30a4\u30f3\u3068\u30a2\u30a4\u30b3\u30f3\u5236\u4f5c\u306b\u60c5\u71b1\u3092\u6ce8\u3050\u3001\u7d30\u90e8\u306b\u3053\u3060\u308f\u308b\u30bf\u30a4\u30d7", en: "A detail-oriented creator passionate about UI design and icons" },
      categories: ["icon", "font", "template"],
      shareText: { ja: "UI\u30fb\u30a2\u30a4\u30b3\u30f3\u30fb\u30d5\u30a9\u30f3\u30c8\u306e\u7d30\u90e8\u306b\u3053\u3060\u308f\u308b\u8077\u4eba\u6d3e", en: "A craftsman obsessed with UI, icon & font details" }
    },
    "sound-architect": {
      name: { ja: "\u30b5\u30a6\u30f3\u30c9\u30a2\u30fc\u30ad\u30c6\u30af\u30c8\u578b", en: "Sound Architect" },
      emoji: "\ud83c\udfb5", color: "#6d597a",
      description: { ja: "\u97f3\u697d\u3068\u52b9\u679c\u97f3\u3067\u7a7a\u9593\u3092\u6f14\u51fa\u3059\u308b\u3001\u8074\u899a\u306e\u30af\u30ea\u30a8\u30a4\u30bf\u30fc", en: "An auditory creator who crafts atmospheres with music and sound effects" },
      categories: ["music", "sound", "video"],
      shareText: { ja: "BGM\u30fb\u52b9\u679c\u97f3\u3067\u4e16\u754c\u89b3\u3092\u4f5c\u308b\u30b5\u30a6\u30f3\u30c9\u6d3e", en: "A sound creator who builds worlds with BGM & SFX" }
    },
    "dimension-explorer": {
      name: { ja: "\u30c7\u30a3\u30e1\u30f3\u30b7\u30e7\u30f3\u63a2\u691c\u5bb6\u578b", en: "Dimension Explorer" },
      emoji: "\ud83e\uddca", color: "#4a6fa5",
      description: { ja: "3D\u30e2\u30c7\u30eb\u3068CG\u3067\u65b0\u3057\u3044\u6b21\u5143\u3092\u5275\u9020\u3059\u308b\u3001\u672a\u6765\u5fd7\u5411\u306e\u30bf\u30a4\u30d7", en: "A future-oriented creator who builds new dimensions with 3D models and CG" },
      categories: ["3d", "texture", "asset"],
      shareText: { ja: "3DCG\u30fb\u30c6\u30af\u30b9\u30c1\u30e3\u3067\u672a\u6765\u3092\u5275\u9020\u3059\u308b\u63a2\u691c\u5bb6\u6d3e", en: "An explorer creating futures with 3DCG & textures" }
    },
    "content-strategist": {
      name: { ja: "\u30b3\u30f3\u30c6\u30f3\u30c4\u30b9\u30c8\u30e9\u30c6\u30b8\u30b9\u30c8\u578b", en: "Content Strategist" },
      emoji: "\ud83d\udcc4", color: "#9e8c6c",
      description: { ja: "\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u3068\u30e2\u30c3\u30af\u30a2\u30c3\u30d7\u3067\u52b9\u7387\u7684\u306b\u30b3\u30f3\u30c6\u30f3\u30c4\u3092\u91cf\u7523\u3059\u308b\u30bf\u30a4\u30d7", en: "Efficiently produces content with templates and mockups" },
      categories: ["template", "mockup", "font"],
      shareText: { ja: "\u30c6\u30f3\u30d7\u30ec\u6d3b\u7528\u3067\u52b9\u7387MAX\u306e\u30b9\u30c8\u30e9\u30c6\u30b8\u30b9\u30c8\u6d3e", en: "A strategist maximizing efficiency with templates" }
    },
    "photo-hunter": {
      name: { ja: "\u30d5\u30a9\u30c8\u30cf\u30f3\u30bf\u30fc\u578b", en: "Photo Hunter" },
      emoji: "\ud83d\udcf8", color: "#b56b4f",
      description: { ja: "\u6700\u9ad8\u306e1\u679a\u3092\u63a2\u3057\u6c42\u3081\u308b\u3001\u5199\u771f\u7d20\u6750\u306e\u30b9\u30da\u30b7\u30e3\u30ea\u30b9\u30c8", en: "A photo asset specialist who hunts for the perfect shot" },
      categories: ["photo", "texture"],
      shareText: { ja: "\u6700\u9ad8\u306e\u5199\u771f\u7d20\u6750\u3092\u72e9\u308a\u96c6\u3081\u308b\u30cf\u30f3\u30bf\u30fc\u6d3e", en: "A hunter who tracks down the best photo assets" }
    },
    "game-creator": {
      name: { ja: "\u30b2\u30fc\u30e0\u30af\u30ea\u30a8\u30a4\u30bf\u30fc\u578b", en: "Game Creator" },
      emoji: "\ud83c\udfae", color: "#6a4c93",
      description: { ja: "\u30b2\u30fc\u30e0\u7d20\u6750\u30fb\u52b9\u679c\u97f3\u30fb3D\u30e2\u30c7\u30eb\u3092\u99c6\u4f7f\u3057\u3066\u4e16\u754c\u3092\u69cb\u7bc9\u3059\u308b\u30bf\u30a4\u30d7", en: "Builds worlds using game assets, sound effects & 3D models" },
      categories: ["asset", "sound", "3d"],
      shareText: { ja: "\u30b2\u30fc\u30e0\u7d20\u6750\u3067\u65b0\u3057\u3044\u4e16\u754c\u3092\u69cb\u7bc9\u3059\u308b\u30af\u30ea\u30a8\u30a4\u30bf\u30fc\u6d3e", en: "A creator building new worlds with game assets" }
    },
    "all-rounder": {
      name: { ja: "\u30aa\u30fc\u30eb\u30e9\u30a6\u30f3\u30c0\u30fc\u578b", en: "All-Rounder" },
      emoji: "\u2728", color: "#2d3142",
      description: { ja: "\u3042\u3089\u3086\u308b\u7d20\u6750\u3092\u4f7f\u3044\u3053\u306a\u3059\u4e07\u80fd\u30bf\u30a4\u30d7\u3002\u5f15\u304d\u51fa\u3057\u306e\u591a\u3055\u304c\u6b66\u5668", en: "A versatile all-rounder who masters every type of asset" },
      categories: ["photo", "illustration", "icon", "font"],
      shareText: { ja: "\u3042\u3089\u3086\u308b\u7d20\u6750\u3092\u4f7f\u3044\u3053\u306a\u3059\u30aa\u30fc\u30eb\u30e9\u30a6\u30f3\u30c0\u30fc\u6d3e", en: "An all-rounder who masters every type of asset" }
    }
  };

  const DIAGNOSIS_QUESTIONS = [
    {
      key: 'diagQ1',
      options: [
        { key: 'diagQ1a', scores: { photo: 3, illustration: 2 } },
        { key: 'diagQ1b', scores: { template: 3, mockup: 2 } },
        { key: 'diagQ1c', scores: { music: 3, sound: 2, video: 1 } },
        { key: 'diagQ1d', scores: { "3d": 3, texture: 2, asset: 1 } }
      ]
    },
    {
      key: 'diagQ2',
      options: [
        { key: 'diagQ2a', scores: { photo: 3, texture: 1 } },
        { key: 'diagQ2b', scores: { icon: 3, font: 2, illustration: 1 } },
        { key: 'diagQ2c', scores: { video: 3, music: 1, sound: 1 } },
        { key: 'diagQ2d', scores: { "3d": 3, asset: 2, texture: 1 } }
      ]
    },
    {
      key: 'diagQ3',
      options: [
        { key: 'diagQ3a', scores: { photo: 3, texture: 2 } },
        { key: 'diagQ3b', scores: { illustration: 3, icon: 2 } },
        { key: 'diagQ3c', scores: { music: 3, sound: 3 } },
        { key: 'diagQ3d', scores: { font: 3, template: 3 } }
      ]
    },
    {
      key: 'diagQ4',
      options: [
        { key: 'diagQ4a', scores: { photo: 2, icon: 2, template: 2, font: 1 } },
        { key: 'diagQ4b', scores: { video: 3, music: 2, sound: 1 } },
        { key: 'diagQ4c', scores: { asset: 3, "3d": 2, sound: 2, icon: 1 } },
        { key: 'diagQ4d', scores: { illustration: 2, photo: 2, template: 1 } }
      ]
    },
    {
      key: 'diagQ5',
      options: [
        { key: 'diagQ5a', scores: { photo: 1, illustration: 1, template: 1 } },
        { key: 'diagQ5b', scores: { photo: 2, "3d": 2 } },
        { key: 'diagQ5c', scores: { illustration: 1, icon: 1, music: 1, sound: 1 } },
        { key: 'diagQ5d', scores: { font: 2, template: 1, illustration: 1 } }
      ]
    }
  ];

  let quizState = { step: 0, answers: [], scores: {}, resultType: null, topSites: [] };

  function initQuiz() {
    const startBtn = document.getElementById('quizStartBtn');
    const overlay = document.getElementById('quizOverlay');
    const closeBtn = document.getElementById('quizClose');
    if (!startBtn || !overlay) return;

    startBtn.addEventListener('click', () => {
      quizState = { step: 1, answers: [], scores: {}, resultType: null, topSites: [] };
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

    // Check URL param for diagnosis result to auto-open
    const params = new URLSearchParams(window.location.search);
    if (params.get('diagnosis')) {
      startBtn.click();
    }
  }

  function closeQuiz() {
    const overlay = document.getElementById('quizOverlay');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    renderPersonalizedSection();
  }

  function renderQuizProgress() {
    const container = document.getElementById('quizProgress');
    const totalSteps = DIAGNOSIS_QUESTIONS.length + 1; // 5 questions + result
    const steps = [];
    for (let i = 1; i <= totalSteps; i++) steps.push(i);
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
    if (quizState.step >= 1 && quizState.step <= DIAGNOSIS_QUESTIONS.length) {
      renderDiagnosisQuestion(content, quizState.step - 1);
    } else if (quizState.step === DIAGNOSIS_QUESTIONS.length + 1) {
      renderDiagnosisResult(content);
    }
  }

  function renderDiagnosisQuestion(el, qIndex) {
    const q = DIAGNOSIS_QUESTIONS[qIndex];
    el.innerHTML = `<h2>${I18n.t(q.key)}</h2>
      <div class="quiz-options">${q.options.map(opt =>
        `<button class="quiz-option" data-key="${opt.key}">${I18n.t(opt.key)}</button>`
      ).join('')}</div>
      ${qIndex > 0 ? `<button class="quiz-back" id="quizBackBtn">${I18n.t('quizBack')}</button>` : ''}`;

    el.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const optKey = btn.dataset.key;
        const opt = q.options.find(o => o.key === optKey);
        if (opt) {
          quizState.answers[qIndex] = opt.scores;
          // Recalculate total scores
          quizState.scores = {};
          quizState.answers.forEach(ans => {
            for (const [cat, val] of Object.entries(ans)) {
              quizState.scores[cat] = (quizState.scores[cat] || 0) + val;
            }
          });
        }
        quizState.step = qIndex + 2;
        renderQuizStep();
      });
    });

    if (qIndex > 0) {
      document.getElementById('quizBackBtn').addEventListener('click', () => {
        quizState.step = qIndex;
        renderQuizStep();
      });
    }
  }

  function determineCreatorType(scores) {
    let bestType = "all-rounder";
    let bestScore = 0;
    for (const [typeId, typeInfo] of Object.entries(CREATOR_TYPES)) {
      const typeScore = typeInfo.categories.reduce(
        (sum, cat) => sum + (scores[cat] || 0), 0
      );
      if (typeScore > bestScore) {
        bestScore = typeScore;
        bestType = typeId;
      }
    }
    return bestType;
  }

  function getTopSitesForType(typeId) {
    const typeInfo = CREATOR_TYPES[typeId];
    const matchingSites = data.sites.filter(s => typeInfo.categories.includes(s.category));
    return matchingSites.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  }

  function renderDiagnosisResult(el) {
    const typeId = determineCreatorType(quizState.scores);
    localStorage.setItem('freesozo-creator-type', typeId);
    const typeInfo = CREATOR_TYPES[typeId];
    const topSites = getTopSitesForType(typeId);
    quizState.resultType = typeId;
    quizState.topSites = topSites;

    const typeName = I18n.localize(typeInfo.name);
    const typeDesc = I18n.localize(typeInfo.description);
    const medals = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49', '4.', '5.'];

    let html = `
      <div class="diagnosis-result">
        <h2 class="result-subtitle">${I18n.t('diagResultSubtitle')}</h2>
        <div class="result-type-card" style="background:${typeInfo.color}">
          <div class="result-type-emoji">${typeInfo.emoji}</div>
          <div class="result-type-name">${typeName}</div>
          <div class="result-type-description">${typeDesc}</div>
        </div>
        <h3 class="result-sites-title">${I18n.t('diagResultSitesTitle')}</h3>
        <div class="result-sites">
          ${topSites.map((site, i) => {
            const name = I18n.localize(site.name);
            const grade = gradeLabel(site.rating);
            return `<div class="result-site-row" data-id="${site.id}">
              <span class="result-site-medal">${medals[i]}</span>
              <span class="result-site-name">${name}</span>
              <span class="result-site-grade ${grade.cls}">${grade.letter}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="share-card-preview" id="shareCardPreviewWrap" style="display:none">
          <canvas id="shareCardCanvas" width="1200" height="630"></canvas>
        </div>
        <div class="result-actions">
          <button class="btn-share-x" id="diagShareX">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            ${I18n.t('diagShareX')}
          </button>
          <button class="btn-download-card" id="diagDownload">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${I18n.t('diagDownload')}
          </button>
          <button class="btn-copy-result" id="diagCopy">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            ${I18n.t('diagCopy')}
          </button>
          <button class="btn-retry" id="diagRetry">${I18n.t('quizRetry')}</button>
        </div>
      </div>`;
    el.innerHTML = html;

    // Generate share card
    generateShareCard(typeId, topSites).then(() => {
      document.getElementById('shareCardPreviewWrap').style.display = '';
    });

    // Site row clicks
    el.querySelectorAll('.result-site-row[data-id]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => openModal(row.dataset.id));
    });

    // Share to X
    document.getElementById('diagShareX').addEventListener('click', () => {
      shareToX(typeId, topSites);
    });

    // Download card
    document.getElementById('diagDownload').addEventListener('click', () => {
      const canvas = document.getElementById('shareCardCanvas');
      if (canvas) downloadShareCard(canvas.toDataURL('image/png'));
    });

    // Copy result
    document.getElementById('diagCopy').addEventListener('click', () => {
      copyDiagnosisResult(typeId, topSites);
    });

    // Retry
    document.getElementById('diagRetry').addEventListener('click', () => {
      quizState = { step: 1, answers: [], scores: {}, resultType: null, topSites: [] };
      renderQuizStep();
    });
  }

  // ── Share Card Canvas Generation ──
  function adjustBrightness(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16) + amount;
    let g = parseInt(hex.slice(3, 5), 16) + amount;
    let b = parseInt(hex.slice(5, 7), 16) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function addNoiseTexture(ctx, w, h, opacity) {
    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() - 0.5) * 255 * opacity;
      d[i] += noise;
      d[i + 1] += noise;
      d[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  async function generateShareCard(typeId, topSites) {
    const type = CREATOR_TYPES[typeId];
    const canvas = document.getElementById('shareCardCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, type.color);
    gradient.addColorStop(1, adjustBrightness(type.color, -30));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Noise texture
    addNoiseTexture(ctx, 1200, 630, 0.03);

    // Top section background
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 0, 1200, 200);

    // Subtitle
    ctx.font = "bold 28px 'Noto Serif JP', 'Hiragino Mincho ProN', serif";
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(I18n.t('diagCardSubtitle'), 600, 60);

    // Type name with emoji
    const typeName = I18n.localize(type.name);
    ctx.font = "bold 52px 'Noto Serif JP', 'Hiragino Mincho ProN', serif";
    ctx.fillStyle = '#ffffff';
    ctx.fillText(type.emoji + ' ' + typeName, 600, 140);

    // Description
    const typeDesc = I18n.localize(type.description);
    ctx.font = "20px 'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif";
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(typeDesc, 600, 185);

    // Recommended sites section
    ctx.font = "bold 24px 'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif";
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.fillText(I18n.t('diagCardRecommended'), 80, 260);

    const medalTexts = ['\ud83e\udd47', '\ud83e\udd48', '\ud83e\udd49'];
    topSites.slice(0, 3).forEach((site, i) => {
      const y = 310 + i * 80;
      // Row background
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      roundRect(ctx, 60, y - 25, 1080, 65, 8);
      ctx.fill();
      // Site name
      const siteName = I18n.localize(site.name);
      ctx.font = "bold 32px 'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif";
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(medalTexts[i] + '  ' + siteName, 80, y + 15);
      // Grade
      const grade = gradeLabel(site.rating);
      ctx.font = "bold 24px 'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif";
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'right';
      ctx.fillText(I18n.t('diagCardQuality') + ' ' + grade.letter, 1120, y + 15);
    });

    // Bottom branding bar
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 560, 1200, 70);

    ctx.font = "bold 24px 'Noto Serif JP', 'Hiragino Mincho ProN', serif";
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('freesozo.com', 80, 602);

    ctx.font = "16px 'Zen Kaku Gothic New', 'Hiragino Sans', sans-serif";
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(I18n.t('diagCardFooter'), 1120, 600);
  }

  function shareToX(typeId, topSites) {
    const type = CREATOR_TYPES[typeId];
    const typeName = I18n.localize(type.name);
    const shareText = I18n.localize(type.shareText);
    const siteNames = topSites.slice(0, 3).map(s => I18n.localize(s.name)).join('\u30fb');
    const shareUrl = 'https://freesozo.com/?diagnosis=' + typeId;

    const isJa = I18n.currentLang === 'ja';
    const text = isJa
      ? '\u79c1\u306e\u30af\u30ea\u30a8\u30a4\u30bf\u30fc\u30bf\u30a4\u30d7\u306f\u300c' + typeName + '\u300d\u3067\u3057\u305f\uff01' + type.emoji + '\n\n' + shareText + '\n\u304a\u3059\u3059\u3081\u30b5\u30a4\u30c8: ' + siteNames + '\n\n\u3042\u306a\u305f\u3082\u8a3a\u65ad\u3057\u3066\u307f\u3066'
      : 'My creator type is "' + typeName + '"! ' + type.emoji + '\n\n' + shareText + '\nRecommended: ' + siteNames + '\n\nTry the diagnosis!';

    const xUrl = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text)
      + '&url=' + encodeURIComponent(shareUrl)
      + '&hashtags=' + encodeURIComponent(isJa ? '\u30d5\u30ea\u30fc\u7d20\u6750\u8a3a\u65ad,freesozo' : 'FreeAssetDiagnosis,freesozo');

    window.open(xUrl, '_blank', 'width=550,height=420');
  }

  function downloadShareCard(dataUrl) {
    const link = document.createElement('a');
    link.download = 'freesozo-diagnosis-result.png';
    link.href = dataUrl;
    link.click();
  }

  function copyDiagnosisResult(typeId, topSites) {
    const type = CREATOR_TYPES[typeId];
    const typeName = I18n.localize(type.name);
    const typeDesc = I18n.localize(type.description);
    const siteNames = topSites.slice(0, 3).map(s => I18n.localize(s.name)).join(', ');

    const text = type.emoji + ' ' + typeName + '\n' + typeDesc + '\n\nTop 3: ' + siteNames + '\nhttps://freesozo.com/?diagnosis=' + typeId;

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('diagCopy');
      if (btn) {
        const orig = btn.innerHTML;
        btn.textContent = I18n.t('diagCopied');
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      }
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
