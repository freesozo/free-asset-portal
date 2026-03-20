#!/usr/bin/env python3
"""
Blog Article Generator for freesozo.com (Free Asset Portal)
Reads data/sites.json and generates SEO-optimized blog articles into blog/ directory.
Usage: py generate-blog.py
"""

import json
import os
import math
from datetime import date

# ── Config ──────────────────────────────────────────────────────────
BASE_URL = "https://freesozo.com"
SITE_NAME = "フリー素材ポータル"
GA_ID = "G-TW9TKBPSNW"
ADSENSE_PUB = "ca-pub-1060876188767022"
CSS_VERSION = 8
JS_VERSION = 8
GENERATED_DATE = date.today().isoformat()
CURRENT_YEAR = date.today().year

CATEGORY_NAMES = {
    "illustration": ("イラスト", "Illustration"),
    "photo": ("写真", "Photo"),
    "icon": ("アイコン", "Icon"),
    "music": ("音楽", "Music"),
    "archive": ("総合素材", "Archive"),
    "texture": ("テクスチャ・背景", "Texture & Background"),
    "asset": ("ゲーム素材", "Game Asset"),
    "sound": ("効果音", "Sound Effect"),
    "video": ("動画", "Video"),
    "font": ("フォント", "Font"),
    "mockup": ("モックアップ", "Mockup"),
    "3d": ("3Dモデル", "3D Model"),
    "template": ("テンプレート", "Template"),
}

# Mapping from category key to i18n key for blog card tags
CATEGORY_I18N_KEYS = {
    "illustration": "blogCatIllustration",
    "photo": "blogCatPhoto",
    "icon": "blogCatIcon",
    "music": "blogCatMusic",
    "archive": "blogCatArchive",
    "texture": "blogCatTexture",
    "asset": "blogCatAsset",
    "sound": "blogCatSound",
    "video": "blogCatVideo",
    "font": "blogCatFont",
    "mockup": "blogCatMockup",
    "3d": "blogCat3D",
    "template": "blogCatTemplate",
}

FORMAT_NAMES = {
    "png": ("PNG", "写真やイラストの標準形式"),
    "svg": ("SVG", "拡大しても劣化しないベクター形式"),
    "jpg": ("JPG", "写真に最適な圧縮形式"),
    "mp3": ("MP3", "音楽・効果音の標準形式"),
    "mp4": ("MP4", "動画の標準形式"),
    "otf": ("OTF/TTF", "フォントファイル形式"),
}

CATEGORY_EMOJI = {
    "illustration": "🎨", "photo": "📷", "icon": "🔷", "music": "🎵",
    "archive": "📦", "texture": "🖼️", "asset": "🎮", "sound": "🔊",
    "video": "🎬", "font": "🔤", "mockup": "📐", "3d": "🧊", "template": "📄",
}

FEATURE_TITLES_EN = {
    "commercial-use": "Commercial Use OK Free Asset Sites",
    "no-credit": "No Credit Required Free Asset Sites",
    "no-registration": "No Registration Required Free Asset Sites",
    "beginner-friendly": "Beginner Friendly Free Asset Sites",
}

FEATURE_ARTICLES = {
    "commercial-use": {
        "filter_key": "commercial",
        "filter_val": True,
        "title_ja": "商用利用OKのフリー素材サイトまとめ",
        "desc_ja": "商用利用可能な無料素材サイトを厳選。ブログ・YouTube・広告など仕事でも安心して使えるサイトをまとめました。",
        "intro_ja": "フリー素材を仕事や商用プロジェクトで使いたいとき、まず気になるのが「商用利用OK？」という点ですよね。本記事では、商用利用が明確に許可されている無料素材サイトを厳選してご紹介します。ブログ記事、YouTube動画、SNS投稿、プレゼン資料、Web制作など、幅広い用途で安心して使えるサイトばかりです。",
        "conclusion_ja": "商用利用OKのフリー素材サイトを活用すれば、コストを抑えながらプロ品質のコンテンツが作れます。ただし、各サイトの利用規約は変更されることがあるため、利用前に必ず最新の規約を確認してください。",
    },
    "no-credit": {
        "filter_key": "creditRequired",
        "filter_val": False,
        "title_ja": "クレジット表記不要のフリー素材サイトまとめ",
        "desc_ja": "クレジット表記（帰属表示）なしで使える無料素材サイトを厳選。手軽に使える素材をまとめました。",
        "intro_ja": "フリー素材を使う際に「クレジット表記（出典元の記載）」が必要かどうかは、制作物の仕上がりや手間に大きく影響します。本記事では、クレジット表記不要で使える無料素材サイトを集めました。帰属表示の手間がなく、デザインの自由度も高いサイトばかりです。",
        "conclusion_ja": "クレジット表記不要のサイトを使えば、制作物をスッキリ仕上げられます。ただし「不要」であっても、作者への感謝としてクレジットを記載するのは良いマナーです。",
    },
    "no-registration": {
        "filter_key": "registrationRequired",
        "filter_val": False,
        "title_ja": "登録不要で使えるフリー素材サイトまとめ",
        "desc_ja": "会員登録なしですぐに素材をダウンロードできる無料素材サイトを厳選紹介。",
        "intro_ja": "「今すぐ素材が欲しいのにアカウント登録が面倒...」そんな経験はありませんか？本記事では、会員登録なしですぐにダウンロードできるフリー素材サイトをまとめました。メールアドレスの入力もパスワード設定も不要。見つけた素材をその場でダウンロードして使えます。",
        "conclusion_ja": "登録不要のサイトは、スピード重視のプロジェクトに最適です。気に入ったサイトはブックマークしておくと、次回以降さらに時短になります。",
    },
    "beginner-friendly": {
        "filter_key": "beginnerFriendly",
        "filter_val": True,
        "title_ja": "初心者におすすめのフリー素材サイトまとめ",
        "desc_ja": "フリー素材初心者でも安心して使えるサイトを厳選。使いやすさ重視でおすすめを紹介。",
        "intro_ja": "フリー素材を初めて使う方にとって、「どのサイトを使えばいいの？」「本当に無料で商用利用できるの？」といった不安はつきものです。本記事では、初心者でも迷わず使える、操作が簡単でわかりやすいフリー素材サイトを厳選してご紹介します。",
        "conclusion_ja": "まずは本記事で紹介したサイトから試してみてください。使い慣れてきたら、より専門的なサイトにも挑戦してみましょう。",
    },
}


