#!/usr/bin/env python3
"""
Static Page Generator for freesozo.com (Free Asset Portal)
Generates SEO-optimized static HTML pages from data/sites.json:
  - category/*.html  (13 category listing pages)
  - sitemap.xml update

Usage: py generate-pages.py
"""

import json
import os
import html as html_mod
from datetime import date

# ── Config ──────────────────────────────────────────────────────────
BASE_URL = "https://freesozo.com"
SITE_NAME = "フリー素材ポータル"
SITE_NAME_EN = "Free Asset Portal"
GA_ID = "G-TW9TKBPSNW"
ADSENSE_PUB = "ca-pub-1060876188767022"
CSS_VERSION = 10
JS_VERSION = 10
TODAY = date.today().isoformat()
YEAR = date.today().year

CATEGORY_META = {
    "illustration": {
        "ja": "イラスト素材", "en": "Illustration",
        "emoji": "🎨",
        "desc_ja": "商用利用OK・クレジット不要のフリーイラスト素材サイトを厳選。Web制作やプレゼン資料に使える高品質なイラストを無料でダウンロードできます。",
        "desc_en": "Curated free illustration asset sites. High-quality illustrations for web design and presentations, with commercial use OK options.",
    },
    "photo": {
        "ja": "写真素材", "en": "Photo",
        "emoji": "📷",
        "desc_ja": "プロ品質のフリー写真素材サイトを厳選。高解像度の無料写真をダウンロードでき、商用利用やSNS投稿にも対応しています。",
        "desc_en": "Curated free photo stock sites. Download high-resolution photos for commercial use, web design, and social media.",
    },
    "icon": {
        "ja": "アイコン素材", "en": "Icon",
        "emoji": "🔷",
        "desc_ja": "無料で使えるアイコン素材サイトを厳選。SVG・PNGフォーマット対応、Web制作やアプリ開発に最適なアイコンセットが見つかります。",
        "desc_en": "Curated free icon asset sites. Find SVG and PNG icons for web design and app development.",
    },
    "music": {
        "ja": "音楽・BGM素材", "en": "Music / BGM",
        "emoji": "🎵",
        "desc_ja": "YouTubeやゲーム制作に使える無料BGM・音楽素材サイトを厳選。商用利用OKのフリー音楽を簡単にダウンロードできます。",
        "desc_en": "Curated free music and BGM sites for YouTube, games, and commercial projects.",
    },
    "archive": {
        "ja": "総合素材", "en": "Archive",
        "emoji": "📦",
        "desc_ja": "写真・イラスト・音楽など複数ジャンルの素材を提供する総合フリー素材サイトを厳選。一つのサイトで幅広い素材が見つかります。",
        "desc_en": "Curated multi-category free asset sites offering photos, illustrations, music and more in one place.",
    },
    "texture": {
        "ja": "テクスチャ・背景素材", "en": "Texture & Background",
        "emoji": "🖼️",
        "desc_ja": "Web制作やゲーム開発に使える無料テクスチャ・背景素材サイトを厳選。高品質なパターンやテクスチャをダウンロードできます。",
        "desc_en": "Curated free texture and background sites for web design and game development.",
    },
    "asset": {
        "ja": "ゲーム素材", "en": "Game Asset",
        "emoji": "🎮",
        "desc_ja": "ゲーム開発に使える無料素材サイトを厳選。2Dスプライト、UI素材、タイルマップなどのゲームアセットが見つかります。",
        "desc_en": "Curated free game asset sites with sprites, UI elements, tilemaps and more.",
    },
    "sound": {
        "ja": "効果音素材", "en": "Sound Effect",
        "emoji": "🔊",
        "desc_ja": "ゲーム・動画制作に使える無料効果音素材サイトを厳選。商用利用OKのSE・環境音をダウンロードできます。",
        "desc_en": "Curated free sound effect sites for games and video production.",
    },
    "video": {
        "ja": "動画素材", "en": "Video",
        "emoji": "🎬",
        "desc_ja": "商用利用OKの無料動画素材サイトを厳選。背景映像やストックビデオをダウンロードして映像制作に活用できます。",
        "desc_en": "Curated free stock video sites with footage for commercial and personal projects.",
    },
    "font": {
        "ja": "フォント素材", "en": "Font",
        "emoji": "🔤",
        "desc_ja": "商用利用OKのフリーフォントサイトを厳選。日本語フォント・欧文フォントをWeb制作やデザインに無料で使えます。",
        "desc_en": "Curated free font sites with commercial-use fonts for web design and graphic projects.",
    },
    "mockup": {
        "ja": "モックアップ素材", "en": "Mockup",
        "emoji": "📐",
        "desc_ja": "デザインプレゼンに使える無料モックアップ素材サイトを厳選。スマホ・PC・パッケージなどのモックアップテンプレートが見つかります。",
        "desc_en": "Curated free mockup sites for design presentations with device and package templates.",
    },
    "3d": {
        "ja": "3Dモデル素材", "en": "3D Model",
        "emoji": "🧊",
        "desc_ja": "ゲーム開発やCG制作に使える無料3Dモデル素材サイトを厳選。OBJ・FBX・glTF形式の3Dアセットをダウンロードできます。",
        "desc_en": "Curated free 3D model sites with OBJ, FBX, and glTF assets for games and CG production.",
    },
    "template": {
        "ja": "テンプレート素材", "en": "Template",
        "emoji": "📄",
        "desc_ja": "Web制作やプレゼンに使える無料テンプレート素材サイトを厳選。HTMLテンプレートやスライドテンプレートが見つかります。",
        "desc_en": "Curated free template sites for web design and presentations.",
    },
}

