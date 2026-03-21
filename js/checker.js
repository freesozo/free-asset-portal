// checker.js – License & Quality Checker
const Checker = (() => {
  let sites = [];
  let compareIds = JSON.parse(localStorage.getItem('checkerCompare') || '[]');
  let activeIndex = -1;

  const CATEGORY_EMOJI = {
    photo:'📷', illustration:'🎨', icon:'🔷', music:'🎵', sound:'🔊',
    video:'🎬', font:'🔤', '3d':'🎲', texture:'🎨', template:'📄',
    mockup:'📐', asset:'🎮', archive:'📚'
  };

  const STATUS_MAP = {
    ok:          { icon: '✅', cls: 'ok' },
    conditional: { icon: '⚠️', cls: 'warn' },
    required:    { icon: '⚠️', cls: 'warn' },
    not_required:{ icon: '✅', cls: 'ok' },
    optional:    { icon: '⚠️', cls: 'info' },
    ng:          { icon: '❌', cls: 'ng' },
    unknown:     { icon: '❓', cls: 'unknown' }
  };

  const SCORE_KEYS = ['security','usability','downloadEase','termsClarity','adFree','japaneseSupport'];

  function calcGrade(qs) {
    const total = SCORE_KEYS.reduce((s, k) => s + (qs[k] || 0), 0);
    let grade;
    if (total >= 26) grade = 'S';
    else if (total >= 21) grade = 'A';
    else if (total >= 16) grade = 'B';
    else if (total >= 11) grade = 'C';
    else grade = 'D';
    return { total, grade };
  }

  function stars(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function statusText(val) {
    const map = {
      ok: { ja: 'OK', en: 'OK' },
      conditional: { ja: '条件付き', en: 'Conditional' },
      required: { ja: '必要', en: 'Required' },
      not_required: { ja: '不要', en: 'Not Required' },
      optional: { ja: '任意（推奨）', en: 'Optional (Recommended)' },
      ng: { ja: 'NG', en: 'Not Allowed' },
      unknown: { ja: '未確認', en: 'Unverified' }
    };
    const lang = I18n.getLang();
    return (map[val] && map[val][lang]) || val;
  }

  function licenseLabel(key) {
    return I18n.t('license_' + key);
  }

  function scoreLabel(key) {
    return I18n.t('score_' + key);
  }

  function gradeLabel(g) {
    return I18n.t('grade' + g);
  }

  // ── SVG Radar Chart ──
  function renderRadar(qs, size) {
    size = size || 260;
    const cx = size / 2, cy = size / 2;
    const r = size * 0.38;
    const n = 6;
    const angles = SCORE_KEYS.map((_, i) => (Math.PI * 2 * i / n) - Math.PI / 2);

    function point(angle, radius) {
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    }

    // Grid rings
    let gridLines = '';
    for (let ring = 1; ring <= 5; ring++) {
      const rr = r * ring / 5;
      const pts = angles.map(a => point(a, rr).join(',')).join(' ');
      gridLines += `<polygon points="${pts}" fill="none" stroke="var(--c-border)" stroke-width="1" opacity=".5"/>`;
    }
    // Axes
    angles.forEach(a => {
      const [px, py] = point(a, r);
      gridLines += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="var(--c-border)" stroke-width="1" opacity=".3"/>`;
    });

    // Data polygon
    const dataPts = SCORE_KEYS.map((k, i) => {
      const val = qs[k] || 0;
      return point(angles[i], r * val / 5).join(',');
    }).join(' ');

    const svg = `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      ${gridLines}
      <polygon points="${dataPts}" fill="var(--c-primary)" fill-opacity=".2" stroke="var(--c-primary)" stroke-width="2"/>
      ${SCORE_KEYS.map((k, i) => {
        const [px, py] = point(angles[i], r * (qs[k] || 0) / 5);
        return `<circle cx="${px}" cy="${py}" r="4" fill="var(--c-primary)"/>`;
      }).join('')}
    </svg>`;

    const labels = SCORE_KEYS.map(k => `<span class="ck-radar-label">${scoreLabel(k)}</span>`).join('');

    return `<div class="ck-radar">
      <div class="ck-radar-bg">${svg}</div>
      <div class="ck-radar-labels">${labels}</div>
    </div>`;
  }

  // ── Render Site Card ──
  function renderCard(site) {
    const qs = site.qualityScore || {};
    const ld = site.licenseDetail || {};
    const { total, grade } = calcGrade(qs);
    const lang = I18n.getLang();
    const name = I18n.localize(site.name);
    const desc = I18n.localize(site.description);
    const cautions = lang === 'en' ? (site.cautionsEn || []) : (site.cautions || []);
    const catEmoji = CATEGORY_EMOJI[site.category] || '📦';

    // License items
    const licenseItems = [
      { key: 'commercial', val: ld.commercial },
      { key: 'modification', val: ld.modification },
      { key: 'credit', val: ld.credit },
      { key: 'registration', val: ld.registration },
      { key: 'redistribution', val: ld.redistribution },
    ];

    const licenseHtml = licenseItems.map(item => {
      const st = STATUS_MAP[item.val] || STATUS_MAP.unknown;
      return `<div class="ck-license-item">
        <span class="ck-license-icon">${st.icon}</span>
        <div>
          <div class="ck-license-label">${licenseLabel(item.key)}</div>
          <div class="ck-license-value">${statusText(item.val)}</div>
        </div>
      </div>`;
    }).join('');

    const licenseTypeHtml = ld.licenseType ? `<div class="ck-license-type">
      <span class="ck-license-icon">📋</span>
      <div>
        <div class="ck-license-label">${I18n.t('licenseTypeLabel')}</div>
        <div class="ck-license-value">${ld.licenseType}${ld.licenseUrl ? ` <a href="${ld.licenseUrl}" target="_blank" rel="noopener">${I18n.t('checkerViewTerms')}</a>` : ''}</div>
      </div>
    </div>` : '';

    // Quality bars
    const barsHtml = SCORE_KEYS.map(k => {
      const v = qs[k] || 0;
      return `<div class="ck-bar-item">
        <span class="ck-bar-label">${scoreLabel(k)}</span>
        <div class="ck-bar-track"><div class="ck-bar-fill" data-width="${v * 20}%"></div></div>
        <span class="ck-bar-stars">${stars(v)}</span>
      </div>`;
    }).join('');

    // Formats from tags
    const formats = (site.tags || []).filter(t => ['png','svg','jpg','jpeg','mp3','mp4','wav','ogg','otf','ttf','woff','fbx','obj','gltf','psd','ai','eps','raw','gif','webp','lottie'].includes(t.toLowerCase()));

    const formatsHtml = formats.length ? `<div class="ck-section">
      <div class="ck-section-title">${I18n.t('checkerFormats')}</div>
      <div class="ck-formats">${formats.map(f => `<span class="ck-format-tag">${f.toUpperCase()}</span>`).join('')}</div>
    </div>` : '';

    // Cautions
    const cautionsHtml = cautions.length ? `<div class="ck-section">
      <div class="ck-section-title">${I18n.t('checkerCautions')}</div>
      <ul class="ck-cautions">${cautions.map(c => `<li>⚠️ ${c}</li>`).join('')}</ul>
    </div>` : '';

    // Compare button state
    const inCompare = compareIds.includes(site.id);
    const compareBtnText = inCompare ? I18n.t('compareRemove') : I18n.t('compareAdd');

    return `
    <div class="ck-header">
      <div class="ck-header-left">
        <h2>${catEmoji} ${name}</h2>
        <div class="ck-url">${site.url}</div>
      </div>
      <div class="ck-header-right">
        <div>
          <div class="ck-grade ck-grade-${grade}">${grade}</div>
          <div class="ck-score-num">${total}/30</div>
        </div>
        <div class="ck-rating">${stars(site.rating || 0)}</div>
      </div>
    </div>

    <div class="ck-section">
      <div class="ck-section-title">── ${I18n.t('checkerLicenseInfo')} ──</div>
      <div class="ck-license-grid">
        ${licenseHtml}
        ${licenseTypeHtml}
      </div>
    </div>

    <div class="ck-section">
      <div class="ck-section-title">── ${I18n.t('checkerQualityDetail')} ──</div>
      <div class="ck-quality-content">
        <div class="ck-radar-wrap">${renderRadar(qs)}</div>
        <div class="ck-bars">${barsHtml}</div>
      </div>
    </div>

    ${formatsHtml}
    ${cautionsHtml}

    <div class="ck-verified">${I18n.t('checkerLastVerified')}: ${I18n.t('verifiedDate')} | ${I18n.t('checkerDisclaimer')}</div>

    <div class="ck-actions">
      <a href="${site.affiliateUrl || site.url}" target="_blank" rel="noopener" class="ck-btn ck-btn-primary">${I18n.t('visitSite')} →</a>
      <button class="ck-btn ck-btn-outline" onclick="Checker.toggleCompare('${site.id}')">${compareBtnText} ⚖️</button>
      <a href="detail.html?id=${site.id}" class="ck-btn ck-btn-outline">${I18n.t('viewDetail')}</a>
    </div>`;
  }

  // ── Comparison Table ──
  function renderComparison() {
    const section = document.getElementById('checkerCompare');
    if (compareIds.length < 2) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    const cSites = compareIds.map(id => sites.find(s => s.id === id)).filter(Boolean);
    if (cSites.length < 2) { section.style.display = 'none'; return; }

    // Mini cards in grid
    document.getElementById('checkerCompareGrid').innerHTML = cSites.map(s => {
      const { total, grade } = calcGrade(s.qualityScore || {});
      return `<div class="checker-card" style="padding:16px;cursor:pointer" onclick="Checker.showSite('${s.id}')">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="ck-grade ck-grade-${grade}" style="width:40px;height:40px;font-size:1.2rem">${grade}</div>
          <div>
            <strong>${I18n.localize(s.name)}</strong>
            <div style="font-size:.8rem;color:var(--c-text-sub)">${total}/30</div>
          </div>
        </div>
      </div>`;
    }).join('');

    // Comparison table
    const lang = I18n.getLang();
    const rows = [
      { label: I18n.t('checkerGradeLabel'), vals: cSites.map(s => { const { total, grade } = calcGrade(s.qualityScore || {}); return `<span class="ck-grade ck-grade-${grade}" style="width:32px;height:32px;font-size:1rem;display:inline-flex">${grade}</span> ${total}/30`; }) },
      { label: I18n.t('license_commercial'), vals: cSites.map(s => statusIcon(s.licenseDetail?.commercial)) },
      { label: I18n.t('license_credit'), vals: cSites.map(s => statusIcon(s.licenseDetail?.credit)) },
      { label: I18n.t('license_registration'), vals: cSites.map(s => statusIcon(s.licenseDetail?.registration)) },
      { label: I18n.t('license_modification'), vals: cSites.map(s => statusIcon(s.licenseDetail?.modification)) },
      { label: I18n.t('license_redistribution'), vals: cSites.map(s => statusIcon(s.licenseDetail?.redistribution)) },
    ];
    SCORE_KEYS.forEach(k => {
      const vals = cSites.map(s => (s.qualityScore || {})[k] || 0);
      const max = Math.max(...vals);
      rows.push({
        label: scoreLabel(k),
        vals: vals.map(v => `<span${v === max && cSites.length > 1 ? ' class="best-cell"' : ''}>${stars(v)}</span>`)
      });
    });

    const thead = `<tr><th></th>${cSites.map(s => `<th>${I18n.localize(s.name)}</th>`).join('')}</tr>`;
    const tbody = rows.map(r => `<tr><td>${r.label}</td>${r.vals.map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
    document.getElementById('checkerCompareTable').innerHTML = `<thead>${thead}</thead><tbody>${tbody}</tbody>`;
  }

  function statusIcon(val) {
    const st = STATUS_MAP[val] || STATUS_MAP.unknown;
    return `${st.icon} ${statusText(val)}`;
  }

  // ── Search ──
  function search(query) {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return sites.filter(s => {
      const nameJa = (s.name.ja || '').toLowerCase();
      const nameEn = (s.name.en || '').toLowerCase();
      const url = (s.url || '').toLowerCase();
      const id = s.id.toLowerCase();
      return nameJa.includes(q) || nameEn.includes(q) || url.includes(q) || id.includes(q);
    }).slice(0, 10);
  }

  function showDropdown(results) {
    const dd = document.getElementById('checkerDropdown');
    if (!results.length) { dd.classList.remove('show'); return; }
    dd.innerHTML = results.map((s, i) => {
      const name = I18n.localize(s.name);
      const catEmoji = CATEGORY_EMOJI[s.category] || '📦';
      const urlShort = s.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `<div class="checker-dropdown-item${i === activeIndex ? ' active' : ''}" data-id="${s.id}">
        <span>${catEmoji}</span>
        <span class="dd-name">${name}</span>
        <span class="dd-cat">${s.category}</span>
        <span class="dd-url">${urlShort}</span>
      </div>`;
    }).join('');
    dd.classList.add('show');

    dd.querySelectorAll('.checker-dropdown-item').forEach(el => {
      el.addEventListener('click', () => {
        showSite(el.dataset.id);
        dd.classList.remove('show');
      });
    });
  }

  function showSite(id) {
    const site = sites.find(s => s.id === id);
    if (!site) return;
    const input = document.getElementById('checkerInput');
    input.value = I18n.localize(site.name);
    document.getElementById('checkerDropdown').classList.remove('show');

    const section = document.getElementById('checkerResult');
    section.style.display = '';
    document.getElementById('checkerCard').innerHTML = renderCard(site);

    // Animate bars
    requestAnimationFrame(() => {
      section.querySelectorAll('.ck-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    });

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('site', id);
    history.replaceState(null, '', url);

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderComparison();
  }

  function toggleCompare(id) {
    const idx = compareIds.indexOf(id);
    if (idx >= 0) {
      compareIds.splice(idx, 1);
    } else {
      if (compareIds.length >= 3) compareIds.shift();
      compareIds.push(id);
    }
    localStorage.setItem('checkerCompare', JSON.stringify(compareIds));

    // Re-render current card if showing
    const currentSiteParam = new URL(window.location).searchParams.get('site');
    if (currentSiteParam) showSite(currentSiteParam);
    renderComparison();
    updateCompareUrl();
  }

  function clearCompare() {
    compareIds = [];
    localStorage.setItem('checkerCompare', '[]');
    document.getElementById('checkerCompare').style.display = 'none';
    const currentSiteParam = new URL(window.location).searchParams.get('site');
    if (currentSiteParam) showSite(currentSiteParam);
    updateCompareUrl();
  }

  function updateCompareUrl() {
    const url = new URL(window.location);
    if (compareIds.length) {
      url.searchParams.set('compare', compareIds.join(','));
    } else {
      url.searchParams.delete('compare');
    }
    history.replaceState(null, '', url);
  }

  // ── Init ──
  async function init() {
    const res = await fetch('data/sites.json');
    const data = await res.json();
    sites = data.sites || [];

    // Site count
    const countEl = document.getElementById('checkerSiteCount');
    if (countEl) countEl.textContent = I18n.t('checkerSiteCountLabel').replace('{count}', sites.length);

    const input = document.getElementById('checkerInput');
    const dd = document.getElementById('checkerDropdown');

    // Search input
    input.addEventListener('input', () => {
      activeIndex = -1;
      const results = search(input.value);
      showDropdown(results);
    });

    // Keyboard nav
    input.addEventListener('keydown', (e) => {
      const items = dd.querySelectorAll('.checker-dropdown-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        items.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const id = items[activeIndex]?.dataset.id;
        if (id) showSite(id);
      } else if (e.key === 'Escape') {
        dd.classList.remove('show');
      }
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.checker-search-wrap')) {
        dd.classList.remove('show');
      }
    });

    // Clear compare
    document.getElementById('btnCompareClear')?.addEventListener('click', clearCompare);

    // URL params
    const params = new URLSearchParams(window.location.search);
    const siteParam = params.get('site');
    const compareParam = params.get('compare');

    if (compareParam) {
      compareIds = compareParam.split(',').filter(id => sites.find(s => s.id === id));
      localStorage.setItem('checkerCompare', JSON.stringify(compareIds));
    }

    if (siteParam) {
      showSite(siteParam);
    }

    renderComparison();

    // Theme toggle
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.dataset.theme;
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
        themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
      });
      themeBtn.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
    }

    // Language toggle
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        I18n.toggle();
        // Re-render if a site is shown
        const currentId = new URL(window.location).searchParams.get('site');
        if (currentId) showSite(currentId);
        renderComparison();
        if (countEl) countEl.textContent = I18n.t('checkerSiteCountLabel').replace('{count}', sites.length);
      });
    }

    // Hamburger
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
    }

    // Back to top
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
      });
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Listen for language change events
    window.addEventListener('langchange', () => {
      const currentId = new URL(window.location).searchParams.get('site');
      if (currentId) showSite(currentId);
      renderComparison();
      if (countEl) countEl.textContent = I18n.t('checkerSiteCountLabel').replace('{count}', sites.length);
    });
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { showSite, toggleCompare, clearCompare };
})();