# ── Utilities ───────────────────────────────────────────────────────

def load_sites(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["sites"], data.get("premiumSites", [])


def reading_time(char_count):
    """Japanese reading speed ~400-600 chars/min, use 500."""
    return max(1, math.ceil(char_count / 500))


def badge_html(site):
    badges = []
    if site.get("commercial"):
        badges.append('<span class="blog-badge ok">商用利用OK</span>')
    else:
        badges.append('<span class="blog-badge ng">商用利用NG</span>')
    if not site.get("creditRequired"):
        badges.append('<span class="blog-badge ok">クレジット不要</span>')
    else:
        badges.append('<span class="blog-badge ng">クレジット必要</span>')
    if not site.get("registrationRequired"):
        badges.append('<span class="blog-badge ok">登録不要</span>')
    else:
        badges.append('<span class="blog-badge ng">登録必要</span>')
    if site.get("beginnerFriendly"):
        badges.append('<span class="blog-badge ok">初心者向け</span>')
    return " ".join(badges)


def star_rating(r):
    return "★" * r + "☆" * (5 - r)


def site_card_html(site, idx):
    name_ja = site["name"]["ja"]
    name_en = site["name"]["en"]
    desc_ja = site["description"]["ja"]
    highlight_ja = site["highlight"]["ja"]
    sid = site["id"]
    url = site["url"]
    rating = site.get("rating", 3)
    cat = site.get("category", "")
    cat_ja = CATEGORY_NAMES.get(cat, (cat, cat))[0]
    tags = site.get("tags", [])
    tags_html = " ".join(f'<span class="blog-card-tag">{t}</span>' for t in tags[:5])

    return f'''<div class="blog-site-card" id="site-{sid}">
  <div class="blog-site-header">
    <h3>{idx}. {name_ja}（{name_en}）</h3>
    <span class="blog-site-rating">{star_rating(rating)}</span>
  </div>
  <p class="blog-site-highlight">{highlight_ja}</p>
  <p>{desc_ja}</p>
  <div class="blog-site-badges">{badge_html(site)}</div>
  <div class="blog-site-tags">{tags_html}</div>
  <div class="blog-site-links">
    <a href="../detail.html?id={sid}" class="blog-site-link-internal">詳細を見る</a>
    <a href="{url}" target="_blank" rel="noopener noreferrer" class="blog-site-link-external">公式サイトへ →</a>
  </div>
</div>'''


def comparison_table_html(sites):
    rows = []
    for s in sites:
        name = s["name"]["ja"]
        sid = s["id"]
        commercial = "○" if s.get("commercial") else "×"
        credit = "不要" if not s.get("creditRequired") else "必要"
        reg = "不要" if not s.get("registrationRequired") else "必要"
        rating = star_rating(s.get("rating", 3))
        rows.append(f'    <tr><td><a href="#site-{sid}">{name}</a></td><td>{commercial}</td><td>{credit}</td><td>{reg}</td><td>{rating}</td></tr>')
    rows_str = "\n".join(rows)
    return f'''<div class="blog-comparison-table">
  <table>
    <thead>
      <tr><th>サイト名</th><th>商用利用</th><th>クレジット</th><th>登録</th><th>評価</th></tr>
    </thead>
    <tbody>
{rows_str}
    </tbody>
  </table>
</div>'''


def toc_html(items):
    """items: list of (id, text)"""
    lis = "\n".join(f'    <li><a href="#{item[0]}">{item[1]}</a></li>' for item in items)
    return f'''<nav class="blog-toc">
  <p class="blog-toc-title">目次</p>
  <ol>
{lis}
  </ol>
</nav>'''


def adsense_mid_article():
    return '''<div class="ad-slot ad-slot-blog" style="margin:32px 0;text-align:center;min-height:100px;">
  <!-- Blog Mid-Article Ad -->
</div>'''


def html_template(*, title, description, canonical, breadcrumb_title, content_html, schema_json, article_date=GENERATED_DATE):
    return f'''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} – {SITE_NAME}</title>
  <meta name="description" content="{description}">
  <meta name="author" content="{SITE_NAME}">
  <meta name="theme-color" content="#6c63ff">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:image" content="{BASE_URL}/og-image.png">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="ja" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{canonical}?lang=en">
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
  <script>(function(){{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;}})();</script>
  <link rel="stylesheet" href="../css/style.css?v={CSS_VERSION}">
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', '{GA_ID}');
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={ADSENSE_PUB}" crossorigin="anonymous"></script>
  <!-- JSON-LD -->
  <script type="application/ld+json">
{schema_json}
  </script>
</head>
<body>

  <!-- ===== Header ===== -->
  <header class="site-header">
    <div class="container header-inner">
      <div class="site-logo">
        <a href="../index.html">📦 <span data-i18n="siteTitle">{SITE_NAME}</span></a>
      </div>
      <nav class="header-nav">
        <a href="../index.html" data-i18n="breadcrumbHome">ホーム</a>
        <a href="../index.html#categoryNav" data-i18n="categoryHeading">カテゴリ</a>
        <a href="index.html" data-i18n="navBlog">ブログ</a>
      </nav>
      <div class="header-actions">
        <button class="theme-btn" id="themeBtn" aria-label="Toggle theme">🌙</button>
        <button class="lang-btn" id="langBtn" data-i18n="lang">🌐 English</button>
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Menu">☰</button>
      </div>
    </div>
  </header>
  <nav class="mobile-nav" id="mobileNav">
    <a href="../index.html" data-i18n="breadcrumbHome">ホーム</a>
    <a href="../index.html#categoryNav" data-i18n="categoryHeading">カテゴリ</a>
    <a href="index.html" data-i18n="navBlog">ブログ</a>
  </nav>

  <main class="container">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="../index.html" data-i18n="breadcrumbHome">ホーム</a>
      <span aria-hidden="true">›</span>
      <a href="index.html" data-i18n="navBlog">ブログ</a>
      <span aria-hidden="true">›</span>
      <span>{breadcrumb_title}</span>
    </nav>

    <article class="blog-article">
{content_html}
    </article>
  </main>

  <!-- Sister Site Banner -->
  <section class="sister-banner">
    <div class="container">
      <p><span data-i18n="sisterBannerPrefix">🔧 ビジネスツールを探すなら →</span> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener"><strong data-i18n="sisterBannerName">おすすめツール比較ナビ</strong></a> <span data-i18n="sisterBannerSuffix">- 100以上のツールを徹底比較</span></p>
    </div>
  </section>

  <!-- ===== Footer ===== -->
  <footer class="site-footer">
    <div class="container">
      <p data-i18n="footerNotice">※ 各サイトの利用規約は変更される場合があります。素材利用前に必ず各サイトの最新の利用規約をご確認ください。</p>
      <p class="affiliate-disclosure" data-i18n="affiliateDisclosure">※ 一部リンクはアフィリエイトリンクを含みます。サイト運営のサポートにご協力ください。</p>
      <p class="footer-links">
        <a href="../privacy.html" data-i18n="privacyPolicy">プライバシーポリシー</a>
        <span style="margin:0 8px;">|</span>
        <a href="../about.html" data-i18n="aboutNav">サイトについて</a>
        <span style="margin:0 8px;">|</span>
        <a href="index.html" data-i18n="navBlog">ブログ</a>
      </p>
      <p class="sister-site"><span data-i18n="footerSister">姉妹サイト:</span> <a href="https://tools.freesozo.com/" target="_blank" rel="noopener" data-i18n="footerSisterName">おすすめツール比較ナビ</a></p>
    </div>
  </footer>

  <!-- Back to Top -->
  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>

  <script src="../js/i18n.js?v={JS_VERSION}"></script>
  <script src="../js/app.js?v={JS_VERSION}"></script>
  <script>
    // Minimal init for blog pages (theme toggle, lang toggle, back-to-top)
    if(typeof App!=='undefined' && App.init) try{{ App.init(); }}catch(e){{}}
    // Lang toggle fallback
    document.getElementById('langBtn')?.addEventListener('click',function(){{
      I18n.toggle();
    }});
    // Theme toggle fallback
    document.getElementById('themeBtn')?.addEventListener('click',function(){{
      var t=document.documentElement.dataset.theme==='dark'?'light':'dark';
      document.documentElement.dataset.theme=t;
      localStorage.setItem('theme',t);
      this.textContent=t==='dark'?'☀️':'🌙';
    }});
    // Back to top
    var btt=document.getElementById('backToTop');
    if(btt){{window.addEventListener('scroll',function(){{btt.classList.toggle('visible',window.scrollY>400);}});btt.addEventListener('click',function(){{window.scrollTo({{top:0,behavior:'smooth'}});}});}}
    // Hamburger
    var hb=document.getElementById('hamburgerBtn'),mn=document.getElementById('mobileNav');
    if(hb&&mn){{hb.addEventListener('click',function(){{mn.classList.toggle('open');}});}}
  </script>
</body>
</html>'''


def article_schema(title, description, canonical, date_str):
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "url": canonical,
        "datePublished": date_str,
        "dateModified": date_str,
        "author": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": BASE_URL
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": BASE_URL
        },
        "mainEntityOfPage": canonical,
        "image": f"{BASE_URL}/og-image.png"
    }
    return json.dumps(schema, ensure_ascii=False, indent=2)