# ── Helpers ──────────────────────────────────────────────────────────

def h(text):
    """HTML escape"""
    return html_mod.escape(str(text))


def load_data():
    path = os.path.join(os.path.dirname(__file__), "data", "sites.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    sites = [s for s in data["sites"] if s.get("id")]
    return sites


def star_html(rating):
    r = int(rating)
    return "★" * r + "☆" * (5 - r)


def badge_text(site):
    parts = []
    if site.get("commercial"):
        parts.append('<span class="badge badge-ok">✓ 商用OK</span>')
    else:
        parts.append('<span class="badge badge-warn">✗ 商用NG</span>')
    if not site.get("creditRequired"):
        parts.append('<span class="badge badge-ok">✓ クレジット不要</span>')
    else:
        parts.append('<span class="badge badge-warn">⚠ クレジット必要</span>')
    if not site.get("registrationRequired"):
        parts.append('<span class="badge badge-info">登録不要</span>')
    else:
        parts.append('<span class="badge badge-warn">⚠ 登録必要</span>')
    if site.get("beginnerFriendly"):
        parts.append('<span class="badge badge-info">初心者向け</span>')
    return " ".join(parts)


def site_card_static(site):
    """Generate a static HTML card for a single site."""
    sid = h(site["id"])
    name_ja = h(site["name"]["ja"])
    name_en = h(site["name"]["en"])
    desc_ja = h(site["description"]["ja"])
    highlight_ja = h(site["highlight"]["ja"])
    rating = site.get("rating", 3)
    url = h(site.get("url", ""))
    aff_url = site.get("affiliateUrl")
    visit_url = h(aff_url) if aff_url else url
    tags = site.get("tags", [])
    tags_html = " ".join(f'<span class="tag">{h(t)}</span>' for t in tags[:6])
    badges = badge_text(site)

    return f'''    <article class="card" id="site-{sid}">
      <div class="card-header">
        <span class="card-name">{name_ja}<span class="card-name-en">（{name_en}）</span></span>
        <span class="card-rating" aria-label="{rating}/5">{star_html(rating)}</span>
      </div>
      <p class="card-highlight">{highlight_ja}</p>
      <p class="card-desc-static">{desc_ja}</p>
      <div class="card-badges">{badges}</div>
      <div class="card-tags-row">{tags_html}</div>
      <div class="card-footer">
        <a href="{visit_url}" class="btn-visit-sm" target="_blank" rel="noopener noreferrer nofollow">公式サイトへ →</a>
        <a href="../site/{sid}.html" class="btn-detail-sm">詳細を見る</a>
      </div>
      <span class="card-verified" data-i18n="verifiedDate">{YEAR}年{date.today().month}月 確認済み</span>
    </article>'''


# ── Page generators ──────────────────────────────────────────────────

def page_html(*, title, description, canonical, breadcrumbs, content, schema_json,
              root_prefix=".."):
    """Full HTML page wrapper matching existing site design."""
    bc_items = []
    for name, url in breadcrumbs:
        if url:
            bc_items.append(f'<a href="{url}">{h(name)}</a>')
        else:
            bc_items.append(f'<span>{h(name)}</span>')
    bc_html = '\n      <span aria-hidden="true">›</span>\n      '.join(bc_items)

    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{h(title)}</title>
  <meta name="description" content="{h(description)}">
  <meta name="author" content="{SITE_NAME}">
  <meta name="theme-color" content="#6c63ff">
  <meta property="og:title" content="{h(title)}">
  <meta property="og:description" content="{h(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:image" content="{BASE_URL}/og-image.png">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{h(title)}">
  <meta name="twitter:description" content="{h(description)}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="ja" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{canonical}?lang=en">
  <link rel="icon" href="{root_prefix}/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700;900&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
  <script>(function(){{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;}})();</script>
  <link rel="stylesheet" href="{root_prefix}/css/style.css?v={CSS_VERSION}">
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', '{GA_ID}');
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE_PUB}" crossorigin="anonymous"></script>
  <script type="application/ld+json">
{schema_json}
  </script>
