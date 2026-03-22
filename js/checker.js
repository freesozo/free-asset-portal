// checker.js – License & Quality Checker
const Checker = (() => {
  let sites = [];
  let compareIds = JSON.parse(localStorage.getItem('checkerCompare') || '[]');
  let activeIndex = -1;

  const CATEGORY_EMOJI = {
    photo:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    illustration:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>',
    icon:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    music:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    sound:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    video:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>',
    font:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>',
    '3d':'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    texture:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    template:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    mockup:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    asset:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>',
    archive:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
  };

  const STATUS_MAP = {
    ok:          { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', cls: 'ok' },
    conditional: { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', cls: 'warn' },
    required:    { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', cls: 'warn' },
    not_required:{ icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', cls: 'ok' },
    optional:    { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', cls: 'info' },
    ng:          { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', cls: 'ng' },
    unknown:     { icon: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', cls: 'unknown' }
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
    const filled = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const empty = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    return filled.repeat(n) + empty.repeat(5 - n);
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
    const catEmoji = CATEGORY_EMOJI[site.category] || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';

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
      <span class="ck-license-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
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
      <ul class="ck-cautions">${cautions.map(c => `<li><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${c}</li>`).join('')}</ul>
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
      <button class="ck-btn ck-btn-outline" onclick="Checker.toggleCompare('${site.id}')">${compareBtnText}</button>
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
      const catEmoji = CATEGORY_EMOJI[s.category] || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
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
        themeBtn.innerHTML = next === 'dark' ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      });
      themeBtn.innerHTML = document.documentElement.dataset.theme === 'dark' ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
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