# ── Article Generators ──────────────────────────────────────────────

def generate_category_article(cat_key, sites):
    """Generate a category roundup article."""
    cat_ja, cat_en = CATEGORY_NAMES[cat_key]
    emoji = CATEGORY_EMOJI.get(cat_key, "📁")
    filtered = sorted([s for s in sites if s["category"] == cat_key], key=lambda s: -s.get("rating", 0))
    n = len(filtered)
    filename = f"{cat_key}-free-sites.html"
    title = f"【{CURRENT_YEAR}年版】おすすめの{cat_ja}フリー素材サイト{n}選｜商用利用OK"
    desc = f"{cat_ja}のフリー素材サイトを{n}件厳選。商用利用OK・クレジット不要などの条件で比較。{CURRENT_YEAR}年最新版。"
    canonical = f"{BASE_URL}/blog/{filename}"
    breadcrumb = f"{cat_ja}フリー素材サイト{n}選"

    # TOC
    toc_items = [
        ("comparison", f"{cat_ja}フリー素材サイト比較表"),
    ]
    for i, s in enumerate(filtered, 1):
        toc_items.append((f"site-{s['id']}", f"{i}. {s['name']['ja']}"))
    toc_items.append(("conclusion", "まとめ"))

    # Build content
    content_parts = []
    content_parts.append(f'      <h1>{emoji} {title}</h1>')
    content_parts.append(f'      <div class="blog-meta">')
    content_parts.append(f'        <span class="article-updated">更新日: {GENERATED_DATE}</span>')
    content_parts.append(f'        <span class="blog-meta-cat">{cat_ja}</span>')
    content_parts.append(f'        <span class="blog-meta-count">{n}サイトを比較</span>')
    content_parts.append(f'      </div>')
    content_parts.append(f'')
    content_parts.append(toc_html(toc_items))
    content_parts.append(f'')
    content_parts.append(f'      <section id="intro">')
    content_parts.append(f'        <p>{cat_ja}のフリー素材をお探しですか？本記事では、{CURRENT_YEAR}年現在利用できる{cat_ja}のフリー素材サイトを{n}件厳選してご紹介します。すべて無料で利用でき、商用利用可能なサイトも多数含まれています。</p>')
    content_parts.append(f'        <p>各サイトの特徴・商用利用の可否・クレジット表記の要否・会員登録の必要性を一覧表でまとめましたので、目的に合ったサイトをすぐに見つけることができます。</p>')
    content_parts.append(f'      </section>')
    content_parts.append(f'')

    # Comparison table
    content_parts.append(f'      <h2 id="comparison">{cat_ja}フリー素材サイト比較表</h2>')
    content_parts.append(comparison_table_html(filtered))
    content_parts.append(f'')

    # Ad slot mid
    content_parts.append(adsense_mid_article())
    content_parts.append(f'')

    # Individual site cards
    content_parts.append(f'      <h2>各サイトの詳細</h2>')
    for i, s in enumerate(filtered, 1):
        content_parts.append(site_card_html(s, i))
        # Insert another ad after every 8 sites
        if i % 8 == 0 and i < n:
            content_parts.append(adsense_mid_article())

    content_parts.append(f'')
    content_parts.append(f'      <h2 id="conclusion">まとめ</h2>')
    content_parts.append(f'      <p>{CURRENT_YEAR}年におすすめの{cat_ja}フリー素材サイトを{n}件ご紹介しました。どのサイトも高品質な素材を無料で提供しており、個人利用はもちろん商用利用にも対応しているサイトが多数あります。</p>')
    content_parts.append(f'      <p>まずは気になるサイトをいくつか試してみて、自分のプロジェクトに合ったサイトを見つけてください。各サイトの利用規約は変更される場合がありますので、利用前に必ず最新の規約を確認することをおすすめします。</p>')
    content_parts.append(f'      <p class="blog-back"><a href="index.html" data-i18n="blogBack">← ブログ記事一覧に戻る</a></p>')

    content_html = "\n".join(content_parts)
    schema = article_schema(title, desc, canonical, GENERATED_DATE)

    i18n_tag_key = CATEGORY_I18N_KEYS.get(cat_key, "")
    cat_en = CATEGORY_NAMES[cat_key][1]
    title_en = f"Best {n} Free {cat_en} Sites [{CURRENT_YEAR}] - Commercial OK"
    desc_en = f"Curated {n} free {cat_en.lower()} sites. Compare commercial use, credit requirements and more."
    return filename, html_template(
        title=title, description=desc, canonical=canonical,
        breadcrumb_title=breadcrumb, content_html=content_html,
        schema_json=schema
    ), title, desc, cat_ja, n, i18n_tag_key, title_en, desc_en