</head>
<body>

  <header class="site-header">
    <div class="container header-inner">
      <div class="site-logo">
        <a href="{root_prefix}/index.html">📦 <span data-i18n="siteTitle">{SITE_NAME}</span></a>
      </div>
      <nav class="header-nav">
        <a href="{root_prefix}/index.html" data-i18n="breadcrumbHome">ホーム</a>
        <a href="{root_prefix}/index.html#categoryNav" data-i18n="categoryHeading">カテゴリ</a>
        <a href="{root_prefix}/blog/" data-i18n="navBlog">ブログ</a>
        <a href="{root_prefix}/about.html" data-i18n="aboutNav">サイトについて</a>
      </nav>
      <div class="header-actions">
        <button class="theme-btn" id="themeBtn" aria-label="Toggle theme">🌙</button>
        <button class="lang-btn" id="langBtn" data-i18n="lang">🌐 English</button>
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Menu">☰</button>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" id="mobileNav">
    <a href="{root_prefix}/index.html" data-i18n="breadcrumbHome">ホーム</a>
    <a href="{root_prefix}/index.html#categoryNav" data-i18n="categoryHeading">カテゴリ</a>
    <a href="{root_prefix}/blog/" data-i18n="navBlog">ブログ</a>
    <a href="{root_prefix}/about.html" data-i18n="aboutNav">サイトについて</a>
  </nav>

  <main class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      {bc_html}
    </nav>

{content}
  </main>

  <section class="sister-banner">
    <div class="container">
      <p><span data-i18n="sisterBannerPrefix">🔧 ビジネスツールを探すなら →</span> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener"><strong data-i18n="sisterBannerName">おすすめツール比較ナビ</strong></a> <span data-i18n="sisterBannerSuffix">- 100以上のツールを徹底比較</span></p>
    </div>
  </section>

  <footer class="site-footer">
    <div class="container">
      <p data-i18n="footerNotice">※ 各サイトの利用規約は変更される場合があります。素材利用前に必ず各サイトの最新の利用規約をご確認ください。</p>
      <p class="affiliate-disclosure" data-i18n="affiliateDisclosure">※ 一部リンクはアフィリエイトリンクを含みます。サイト運営のサポートにご協力ください。</p>
      <p class="footer-links">
        <a href="{root_prefix}/privacy.html" data-i18n="privacyPolicy">プライバシーポリシー</a>
        <span style="margin:0 8px;">|</span>
        <a href="{root_prefix}/about.html" data-i18n="aboutNav">サイトについて</a>
        <span style="margin:0 8px;">|</span>
        <a href="{root_prefix}/blog/" data-i18n="navBlog">ブログ</a>
      </p>
      <p class="sister-site"><span data-i18n="footerSister">姉妹サイト:</span> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener"><span data-i18n="footerSisterName">おすすめツール比較ナビ</span></a></p>
    </div>
  </footer>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>

  <script src="{root_prefix}/js/i18n.js?v={JS_VERSION}"></script>
  <script src="{root_prefix}/js/app.js?v={JS_VERSION}"></script>
  <script>
    if(typeof App!=='undefined'&&App.init)try{{App.init();}}catch(e){{}}
    document.getElementById('langBtn')?.addEventListener('click',function(){{I18n.toggle();}});
    document.getElementById('themeBtn')?.addEventListener('click',function(){{
      var t=document.documentElement.dataset.theme==='dark'?'light':'dark';
      document.documentElement.dataset.theme=t;localStorage.setItem('theme',t);
      this.textContent=t==='dark'?'☀️':'🌙';
    }});
    var btt=document.getElementById('backToTop');
    if(btt){{window.addEventListener('scroll',function(){{btt.classList.toggle('visible',window.scrollY>400);}});btt.addEventListener('click',function(){{window.scrollTo({{top:0,behavior:'smooth'}});}});}}
    var hb=document.getElementById('hamburgerBtn'),mn=document.getElementById('mobileNav');
    if(hb&&mn){{hb.addEventListener('click',function(){{mn.classList.toggle('open');}});}}
  </script>
