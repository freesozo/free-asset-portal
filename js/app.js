// app.js – 検索・フィルター・カード描画・モーダル・ページネーション・ダークモード・お気に入り・比較・詳細
const App = (() => {
  let data = { sites: [], categories: [], useCases: [], premiumSites: [] };
  let state = {
    search: '',
    category: null,
    useCase: null,
    region: null,
    filters: { commercial: false, creditFree: false, regFree: false, beginner: false },
    sort: 'rating',
    page: 1,
    perPage: 24,
    showFavoritesOnly: false,
    compareMode: false,
    compareIds: [],
  };

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
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  // ── Card HTML ──
  function cardHTML(site) {
    const name = I18n.localize(site.name);
    const highlight = I18n.localize(site.highlight);
    const badges = [];
    if (site.commercial) badges.push(`<span class="badge badge-ok">✓ ${I18n.t('commercial')}</span>`);
    if (!site.creditRequired) badges.push(`<span class="badge badge-ok">✓ ${I18n.t('creditFree')}</span>`);
    else badges.push(`<span class="badge badge-warn">⚠ ${I18n.t('creditRequired')}</span>`);
    if (!site.registrationRequired) badges.push(`<span class="badge badge-info">${I18n.t('regFree')}</span>`);

    const cat = data.categories.find(c => c.id === site.category);
    const catLabel = cat ? `${cat.icon} ${I18n.localize(cat.name)}` : '';
    const favIcon = isFavorite(site.id) ? '❤️' : '🤍';
    const favLabel = isFavorite(site.id) ? I18n.t('unfavorite') : I18n.t('favorite');

    const compareOverlay = state.compareMode
      ? `<div class="compare-check">${state.compareIds.includes(site.id) ? '✓' : ''}</div>`
      : '';
    const selectedClass = state.compareMode && state.compareIds.includes(site.id) ? ' compare-selected' : '';

    return `
      <article class="card${selectedClass}" data-id="${site.id}" role="button" tabindex="0" aria-label="${name}">
        ${compareOverlay}
        <div class="card-header">
          <span class="card-name">${name}</span>
          <span class="card-rating" aria-label="${site.rating}/5">${stars(site.rating)}</span>
        </div>
        <p class="card-highlight">${highlight}</p>
        <div class="card-badges">${badges.join('')}</div>
        <div class="card-footer">
          <span class="tag">${catLabel}</span>
          <button class="fav-btn" data-id="${site.id}" aria-label="${favLabel}" title="${favLabel}">${favIcon}</button>
        </div>
      </article>`;
  }

  // ── Filter logic ──
  function filtered() {
    return data.sites.filter(s => {
      if (state.category && s.category !== state.category) return false;
      if (state.useCase && !s.useCases.includes(state.useCase)) return false;
      if (state.region === 'jp' && !s.tags.includes('japanese')) return false;
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
      }
    }

    // Load more button
    if ($loadMoreBtn) {
      $loadMoreBtn.style.display = visible.length < allSites.length ? '' : 'none';
    }

    // Recommended: hide when any filter is active
    const $recSection = document.getElementById('recSection');
    const hasActiveFilter = state.category || state.useCase || state.search || state.region ||
      state.filters.commercial || state.filters.creditFree || state.filters.regFree || state.filters.beginner ||
      state.showFavoritesOnly;

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

    const cat = data.categories.find(c => c.id === site.category);
    const ucLabels = site.useCases.map(uid => {
      const uc = data.useCases.find(u => u.id === uid);
      return uc ? `<span class="badge badge-info">${uc.icon} ${I18n.localize(uc.name)}</span>` : '';
    }).join('');

    const favIcon = isFavorite(site.id) ? '❤️' : '🤍';
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
  }

  // ── Category nav rendering ──
  function renderCategoryNav() {
    const $catNav = document.getElementById('categoryNav');
    if (!$catNav) return;
    const allBtn = `<button class="nav-pill ${!state.category ? 'active' : ''}" data-cat="">${I18n.t('all')}</button>`;
    const pills = data.categories.map(c => `
      <button class="nav-pill ${state.category === c.id ? 'active' : ''}" data-cat="${c.id}">
        <span class="pill-icon">${c.icon}</span> ${I18n.localize(c.name)}
      </button>`).join('');
    $catNav.innerHTML = allBtn + pills;
    $catNav.querySelectorAll('.nav-pill').forEach(btn => {
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
      $themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
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
      render();
      renderPremiumSection();
      renderAdSlots();
      if (isCategory) updateCategoryPageMeta();
      const lb = document.getElementById('langBtn');
      if (lb) lb.textContent = I18n.t('lang');
      applyTheme(document.documentElement.dataset.theme || 'light');
    });

    initTheme();
    bindQuickFilters();
    renderCategoryNav();
    renderUseCaseNav();
    render();
    renderPremiumSection();
    bindNewsletter();
    renderAdSlots();
    initBackToTop();

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
      if (lb) lb.textContent = I18n.t('lang');
      applyTheme(document.documentElement.dataset.theme || 'light');
    });

    renderDetailPage();
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

    const favIcon = isFavorite(site.id) ? '❤️' : '🤍';
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

  // ── Newsletter ──
  function bindNewsletter() {
    const $form = document.getElementById('newsletterForm');
    if (!$form) return;

    $form.addEventListener('submit', e => {
      e.preventDefault();
      const $input = $form.querySelector('input[type="email"]');
      const $msg = document.getElementById('newsletterMsg');
      const email = $input.value.trim();

      if (!email) return;

      const subs = JSON.parse(localStorage.getItem('newsletter_subs') || '[]');
      if (subs.includes(email)) {
        $msg.textContent = I18n.t('newsletterAlready');
        $msg.style.color = '#b45309';
        return;
      }

      subs.push(email);
      localStorage.setItem('newsletter_subs', JSON.stringify(subs));

      $input.value = '';
      $msg.textContent = I18n.t('newsletterSuccess');
      $msg.style.color = '';
    });
  }

  // ── Ad Slot ──
  function renderAdSlots() {
    document.querySelectorAll('.ad-slot-adsense').forEach(slot => {
      slot.innerHTML = `
        <span class="ad-slot-label">${I18n.t('adLabel')}</span>
        <span class="ad-slot-placeholder">Google AdSense</span>
      `;
    });
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

  return { init, initDetail };
})();