def generate_feature_article(key, config, sites):
    """Generate a feature-based article."""
    fkey = config["filter_key"]
    fval = config["filter_val"]
    filtered = sorted([s for s in sites if s.get(fkey) == fval], key=lambda s: -s.get("rating", 0))
    n = len(filtered)
    filename = f"{key}-free-sites.html"
    title = f"【{CURRENT_YEAR}年版】{config['title_ja']}（{n}選）"
    desc = config["desc_ja"]
    canonical = f"{BASE_URL}/blog/{filename}"
    breadcrumb = config["title_ja"]

    # TOC
    toc_items = [
        ("intro", "はじめに"),
        ("comparison", "比較表"),
    ]
    for i, s in enumerate(filtered[:20], 1):
        toc_items.append((f"site-{s['id']}", f"{i}. {s['name']['ja']}"))
    if n > 20:
        toc_items.append(("more", f"その他のサイト（{n-20}件）"))
    toc_items.append(("conclusion", "まとめ"))

    content_parts = []
    content_parts.append(f'      <h1>{title}</h1>')
    content_parts.append(f'      <div class="blog-meta">')
    content_parts.append(f'        <span class="article-updated">更新日: {GENERATED_DATE}</span>')
    content_parts.append(f'        <span class="blog-meta-count">{n}サイトを比較</span>')
    content_parts.append(f'      </div>')
    content_parts.append(f'')
    content_parts.append(toc_html(toc_items))
    content_parts.append(f'')

    content_parts.append(f'      <h2 id="intro">はじめに</h2>')
    content_parts.append(f'      <p>{config["intro_ja"]}</p>')
    content_parts.append(f'')

    # Comparison table (top 20)
    content_parts.append(f'      <h2 id="comparison">比較表</h2>')
    content_parts.append(comparison_table_html(filtered[:20]))
    content_parts.append(f'')

    content_parts.append(adsense_mid_article())
    content_parts.append(f'')

    # Individual cards (top 20)
    content_parts.append(f'      <h2>各サイトの詳細</h2>')
    for i, s in enumerate(filtered[:20], 1):
        content_parts.append(site_card_html(s, i))
        if i % 8 == 0 and i < min(n, 20):
            content_parts.append(adsense_mid_article())

    if n > 20:
        content_parts.append(f'      <h2 id="more">その他のサイト（{n-20}件）</h2>')
        content_parts.append(f'      <p>以下のサイトも条件に該当します。</p>')
        content_parts.append(f'      <ul class="blog-more-list">')
        for s in filtered[20:]:
            content_parts.append(f'        <li><a href="../detail.html?id={s["id"]}">{s["name"]["ja"]}</a> – {s["description"]["ja"][:40]}...</li>')
        content_parts.append(f'      </ul>')

    content_parts.append(f'')
    content_parts.append(f'      <h2 id="conclusion">まとめ</h2>')
    content_parts.append(f'      <p>{config["conclusion_ja"]}</p>')
    content_parts.append(f'      <p class="blog-back"><a href="index.html" data-i18n="blogBack">← ブログ記事一覧に戻る</a></p>')

    content_html = "\n".join(content_parts)
    schema = article_schema(title, desc, canonical, GENERATED_DATE)

    return filename, html_template(
        title=title, description=desc, canonical=canonical,
        breadcrumb_title=breadcrumb, content_html=content_html,
        schema_json=schema
    ), title, desc, "特集", n, "blogCatFeature", \
       f"[{CURRENT_YEAR}] {FEATURE_TITLES_EN.get(key, key)} ({n} Sites)", \
       f"Curated free asset sites filtered by key criteria. {n} sites listed."