</body>
</html>'''


def generate_category_page(cat_id, sites):
    """Generate a static category page."""
    meta = CATEGORY_META[cat_id]
    cat_ja = meta["ja"]
    cat_en = meta["en"]
    emoji = meta["emoji"]
    count = len(sites)

    title = f"無料{cat_ja}サイト一覧 {count}選【{YEAR}年最新】| {SITE_NAME}"
    description = meta["desc_ja"]
    canonical = f"{BASE_URL}/category/{cat_id}.html"

    # Sort: rating desc, then name
    sites_sorted = sorted(sites, key=lambda s: (-s.get("rating", 0), s["name"]["ja"]))

    # Build cards
    cards = "\n".join(site_card_static(s) for s in sites_sorted)

    # Build comparison table
    table_rows = []
    for s in sites_sorted:
        sid = h(s["id"])
        name = h(s["name"]["ja"])
        commercial = "○" if s.get("commercial") else "×"
        credit = "不要" if not s.get("creditRequired") else "必要"
        reg = "不要" if not s.get("registrationRequired") else "必要"
        rating = star_html(s.get("rating", 3))
        table_rows.append(f'          <tr><td><a href="#site-{sid}">{name}</a></td><td>{commercial}</td><td>{credit}</td><td>{reg}</td><td>{rating}</td></tr>')
    table_rows_str = "\n".join(table_rows)

    # Cross links to other categories
    other_cats = [c for c in CATEGORY_META if c != cat_id]
    cat_links = "\n".join(
        f'        <a href="{c}.html" class="tag">{CATEGORY_META[c]["emoji"]} {CATEGORY_META[c]["ja"]}</a>'
        for c in other_cats
    )

    # Related blog articles
    blog_links = []
    cat_blog = f"../blog/{cat_id}-free-sites.html"
    blog_links.append(f'        <li><a href="{cat_blog}">無料{h(cat_ja)}サイトまとめ【{YEAR}年版】</a></li>')
    # Feature articles that might relate
    for feat, feat_label in [("commercial-use", "商用利用OKの"), ("no-credit", "クレジット不要の"),
                              ("no-registration", "登録不要の"), ("beginner-friendly", "初心者向けの")]:
        blog_links.append(
            f'        <li><a href="../blog/{feat}-free-sites.html">{feat_label}フリー素材サイトまとめ</a></li>'
        )
    blog_links.append(f'        <li><a href="../blog/best-free-sites-ranking.html">フリー素材サイトおすすめランキングTOP20</a></li>')
    blog_section = "\n".join(blog_links)

    content = f'''    <section class="section">
      <h1 class="section-title">{emoji} 無料{h(cat_ja)}サイト一覧 {count}選【{YEAR}年最新】</h1>
      <p class="section-lead">{h(description)}</p>
      <p class="section-count">掲載サイト数: <strong>{count}サイト</strong>（{YEAR}年{date.today().month}月更新）</p>

      <h2>比較表</h2>
      <div class="blog-comparison-table">
        <table>
          <thead>
            <tr><th>サイト名</th><th>商用利用</th><th>クレジット</th><th>登録</th><th>評価</th></tr>
          </thead>
          <tbody>
{table_rows_str}
          </tbody>
        </table>
      </div>

      <h2>各サイトの詳細</h2>
      <div class="card-grid">
{cards}
      </div>

      <h2>{emoji} {h(cat_ja)}に関する記事</h2>
      <ul class="related-list" style="margin-bottom:24px">
{blog_section}
      </ul>

      <div class="sister-banner" style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:12px;padding:20px;margin-bottom:24px">
        <p>🔧 <strong>制作に使えるツールの比較はこちら →</strong> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener">おすすめツール比較ナビ</a> — デザイン・AI・動画編集など100以上のツールを徹底比較</p>
      </div>

      <h2>他のカテゴリを見る</h2>
      <div class="category-links-grid">
{cat_links}
      </div>
    </section>'''

    # JSON-LD: ItemList + BreadcrumbList
    item_list_elements = []
    for i, s in enumerate(sites_sorted, 1):
        item_list_elements.append({
            "@type": "ListItem",
            "position": i,
            "name": s["name"]["ja"],
            "url": f"{BASE_URL}/site/{s['id']}.html"
        })

    schema = json.dumps([
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": f"無料{cat_ja}サイト一覧",
            "description": description,
            "numberOfItems": count,
            "itemListElement": item_list_elements
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "ホーム", "item": f"{BASE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": f"{cat_ja}サイト一覧", "item": canonical}
            ]
        }
    ], ensure_ascii=False, indent=2)

    breadcrumbs = [
        ("ホーム", "../index.html"),
        ("カテゴリ", "../index.html#categoryNav"),
        (f"{emoji} {cat_ja}", None),
    ]

    return page_html(
        title=title,
        description=description,
        canonical=canonical,
        breadcrumbs=breadcrumbs,
        content=content,
        schema_json=schema,
    )


def generate_site_detail_page(site, all_sites, by_cat):
    """Generate a static detail page for a single site."""
    sid = site["id"]
    name_ja = site["name"]["ja"]
    name_en = site["name"]["en"]
    desc_ja = site["description"]["ja"]
    highlight_ja = site["highlight"]["ja"]
    rating = site.get("rating", 3)
    url = site.get("url", "")
    aff_url = site.get("affiliateUrl")
    visit_url = aff_url if aff_url else url
    cat_id = site.get("category", "")
    meta = CATEGORY_META.get(cat_id, {"ja": cat_id, "en": cat_id, "emoji": ""})
    cat_ja = meta["ja"]
    emoji = meta["emoji"]
    tags = site.get("tags", [])
    badges = badge_text(site)

    title = f"{name_ja}（{name_en}）の詳細・評判【無料{cat_ja}】| {SITE_NAME}"
    description = f"{name_ja}は{highlight_ja} {desc_ja[:80]}"
    canonical = f"{BASE_URL}/site/{sid}.html"

    # Tags HTML
    tags_html = " ".join(f'<span class="tag">{h(t)}</span>' for t in tags)

    # Use cases
    use_cases = site.get("useCases", [])

    # License info
    lic_rows = [
        ("商用利用", "○ 可能" if site.get("commercial") else "× 不可"),
        ("クレジット表記", "不要" if not site.get("creditRequired") else "必要"),
        ("ユーザー登録", "不要" if not site.get("registrationRequired") else "必要"),
        ("初心者向け", "○" if site.get("beginnerFriendly") else "—"),
    ]
    lic_html = "\n".join(
        f'          <tr><th>{h(k)}</th><td>{h(v)}</td></tr>' for k, v in lic_rows
    )

    # Related sites (same category, excluding self, top 5)
    related = [s for s in by_cat.get(cat_id, []) if s["id"] != sid]
    related = sorted(related, key=lambda s: -s.get("rating", 0))[:5]
    related_html = ""
    if related:
        related_items = "\n".join(
            f'        <li><a href="{s["id"]}.html">{h(s["name"]["ja"])}</a> — {h(s["highlight"]["ja"])}</li>'
            for s in related
        )
        related_html = f'''
      <h2>関連する{h(cat_ja)}サイト</h2>
      <ul class="related-list">
{related_items}
      </ul>'''

    content = f'''    <section class="section privacy-policy">
      <h1>{h(name_ja)}（{h(name_en)}）</h1>
      <p class="section-lead">{h(highlight_ja)}</p>
      <div class="card-badges" style="margin-bottom:16px">{badges}</div>
      <span class="card-verified" style="display:inline-block;margin-bottom:16px" data-i18n="verifiedDate">{YEAR}年{date.today().month}月 確認済み</span>

      <h2>サイト概要</h2>
      <p>{h(desc_ja)}</p>

      <h2>ライセンス情報</h2>
      <div class="blog-comparison-table">
        <table>
          <tbody>
{lic_html}
          </tbody>
        </table>
      </div>

      <h2>タグ</h2>
      <div class="card-tags-row" style="margin-bottom:16px">{tags_html}</div>

      <div class="detail-disclaimer" style="margin:24px 0">
        <p>⚠️ 利用規約は各サイトで変更される場合があります。素材利用前に必ず公式サイトの最新の利用規約をご確認ください。</p>
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px">
        <a href="{h(visit_url)}" class="btn-visit-sm" target="_blank" rel="noopener noreferrer nofollow" style="padding:10px 24px;font-size:.9rem">公式サイトへ →</a>
        <a href="../category/{h(cat_id)}.html" class="btn-detail-sm" style="padding:10px 24px;font-size:.9rem">{emoji} {h(cat_ja)}サイト一覧に戻る</a>
      </div>
{related_html}

      <div style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:12px;padding:20px;margin-top:24px">
        <p>🔧 <strong>制作に使えるツールも探す →</strong> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener">おすすめツール比較ナビ</a></p>
      </div>
    </section>'''

    schema = json.dumps([
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": f"{name_ja}（{name_en}）",
            "description": description,
            "url": canonical,
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "ホーム", "item": f"{BASE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": f"{cat_ja}サイト一覧",
                 "item": f"{BASE_URL}/category/{cat_id}.html"},
                {"@type": "ListItem", "position": 3, "name": name_ja, "item": canonical}
            ]
        }
    ], ensure_ascii=False, indent=2)

    breadcrumbs = [
        ("ホーム", "../index.html"),
        (f"{emoji} {cat_ja}", f"../category/{cat_id}.html"),
        (name_ja, None),
    ]

    return page_html(
        title=title,
        description=description,
        canonical=canonical,
        breadcrumbs=breadcrumbs,
        content=content,
        schema_json=schema,
    )


# ── Use-case page definitions ────────────────────────────────────────

USE_CASES = [
    {
        "slug": "commercial-illustration",
        "title_ja": "商用利用OKの無料イラスト素材サイト",
        "lead_ja": "Webサイト・広告・パンフレットなどビジネス用途で使える、商用利用OKの無料イラスト素材サイトを厳選しました。クレジット表記不要のサイトも多数掲載しています。",
        "filter": lambda s: s.get("category") == "illustration" and s.get("commercial"),
    },
    {
        "slug": "commercial-photo",
        "title_ja": "商用利用OKの無料写真素材サイト",
        "lead_ja": "ブログ・ECサイト・SNS投稿に使える、商用利用OKのフリー写真素材サイトを厳選。高解像度でプロ品質の写真を無料ダウンロードできます。",
        "filter": lambda s: s.get("category") == "photo" and s.get("commercial"),
    },
    {
        "slug": "no-registration-photo",
        "title_ja": "登録不要で使える無料写真素材サイト",
        "lead_ja": "会員登録なしですぐにダウンロードできるフリー写真素材サイトをまとめました。急ぎのプロジェクトや手軽に素材を探したいときに最適です。",
        "filter": lambda s: s.get("category") == "photo" and not s.get("registrationRequired"),
    },
    {
        "slug": "no-credit-illustration",
        "title_ja": "クレジット不要の無料イラスト素材サイト",
        "lead_ja": "著作権表記（クレジット）なしで使えるフリーイラスト素材サイトを厳選。クライアントワークやSNS投稿で手軽に活用できます。",
        "filter": lambda s: s.get("category") == "illustration" and not s.get("creditRequired"),
    },
    {
        "slug": "youtube-bgm",
        "title_ja": "YouTube向け無料BGMサイト",
        "lead_ja": "YouTubeの動画制作に使える、商用利用OKの無料BGM・音楽素材サイトを厳選しました。クレジット表記不要のサイトも含め、用途別に比較できます。",
        "filter": lambda s: s.get("category") in ("music", "sound") and s.get("commercial"),
    },
    {
        "slug": "game-3d-model",
        "title_ja": "ゲーム開発向け無料3Dモデル素材サイト",
        "lead_ja": "Unity・Unreal Engine・Godotでのゲーム開発に使える無料3Dモデル素材サイトを厳選。CC0ライセンスの商用利用OKサイトも多数。",
        "filter": lambda s: s.get("category") in ("3d", "asset") and "game" in s.get("useCases", []),
    },
    {
        "slug": "beginner-all",
        "title_ja": "初心者向けフリー素材サイト",
        "lead_ja": "素材探しが初めての方でも安心して使える、初心者向けのフリー素材サイトをジャンル横断でまとめました。使いやすさ・分かりやすさを重視して厳選しています。",
        "filter": lambda s: s.get("beginnerFriendly"),
    },
    {
        "slug": "credit-free-icon",
        "title_ja": "クレジット不要の無料アイコン素材サイト",
        "lead_ja": "著作権表記なしで使えるフリーアイコン素材サイトを厳選。SVG・PNG対応でWebサイトやアプリのUIデザインにすぐ活用できます。",
        "filter": lambda s: s.get("category") == "icon" and not s.get("creditRequired"),
    },
    {
        "slug": "commercial-font",
        "title_ja": "商用利用OKの無料フォントサイト",
        "lead_ja": "Webサイト・ロゴ・ポスターなどに商用利用できるフリーフォントサイトを厳選。日本語フォントを含む高品質なフォントが無料でダウンロードできます。",
        "filter": lambda s: s.get("category") == "font" and s.get("commercial"),
    },
    {
        "slug": "game-sound-effect",
        "title_ja": "ゲーム開発向け無料効果音素材サイト",
        "lead_ja": "ゲーム制作に使える無料効果音（SE）素材サイトを厳選。RPG・アクション・カジュアルゲームなどジャンル問わず活用できる高品質な効果音が見つかります。",
        "filter": lambda s: s.get("category") == "sound" and s.get("commercial"),
    },
    {
        "slug": "no-registration-music",
        "title_ja": "登録不要で使える無料音楽・BGMサイト",
        "lead_ja": "会員登録なしですぐにダウンロードできる無料BGM・音楽素材サイトをまとめました。YouTube動画やプレゼン資料のBGMに最適です。",
        "filter": lambda s: s.get("category") == "music" and not s.get("registrationRequired"),
    },
    {
        "slug": "commercial-texture",
        "title_ja": "商用利用OKの無料テクスチャ・背景素材サイト",
        "lead_ja": "Web制作・ゲーム開発・3DCGに使える商用利用OKの無料テクスチャ・背景素材サイトを厳選。PBRマテリアルやシームレスパターンも多数。",
        "filter": lambda s: s.get("category") == "texture" and s.get("commercial"),
    },
    {
        "slug": "commercial-video",
        "title_ja": "商用利用OKの無料動画素材サイト",
        "lead_ja": "プロモーション動画・プレゼン・広告に使える商用利用OKの無料動画素材（ストックビデオ）サイトを厳選。4K対応の高品質素材も掲載。",
        "filter": lambda s: s.get("category") == "video" and s.get("commercial"),
    },
    {
        "slug": "japanese-illustration",
        "title_ja": "日本語対応の無料イラスト素材サイト",
        "lead_ja": "日本語で検索・利用できるフリーイラスト素材サイトを厳選。利用規約も日本語で確認でき、安心して使えるサイトばかりです。",
        "filter": lambda s: s.get("category") == "illustration" and "japanese" in s.get("tags", []),
    },
    {
        "slug": "game-sprite",
        "title_ja": "ゲーム開発向け無料2Dスプライト・アセットサイト",
        "lead_ja": "2Dゲーム開発に使える無料スプライト・ゲームアセットサイトを厳選。ドット絵・キャラクター・タイルマップなどインディーゲーム制作に最適な素材が見つかります。",
        "filter": lambda s: s.get("category") == "asset" and s.get("commercial"),
    },
    {
        "slug": "no-registration-icon",
        "title_ja": "登録不要の無料アイコン素材サイト",
        "lead_ja": "会員登録なしですぐにダウンロードできるフリーアイコン素材サイトを厳選。SVGやPNGをワンクリックでダウンロードして即座にプロジェクトに組み込めます。",
        "filter": lambda s: s.get("category") == "icon" and not s.get("registrationRequired"),
    },
    {
        "slug": "commercial-mockup",
        "title_ja": "商用利用OKの無料モックアップ素材サイト",
        "lead_ja": "デザインプレゼンやポートフォリオに使える商用利用OKのフリーモックアップ素材サイトを厳選。スマホ・PC・パッケージなどのテンプレートが無料でダウンロードできます。",
        "filter": lambda s: s.get("category") == "mockup" and s.get("commercial"),
    },
    {
        "slug": "web-design-all",
        "title_ja": "Web制作に使える無料素材サイトまとめ",
        "lead_ja": "Webサイト制作に必要な写真・イラスト・アイコン・フォント・テンプレートなど、Web制作向けの無料素材サイトをジャンル横断でまとめました。",
        "filter": lambda s: "web" in s.get("useCases", []) and s.get("commercial"),
    },
]


def generate_use_case_page(uc, matched_sites):
    """Generate a use-case combination page."""
    slug = uc["slug"]
    title_ja = uc["title_ja"]
    lead = uc["lead_ja"]
    count = len(matched_sites)

    title = f"{title_ja} {count}選【{YEAR}年最新】| {SITE_NAME}"
    description = lead[:160]
    canonical = f"{BASE_URL}/use-case/{slug}.html"

    sites_sorted = sorted(matched_sites, key=lambda s: (-s.get("rating", 0), s["name"]["ja"]))
    cards = "\n".join(site_card_static(s) for s in sites_sorted)

    # Table
    table_rows = []
    for s in sites_sorted:
        sid = h(s["id"])
        name = h(s["name"]["ja"])
        commercial = "○" if s.get("commercial") else "×"
        credit = "不要" if not s.get("creditRequired") else "必要"
        reg = "不要" if not s.get("registrationRequired") else "必要"
        rating = star_html(s.get("rating", 3))
        table_rows.append(f'          <tr><td><a href="#site-{sid}">{name}</a></td><td>{commercial}</td><td>{credit}</td><td>{reg}</td><td>{rating}</td></tr>')
    table_str = "\n".join(table_rows)

    content = f'''    <section class="section">
      <h1 class="section-title">{h(title_ja)} {count}選【{YEAR}年最新】</h1>
      <p class="section-lead">{h(lead)}</p>
      <p class="section-count">該当サイト数: <strong>{count}サイト</strong>（{YEAR}年{date.today().month}月更新）</p>

      <h2>比較表</h2>
      <div class="blog-comparison-table">
        <table>
          <thead><tr><th>サイト名</th><th>商用利用</th><th>クレジット</th><th>登録</th><th>評価</th></tr></thead>
          <tbody>
{table_str}
          </tbody>
        </table>
      </div>

      <h2>各サイトの詳細</h2>
      <div class="card-grid">
{cards}
      </div>

      <div class="sister-banner" style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:12px;padding:20px;margin:24px 0">
        <p>🔧 <strong>制作に使えるツールの比較はこちら →</strong> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener">おすすめツール比較ナビ</a></p>
      </div>

      <h2>カテゴリから探す</h2>
      <div class="category-links-grid">
{"".join(f'        <a href="../category/{c}.html" class="tag">{CATEGORY_META[c]["emoji"]} {CATEGORY_META[c]["ja"]}</a>' + chr(10) for c in sorted(CATEGORY_META.keys()))}
      </div>
    </section>'''

    item_list = [{"@type": "ListItem", "position": i+1, "name": s["name"]["ja"],
                  "url": f"{BASE_URL}/site/{s['id']}.html"}
                 for i, s in enumerate(sites_sorted)]

    schema = json.dumps([
        {"@context": "https://schema.org", "@type": "ItemList",
         "name": title_ja, "description": lead, "numberOfItems": count,
         "itemListElement": item_list},
        {"@context": "https://schema.org", "@type": "BreadcrumbList",
         "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": "ホーム", "item": f"{BASE_URL}/"},
             {"@type": "ListItem", "position": 2, "name": title_ja, "item": canonical}
         ]}
    ], ensure_ascii=False, indent=2)

    return page_html(
        title=title, description=description, canonical=canonical,
        breadcrumbs=[("ホーム", "../index.html"), (title_ja, None)],
        content=content, schema_json=schema,
    )


def update_sitemap(generated_categories, generated_sites, generated_usecases):
    """Add category + site + use-case page URLs to sitemap.xml."""
    sitemap_path = os.path.join(os.path.dirname(__file__), "sitemap.xml")
    with open(sitemap_path, "r", encoding="utf-8") as f:
        content = f.read()

    import re
    content = re.sub(r'  <!-- SSG categories -->\n(?:.*\n)*?  <!-- /SSG categories -->\n', '', content)
    content = re.sub(r'  <!-- SSG sites -->\n(?:.*\n)*?  <!-- /SSG sites -->\n', '', content)
    content = re.sub(r'  <!-- SSG usecases -->\n(?:.*\n)*?  <!-- /SSG usecases -->\n', '', content)

    new_urls = ['  <!-- SSG categories -->']
    for cat_id in generated_categories:
        new_urls.append(f'  <url><loc>{BASE_URL}/category/{cat_id}.html</loc><lastmod>{TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>')
    new_urls.append('  <!-- /SSG categories -->')
    new_urls.append('  <!-- SSG sites -->')
    for sid in generated_sites:
        new_urls.append(f'  <url><loc>{BASE_URL}/site/{sid}.html</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>')
    new_urls.append('  <!-- /SSG sites -->')
    new_urls.append('  <!-- SSG usecases -->')
    for slug in generated_usecases:
        new_urls.append(f'  <url><loc>{BASE_URL}/use-case/{slug}.html</loc><lastmod>{TODAY}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>')
    new_urls.append('  <!-- /SSG usecases -->')

    content = content.replace("</urlset>", "\n".join(new_urls) + "\n</urlset>")
    with open(sitemap_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Updated sitemap.xml ({len(generated_categories)} cats + {len(generated_sites)} sites + {len(generated_usecases)} use-cases)")


# ── CSS additions ────────────────────────────────────────────────────

def ensure_static_css():
    """Add CSS for static page elements if not already present."""
    css_path = os.path.join(os.path.dirname(__file__), "css", "style.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    marker = "/* SSG static pages */"
    if marker in css:
        return

    additions = f"""
{marker}
.section-lead {{
  font-size: 1rem;
  color: var(--c-text-sub);
  line-height: 1.7;
  margin-bottom: 16px;
}}
.section-count {{
  font-size: .85rem;
  color: var(--c-text-sub);
  margin-bottom: 24px;
}}
.card-name-en {{
  font-size: .8rem;
  font-weight: 400;
  color: var(--c-text-sub);
  margin-left: 4px;
}}
.card-desc-static {{
  font-size: .8rem;
  color: var(--c-text-sub);
  line-height: 1.6;
  margin: 0;
}}
.card-tags-row {{
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}}
.card-tags-row .tag {{
  font-size: .68rem;
  padding: 2px 8px;
}}
.btn-visit-sm, .btn-detail-sm {{
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: .78rem;
  font-weight: 600;
  text-decoration: none;
  transition: background .2s;
}}
.btn-visit-sm {{
  background: var(--c-primary);
  color: #fff;
}}
.btn-visit-sm:hover {{
  background: var(--c-primary-hover, #5a52d5);
  color: #fff;
  text-decoration: none;
}}
.btn-detail-sm {{
  background: var(--c-surface);
  color: var(--c-primary);
  border: 1px solid var(--c-border);
}}
.btn-detail-sm:hover {{
  background: var(--c-tag-bg);
  text-decoration: none;
}}
.category-links-grid {{
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}}
.category-links-grid .tag {{
  padding: 6px 14px;
  font-size: .82rem;
}}
"""
    with open(css_path, "a", encoding="utf-8") as f:
        f.write(additions)
    print("  Added static page CSS to style.css")


# ── Main ─────────────────────────────────────────────────────────────

def main():
    print("=== Static Page Generator for freesozo.com ===\n")

    sites = load_data()
    print(f"Loaded {len(sites)} sites from sites.json")

    # Group by category
    by_cat = {}
    for s in sites:
        cat = s.get("category", "other")
        by_cat.setdefault(cat, []).append(s)

    # Ensure output directory
    out_dir = os.path.join(os.path.dirname(__file__), "category")
    os.makedirs(out_dir, exist_ok=True)

    # Ensure CSS
    ensure_static_css()

    # Generate category pages
    print("\n--- Category Pages ---")
    generated = []
    for cat_id in sorted(CATEGORY_META.keys()):
        cat_sites = by_cat.get(cat_id, [])
        if not cat_sites:
            print(f"  [SKIP] {cat_id} (0 sites)")
            continue

        html = generate_category_page(cat_id, cat_sites)
        filepath = os.path.join(out_dir, f"{cat_id}.html")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  [OK] category/{cat_id}.html ({len(cat_sites)} sites)")
        generated.append(cat_id)

    # Generate individual site pages
    print("\n--- Site Detail Pages ---")
    site_dir = os.path.join(os.path.dirname(__file__), "site")
    os.makedirs(site_dir, exist_ok=True)
    generated_sites = []
    for s in sites:
        sid = s["id"]
        html = generate_site_detail_page(s, sites, by_cat)
        filepath = os.path.join(site_dir, f"{sid}.html")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        generated_sites.append(sid)
    print(f"  [OK] Generated {len(generated_sites)} site detail pages")

    # Generate use-case pages
    print("\n--- Use-Case Pages ---")
    uc_dir = os.path.join(os.path.dirname(__file__), "use-case")
    os.makedirs(uc_dir, exist_ok=True)
    generated_uc = []
    for uc in USE_CASES:
        matched = [s for s in sites if uc["filter"](s)]
        if len(matched) < 3:
            print(f"  [SKIP] {uc['slug']} ({len(matched)} sites - too few)")
            continue
        html = generate_use_case_page(uc, matched)
        filepath = os.path.join(uc_dir, f"{uc['slug']}.html")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  [OK] use-case/{uc['slug']}.html ({len(matched)} sites)")
        generated_uc.append(uc["slug"])

    # Update sitemap
    print("\n--- Sitemap ---")
    update_sitemap(generated, generated_sites, generated_uc)

    print(f"\n=== Done! {len(generated)} categories + {len(generated_sites)} sites + {len(generated_uc)} use-cases ===")


if __name__ == "__main__":
    main()