def generate_format_article(fmt_key, sites):
    """Generate a format-based article."""
    fmt_name, fmt_desc = FORMAT_NAMES[fmt_key]
    # For otf, match both otf and ttf
    if fmt_key == "otf":
        filtered = sorted([s for s in sites if "otf" in s.get("tags", []) or "ttf" in s.get("tags", [])], key=lambda s: -s.get("rating", 0))
    else:
        filtered = sorted([s for s in sites if fmt_key in s.get("tags", [])], key=lambda s: -s.get("rating", 0))
    n = len(filtered)

    if n == 0:
        return None

    filename = f"{fmt_key}-free-sites.html"
    title = f"【{CURRENT_YEAR}年版】{fmt_name}形式でダウンロードできるフリー素材サイトまとめ（{n}選）"
    desc = f"{fmt_name}（{fmt_desc}）形式の素材をダウンロードできるフリー素材サイトを{n}件紹介。商用利用OKのサイトも多数。"
    canonical = f"{BASE_URL}/blog/{filename}"
    breadcrumb = f"{fmt_name}形式の素材サイト"

    # TOC
    toc_items = [
        ("about-format", f"{fmt_name}形式とは"),
        ("comparison", "比較表"),
    ]
    show_count = min(n, 20)
    for i, s in enumerate(filtered[:show_count], 1):
        toc_items.append((f"site-{s['id']}", f"{i}. {s['name']['ja']}"))
    toc_items.append(("conclusion", "まとめ"))

    content_parts = []
    content_parts.append(f'      <h1>{title}</h1>')
    content_parts.append(f'      <div class="blog-meta">')
    content_parts.append(f'        <span class="article-updated">更新日: {GENERATED_DATE}</span>')
    content_parts.append(f'        <span class="blog-meta-count">{n}サイトを比較</span>')
    content_parts.append(f'      </div>')
    content_parts.append(f'')
    content_parts.append(toc_html(toc_items))
    content_parts.append(f'')

    content_parts.append(f'      <h2 id="about-format">{fmt_name}形式とは</h2>')
    content_parts.append(f'      <p>{fmt_name}は{fmt_desc}です。多くのフリー素材サイトで採用されており、幅広い用途で利用されています。本記事では、{fmt_name}形式の素材をダウンロードできるフリー素材サイトを{n}件ご紹介します。</p>')
    content_parts.append(f'')

    content_parts.append(f'      <h2 id="comparison">比較表</h2>')
    content_parts.append(comparison_table_html(filtered[:show_count]))
    content_parts.append(f'')

    content_parts.append(adsense_mid_article())
    content_parts.append(f'')

    content_parts.append(f'      <h2>各サイトの詳細</h2>')
    for i, s in enumerate(filtered[:show_count], 1):
        content_parts.append(site_card_html(s, i))
        if i % 8 == 0 and i < show_count:
            content_parts.append(adsense_mid_article())

    if n > 20:
        content_parts.append(f'      <h3>その他のサイト</h3>')
        content_parts.append(f'      <ul class="blog-more-list">')
        for s in filtered[20:]:
            content_parts.append(f'        <li><a href="../detail.html?id={s["id"]}">{s["name"]["ja"]}</a></li>')
        content_parts.append(f'      </ul>')

    content_parts.append(f'')
    content_parts.append(f'      <h2 id="conclusion">まとめ</h2>')
    content_parts.append(f'      <p>{fmt_name}形式の素材を提供するフリー素材サイトを{n}件ご紹介しました。目的やプロジェクトに合ったサイトを選んで、クオリティの高い素材を活用してください。各サイトの利用規約は変更される場合がありますので、利用前に必ず確認してください。</p>')
    content_parts.append(f'      <p class="blog-back"><a href="index.html" data-i18n="blogBack">← ブログ記事一覧に戻る</a></p>')

    content_html = "\n".join(content_parts)
    schema = article_schema(title, desc, canonical, GENERATED_DATE)

    return filename, html_template(
        title=title, description=desc, canonical=canonical,
        breadcrumb_title=breadcrumb, content_html=content_html,
        schema_json=schema
    ), title, desc, fmt_name, n, "", \
       f"[{CURRENT_YEAR}] {fmt_name} Format Free Asset Sites ({n} Sites)", \
       f"Free asset sites offering {fmt_name} format downloads. {n} sites with commercial use options."


def generate_ranking_article(sites):
    """Generate top ranking article."""
    top = sorted(sites, key=lambda s: (-s.get("rating", 0), s["name"]["ja"]))[:20]
    n = 20
    filename = "best-free-sites-ranking.html"
    title = f"【{CURRENT_YEAR}年版】フリー素材サイトおすすめランキングTOP{n}"
    desc = f"{CURRENT_YEAR}年最新版。本当に使えるフリー素材サイトをランキング形式でTOP{n}を発表。商用利用OK・クレジット不要のサイトも多数。"
    canonical = f"{BASE_URL}/blog/{filename}"
    breadcrumb = f"おすすめランキングTOP{n}"

    toc_items = []
    for i, s in enumerate(top, 1):
        toc_items.append((f"site-{s['id']}", f"第{i}位 {s['name']['ja']}"))
    toc_items.append(("conclusion", "まとめ"))

    content_parts = []
    content_parts.append(f'      <h1>🏆 {title}</h1>')
    content_parts.append(f'      <div class="blog-meta">')
    content_parts.append(f'        <span class="article-updated">更新日: {GENERATED_DATE}</span>')
    content_parts.append(f'        <span class="blog-meta-count">TOP{n}を厳選</span>')
    content_parts.append(f'      </div>')
    content_parts.append(f'')
    content_parts.append(toc_html(toc_items))
    content_parts.append(f'')

    content_parts.append(f'      <p>数あるフリー素材サイトの中から、素材の品質・使いやすさ・商用利用のしやすさ・種類の豊富さなどを総合的に評価し、{CURRENT_YEAR}年版おすすめランキングTOP{n}を選出しました。</p>')
    content_parts.append(f'      <p>どのサイトから使い始めればいいか迷っている方は、まずこのランキング上位のサイトから試してみてください。</p>')
    content_parts.append(f'')

    content_parts.append(comparison_table_html(top))
    content_parts.append(f'')

    content_parts.append(adsense_mid_article())
    content_parts.append(f'')

    for i, s in enumerate(top, 1):
        rank_label = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"第{i}位"
        name_ja = s["name"]["ja"]
        name_en = s["name"]["en"]
        desc_ja = s["description"]["ja"]
        highlight_ja = s["highlight"]["ja"]
        sid = s["id"]
        url = s["url"]
        rating = s.get("rating", 3)
        tags_html = " ".join(f'<span class="blog-card-tag">{t}</span>' for t in s.get("tags", [])[:5])

        content_parts.append(f'''<div class="blog-site-card" id="site-{sid}">
  <div class="blog-site-header">
    <h3>{rank_label} {name_ja}（{name_en}）</h3>
    <span class="blog-site-rating">{star_rating(rating)}</span>
  </div>
  <p class="blog-site-highlight">{highlight_ja}</p>
  <p>{desc_ja}</p>
  <div class="blog-site-badges">{badge_html(s)}</div>
  <div class="blog-site-tags">{tags_html}</div>
  <div class="blog-site-links">
    <a href="../detail.html?id={sid}" class="blog-site-link-internal">詳細を見る</a>
    <a href="{url}" target="_blank" rel="noopener noreferrer" class="blog-site-link-external">公式サイトへ →</a>
  </div>
</div>''')
        if i % 8 == 0 and i < n:
            content_parts.append(adsense_mid_article())

    content_parts.append(f'')
    content_parts.append(f'      <h2 id="conclusion">まとめ</h2>')
    content_parts.append(f'      <p>{CURRENT_YEAR}年おすすめのフリー素材サイトTOP{n}をご紹介しました。ランキング上位のサイトは、品質・使いやすさ・ライセンスの分かりやすさのすべてが優れています。</p>')
    content_parts.append(f'      <p>まずは1位から順に試してみて、自分のワークフローに合ったサイトを見つけてください。複数のサイトを併用することで、より多彩な素材を活用できます。</p>')
    content_parts.append(f'      <p class="blog-back"><a href="index.html" data-i18n="blogBack">← ブログ記事一覧に戻る</a></p>')

    content_html = "\n".join(content_parts)
    schema = article_schema(title, desc, canonical, GENERATED_DATE)

    return filename, html_template(
        title=title, description=desc, canonical=canonical,
        breadcrumb_title=breadcrumb, content_html=content_html,
        schema_json=schema
    ), title, desc, "ランキング", n, "blogCatRanking", \
       f"[{CURRENT_YEAR}] Top {n} Free Asset Sites Ranking", \
       f"Top {n} free asset sites ranked by quality, usability and licensing."


def generate_blog_index(articles):
    """Generate the blog index page with article cards."""
    title = "ブログ – フリー素材の選び方・比較記事"
    desc = "フリー素材サイトの比較記事、カテゴリ別まとめ、形式別ガイドなど。最適な素材サイトを見つけるための情報をお届けします。"
    canonical = f"{BASE_URL}/blog/"

    schema_data = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": title,
        "description": desc,
        "url": canonical,
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": BASE_URL
        }
    }
    schema_json = json.dumps(schema_data, ensure_ascii=False, indent=2)

    # Build index page with its own template (no breadcrumb trail ending)
    def _esc(s):
        """Escape for HTML attribute."""
        return s.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')

    cards_html = []
    for art in articles:
        fname, atitle, adesc, cat_label, count, i18n_tag_key, atitle_en, adesc_en = art
        tag_attr = f' data-i18n="{i18n_tag_key}"' if i18n_tag_key else ''
        cards_html.append(f'''      <a href="{fname}" class="blog-card">
        <div class="blog-card-tag"{tag_attr}>{cat_label}</div>
        <h3 class="blog-card-title" data-i18n-ja="{_esc(atitle)}" data-i18n-en="{_esc(atitle_en)}">{atitle}</h3>
        <p class="blog-card-excerpt" data-i18n-ja="{_esc(adesc[:80])}..." data-i18n-en="{_esc(adesc_en[:80])}...">{adesc[:80]}...</p>
        <div class="blog-card-meta">{count} <span data-i18n="blogSitesCount">サイト掲載</span> | {GENERATED_DATE}</div>
      </a>''')

    cards_str = "\n".join(cards_html)

    # Original articles (manually written, in blog/articles/)
    original_articles = [
        {
            "href": "articles/free-font-guide-2026.html",
            "tag": "フォント",
            "tag_i18n": "blogFontGuideTag",
            "title": "【2026年最新】商用利用OKの無料フォント30選｜デザイナーが本当に使うおすすめフリーフォント",
            "title_i18n": "blogFontGuideTitle",
            "excerpt": "プロのデザイナーが実際の制作現場で使っている、商用利用可能な無料フォントを30個厳選。ゴシック体・明朝体・手書き風・欧文まで、ジャンル別に特徴と使いどころを解説。",
            "excerpt_i18n": "blogFontGuideExcerpt",
            "meta": "30選 | 2026-03-16 | 約15分",
            "meta_i18n": "blogFontGuideMeta",
        },
        {
            "href": "articles/server-comparison-creators.html",
            "tag": "サーバー",
            "tag_i18n": "blogServerTag",
            "title": "クリエイター向けレンタルサーバー比較｜ポートフォリオサイトに最適なのは？",
            "title_i18n": "blogServerTitle",
            "excerpt": "イラストレーター・デザイナー・写真家がポートフォリオサイトを作るなら、どのレンタルサーバーが最適？5社を実際のクリエイター目線で徹底比較。料金・速度・WordPress対応を解説。",
            "excerpt_i18n": "blogServerExcerpt",
            "meta": "5社比較 | 2026-03-16 | 約10分",
            "meta_i18n": "blogServerMeta",
        },
        {
            "href": "articles/free-3d-model-beginners.html",
            "tag": "3Dモデル",
            "tag_i18n": "blog3DTag",
            "title": "【初心者向け】無料3Dモデルの始め方ガイド｜ダウンロードから商用利用の注意点まで",
            "title_i18n": "blog3DTitle",
            "excerpt": "3DCGに興味があるけど何から始めればいい？無料3Dモデルのダウンロード方法、ライセンスの見分け方、おすすめソフト（Blender）との連携まで、初心者向けに丁寧に解説。",
            "excerpt_i18n": "blog3DExcerpt",
            "meta": "初心者ガイド | 2026-03-16 | 約12分",
            "meta_i18n": "blog3DMeta",
        },
        {
            "href": "articles/vpn-why-creators-need.html",
            "tag": "セキュリティ",
            "tag_i18n": "blogVPNTag",
            "title": "クリエイターにVPNが必要な5つの理由｜海外素材サイトへの安全なアクセス方法",
            "title_i18n": "blogVPNTitle",
            "excerpt": "海外のフリー素材サイトを使うとき、VPNは必要？セキュリティリスクから身を守りながら、世界中の素材にアクセスする方法を解説。おすすめVPNの選び方も紹介。",
            "excerpt_i18n": "blogVPNExcerpt",
            "meta": "5つの理由 | 2026-03-16 | 約8分",
            "meta_i18n": "blogVPNMeta",
        },
        {
            "href": "articles/ai-tools-free-vs-paid.html",
            "tag": "AIツール",
            "tag_i18n": "blogAITag",
            "title": "無料で使えるAIツール vs 有料プラン｜クリエイターが課金すべきタイミングとは",
            "title_i18n": "blogAITitle",
            "excerpt": "ChatGPT、Midjourney、Canva、Adobe Firefly…無料プランで十分なケースと、有料プランに切り替えるべきタイミングを具体的なユースケースで解説。",
            "excerpt_i18n": "blogAIExcerpt",
            "meta": "無料vs有料 | 2026-03-16 | 約10分",
            "meta_i18n": "blogAIMeta",
        },
        {
            "href": "articles/unsplash-review.html",
            "tag": "写真素材",
            "tag_i18n": "blogUnsplashTag",
            "title": "Unsplashを1ヶ月使ってわかった｜商用利用の注意点と本当に使える写真の探し方",
            "title_i18n": "blogUnsplashTitle",
            "excerpt": "Unsplashを1ヶ月間実際に使い込んだ体験レポート。検索のコツ、商用利用の注意点、Pexels・Pixabayとの違いを正直にレビュー。",
            "excerpt_i18n": "blogUnsplashExcerpt",
            "meta": "体験レビュー | 2026-03-20 | 約15分",
            "meta_i18n": "blogUnsplashMeta",
        },
        {
            "href": "articles/blender-3d-model-review.html",
            "tag": "3Dモデル",
            "tag_i18n": "blogBlenderTag",
            "title": "Blenderで無料3Dモデルを使ってみた｜初心者が最初の作品を完成させるまで",
            "title_i18n": "blogBlenderTitle",
            "excerpt": "Blender初心者が無料3Dモデルをダウンロードし、簡単なシーンを完成させるまでの体験記。つまずきポイントも正直に紹介。",
            "excerpt_i18n": "blogBlenderExcerpt",
            "meta": "体験レビュー | 2026-03-20 | 約18分",
            "meta_i18n": "blogBlenderMeta",
        },
        {
            "href": "articles/font-license-mistake.html",
            "tag": "フォント",
            "tag_i18n": "blogFontMistakeTag",
            "title": "無料フォント選びで失敗した話｜ライセンス違反に気づかず使ってしまった体験談",
            "title_i18n": "blogFontMistakeTitle",
            "excerpt": "「商用利用OK」と思って使ったフリーフォントが実は条件付きだった。ライセンス違反の体験談から学ぶ安全な選び方。",
            "excerpt_i18n": "blogFontMistakeExcerpt",
            "meta": "体験レビュー | 2026-03-20 | 約15分",
            "meta_i18n": "blogFontMistakeMeta",
        },
    ]

    original_cards = []
    for oa in original_articles:
        original_cards.append(f'''      <a href="{oa["href"]}" class="blog-card">
        <div class="blog-card-tag" data-i18n="{oa["tag_i18n"]}">{oa["tag"]}</div>
        <h3 class="blog-card-title" data-i18n="{oa["title_i18n"]}">{oa["title"]}</h3>
        <p class="blog-card-excerpt" data-i18n="{oa["excerpt_i18n"]}">{oa["excerpt"]}</p>
        <div class="blog-card-meta" data-i18n="{oa["meta_i18n"]}">{oa["meta"]}</div>
      </a>''')

    total_articles = len(articles) + len(original_articles)

    content_html = f'''      <h1 data-i18n="blogTitle">ブログ – フリー素材の選び方・比較記事</h1>
      <div class="blog-meta">
        <span class="article-updated"><span data-i18n="blogUpdatedLabel">更新日:</span> {GENERATED_DATE}</span>
        <span class="blog-meta-count">{total_articles} <span data-i18n="blogArticlesCount">記事</span></span>
      </div>
      <p data-i18n="blogDesc">フリー素材サイトのカテゴリ別まとめ、特徴別比較、形式別ガイドなど、最適な素材サイトを見つけるための記事を掲載しています。</p>

      <h2 data-i18n="blogSectionGuide">クリエイター向けガイド</h2>
      <div class="blog-card-grid">
{chr(10).join(original_cards)}
      </div>

      <h2 data-i18n="blogSectionCategory">カテゴリ別まとめ</h2>
      <div class="blog-card-grid">
{chr(10).join(c for c, a in zip(cards_html, articles) if a[3] != "特集" and a[3] != "ランキング" and not any(a[3] == f[0] for f in FORMAT_NAMES.values()))}
      </div>

      <h2 data-i18n="blogSectionFeature">特集記事</h2>
      <div class="blog-card-grid">
{chr(10).join(c for c, a in zip(cards_html, articles) if a[3] == "特集" or a[3] == "ランキング")}
      </div>

      <h2 data-i18n="blogSectionFormat">形式別まとめ</h2>
      <div class="blog-card-grid">
{chr(10).join(c for c, a in zip(cards_html, articles) if any(a[3] == f[0] for f in FORMAT_NAMES.values()))}
      </div>'''

    return "index.html", html_template(
        title=title, description=desc, canonical=canonical,
        breadcrumb_title="ブログ", content_html=content_html,
        schema_json=schema_json
    ).replace(
        # Fix breadcrumb for index page (remove trailing "ブログ ›" in breadcrumb)
        '''      <a href="index.html" data-i18n="navBlog">ブログ</a>
      <span aria-hidden="true">›</span>
      <span>ブログ</span>''',
        '      <span data-i18n="navBlog">ブログ</span>'
    )


# ── Main ────────────────────────────────────────────────────────────

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "data", "sites.json")
    blog_dir = os.path.join(base_dir, "blog")

    os.makedirs(blog_dir, exist_ok=True)

    sites, premium = load_sites(json_path)
    print(f"Loaded {len(sites)} sites, {len(premium)} premium sites")

    articles = []  # (filename, title, desc, cat_label, count, i18n_key, title_en, desc_en)

    # 1. Category roundups (13 articles)
    print("\n--- Category Roundups ---")
    for cat_key in CATEGORY_NAMES:
        fname, html, title, desc, cat_label, count, i18n_key, title_en, desc_en = generate_category_article(cat_key, sites)
        out_path = os.path.join(blog_dir, fname)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        articles.append((fname, title, desc, cat_label, count, i18n_key, title_en, desc_en))
        print(f"  [OK] {fname} ({count} sites)")

    # 2. Feature-based articles (4 articles)
    print("\n--- Feature Articles ---")
    for key, config in FEATURE_ARTICLES.items():
        fname, html, title, desc, cat_label, count, i18n_key, title_en, desc_en = generate_feature_article(key, config, sites)
        out_path = os.path.join(blog_dir, fname)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        articles.append((fname, title, desc, cat_label, count, i18n_key, title_en, desc_en))
        print(f"  [OK] {fname} ({count} sites)")

    # 3. Format-based articles (6 articles)
    print("\n--- Format Articles ---")
    for fmt_key in FORMAT_NAMES:
        result = generate_format_article(fmt_key, sites)
        if result is None:
            print(f"  [SKIP] {fmt_key} (0 sites)")
            continue
        fname, html, title, desc, cat_label, count, i18n_key, title_en, desc_en = result
        out_path = os.path.join(blog_dir, fname)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)
        articles.append((fname, title, desc, cat_label, count, i18n_key, title_en, desc_en))
        print(f"  [OK] {fname} ({count} sites)")

    # 4. Ranking article (1 article)
    print("\n--- Ranking Article ---")
    fname, html, title, desc, cat_label, count, i18n_key, title_en, desc_en = generate_ranking_article(sites)
    out_path = os.path.join(blog_dir, fname)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    articles.append((fname, title, desc, cat_label, count, i18n_key, title_en, desc_en))
    print(f"  [OK] {fname} (TOP {count})")

    # 5. Blog index page
    print("\n--- Blog Index ---")
    fname, html = generate_blog_index(articles)
    out_path = os.path.join(blog_dir, fname)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  [OK] {fname} ({len(articles)} articles)")

    print(f"\n=== Done! Generated {len(articles)} articles + 1 index in blog/ ===")
    return articles


if __name__ == "__main__":
    main()
