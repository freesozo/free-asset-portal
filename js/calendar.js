(function() {
  let sitesData = [];

  const MONTH_COLORS = {
    1: "#c4a882", 2: "#d4707a", 3: "#f0b7c8", 4: "#7db87d",
    5: "#5ba55b", 6: "#7b8fb2", 7: "#2e86de", 8: "#e67e22",
    9: "#b07840", 10: "#e17055", 11: "#c0392b", 12: "#2c3e50"
  };

  const MONTHLY_THEMES = {
    1: {
      month: "1月", theme: "年賀状・冬景色",
      description: "年賀状デザイン、冬の風景写真、お正月イラストが人気の季節",
      keywords: ["年賀状", "冬", "お正月", "雪", "新年"],
      recommendedCategories: ["illustration", "photo", "template", "font"],
      featuredSites: [
        { id: "irasutoya", reason: "お正月イラストが豊富" },
        { id: "unsplash", reason: "冬景色の高品質写真" },
        { id: "google-fonts", reason: "年賀状向け日本語フォント" }
      ],
      tips: "年賀状デザインは11月から準備開始がおすすめ。商用利用する場合はライセンスに注意。"
    },
    2: {
      month: "2月", theme: "バレンタイン・梅",
      description: "バレンタインデザイン、ハート素材、梅の花の季節",
      keywords: ["バレンタイン", "ハート", "梅", "春の始まり"],
      recommendedCategories: ["illustration", "icon", "photo"],
      featuredSites: [],
      tips: "バレンタイン素材は1月後半から需要が急増。早めに素材を確保しましょう。"
    },
    3: {
      month: "3月", theme: "卒業・春・桜",
      description: "卒業式、春の訪れ、桜の素材が需要ピークの月",
      keywords: ["卒業", "春", "桜", "新生活", "ひな祭り"],
      recommendedCategories: ["photo", "illustration", "template"],
      featuredSites: [],
      tips: "桜の写真は期間限定。Unsplashやぱくたそで高品質な桜写真が見つかります。"
    },
    4: {
      month: "4月", theme: "新生活・入学・花",
      description: "入学式、新社会人、花の素材が活躍する季節",
      keywords: ["入学", "新生活", "花", "春", "フレッシュ"],
      recommendedCategories: ["photo", "illustration", "template", "font"],
      featuredSites: [],
      tips: "ビジネス向けテンプレートの需要が高まる時期。プレゼン資材も要チェック。"
    },
    5: {
      month: "5月", theme: "こどもの日・新緑",
      description: "こどもの日、母の日、新緑の素材が人気",
      keywords: ["こどもの日", "母の日", "新緑", "GW"],
      recommendedCategories: ["illustration", "photo"],
      featuredSites: [],
      tips: "母の日のカード素材は4月中旬から準備を。花束やカーネーションのイラストが定番。"
    },
    6: {
      month: "6月", theme: "梅雨・あじさい・ジューンブライド",
      description: "雨、あじさい、結婚式関連の素材需要",
      keywords: ["梅雨", "あじさい", "結婚式", "雨", "傘"],
      recommendedCategories: ["photo", "illustration", "template"],
      featuredSites: [],
      tips: "ウェディング関連のテンプレートやフォントが人気。招待状デザインも需要あり。"
    },
    7: {
      month: "7月", theme: "夏・海・七夕",
      description: "夏のビジュアル素材、海、花火、七夕イラストの季節",
      keywords: ["夏", "海", "花火", "七夕", "ひまわり"],
      recommendedCategories: ["photo", "illustration", "video", "music"],
      featuredSites: [],
      tips: "動画クリエイターには夏のBGMも重要。フリー音楽サイトもチェックしましょう。"
    },
    8: {
      month: "8月", theme: "夏休み・お盆・花火",
      description: "花火、お盆、夏祭りの素材が活躍",
      keywords: ["花火", "夏祭り", "お盆", "夏休み", "スイカ"],
      recommendedCategories: ["photo", "illustration", "sound"],
      featuredSites: [],
      tips: "花火のフリー動画素材はMixkitやPexels Videosで見つかります。"
    },
    9: {
      month: "9月", theme: "秋の始まり・お月見",
      description: "秋の紅葉、お月見、コスモスなど季節の変わり目素材",
      keywords: ["秋", "お月見", "コスモス", "敬老の日"],
      recommendedCategories: ["photo", "illustration"],
      featuredSites: [],
      tips: "紅葉の写真は9月後半から。先取りで素材を準備するのがプロの技。"
    },
    10: {
      month: "10月", theme: "ハロウィン・紅葉",
      description: "ハロウィンデザイン、紅葉写真の需要がピーク",
      keywords: ["ハロウィン", "紅葉", "秋", "かぼちゃ"],
      recommendedCategories: ["illustration", "icon", "photo", "font"],
      featuredSites: [],
      tips: "ハロウィン用のホラーフォントやアイコンは海外サイトが充実。ICOOON MONOも要チェック。"
    },
    11: {
      month: "11月", theme: "紅葉・感謝祭・年末準備",
      description: "紅葉のピーク、年末商戦準備の素材需要",
      keywords: ["紅葉", "ブラックフライデー", "年末", "感謝"],
      recommendedCategories: ["photo", "template", "illustration"],
      featuredSites: [],
      tips: "年末のセールバナーやLP素材の準備は11月から。テンプレートを活用すると効率的。"
    },
    12: {
      month: "12月", theme: "クリスマス・年末年始",
      description: "クリスマス素材、年賀状準備、冬のビジュアルが最需要",
      keywords: ["クリスマス", "年末", "冬", "雪", "イルミネーション"],
      recommendedCategories: ["illustration", "photo", "template", "font", "music"],
      featuredSites: [],
      tips: "クリスマス＆年賀状は素材サイトの年間最大需要期。早めの確保を推奨。"
    }
  };

  const CATEGORY_NAMES = {
    photo: '写真', illustration: 'イラスト', icon: 'アイコン', music: '音楽',
    video: '動画', font: 'フォント', '3d': '3D', template: 'テンプレート',
    texture: 'テクスチャ', asset: 'ゲーム素材', sound: '効果音', archive: '総合', mockup: 'モックアップ'
  };

  function renderMonthSelector() {
    var container = document.getElementById('monthSelector');
    var currentMonth = new Date().getMonth() + 1;
    var html = '';
    for (var m = 1; m <= 12; m++) {
      var active = m === currentMonth ? ' active' : '';
      html += '<button class="month-btn' + active + '" data-month="' + m + '" style="--month-color:' + MONTH_COLORS[m] + '">' + m + '月</button>';
    }
    container.innerHTML = html;
    container.addEventListener('click', function(e) {
      var btn = e.target.closest('.month-btn');
      if (!btn) return;
      container.querySelectorAll('.month-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderMonth(parseInt(btn.dataset.month));
    });
  }

  function renderMonth(month) {
    var content = document.getElementById('monthContent');
    var data = MONTHLY_THEMES[month];
    if (!data) return;
    var color = MONTH_COLORS[month];

    // Get sites matching recommended categories
    var categorySites = {};
    data.recommendedCategories.forEach(function(cat) {
      categorySites[cat] = sitesData
        .filter(function(s) { return s.category === cat; })
        .sort(function(a, b) { return (b.rating || 0) - (a.rating || 0); })
        .slice(0, 4);
    });

    // Featured sites
    var featured = data.featuredSites
      .map(function(f) {
        var site = sitesData.find(function(s) { return s.id === f.id; });
        if (!site) return null;
        var name = typeof site.name === 'object' ? (site.name.ja || site.name.en) : site.name;
        return { id: f.id, reason: f.reason, name: name, site: site };
      })
      .filter(Boolean);

    var keywordsHtml = data.keywords.map(function(k) {
      return '<span class="keyword-tag">' + k + '</span>';
    }).join('');

    var categoryLinksHtml = data.recommendedCategories.map(function(cat) {
      return '<a href="category.html?cat=' + cat + '" class="month-cat-link">' + (CATEGORY_NAMES[cat] || cat) + '</a>';
    }).join('');

    var featuredHtml = '';
    if (featured.length > 0) {
      var featuredItems = featured.map(function(f) {
        return '<a href="detail.html?id=' + f.id + '" class="featured-item">' +
          '<strong>' + f.name + '</strong>' +
          '<span class="featured-reason">' + f.reason + '</span>' +
          '</a>';
      }).join('');
      featuredHtml = '<div class="month-featured">' +
        '<h3>ピックアップサイト</h3>' +
        '<div class="featured-list">' + featuredItems + '</div>' +
        '</div>';
    }

    var categorySectionsHtml = data.recommendedCategories.map(function(cat) {
      var sites = categorySites[cat] || [];
      if (sites.length === 0) return '';
      var cardsHtml = sites.map(function(s) {
        var name = typeof s.name === 'object' ? (s.name.ja || s.name.en) : s.name;
        var desc = typeof s.highlight === 'object' ? (s.highlight.ja || s.highlight.en) : (s.highlight || '');
        return '<a href="detail.html?id=' + s.id + '" class="month-site-card">' +
          '<strong>' + name + '</strong>' +
          '<span>' + desc + '</span>' +
          '</a>';
      }).join('');
      return '<div class="month-cat-section">' +
        '<h3>' + (CATEGORY_NAMES[cat] || cat) + 'のおすすめ</h3>' +
        '<div class="month-sites-grid">' + cardsHtml + '</div>' +
        '</div>';
    }).join('');

    content.innerHTML =
      '<div class="month-hero" style="background:' + color + '">' +
        '<h2>' + data.month + ' — ' + data.theme + '</h2>' +
        '<p>' + data.description + '</p>' +
      '</div>' +
      '<div class="month-keywords">' +
        '<h3>この月の人気キーワード</h3>' +
        '<div class="keyword-tags">' + keywordsHtml + '</div>' +
      '</div>' +
      '<div class="month-categories">' +
        '<h3>おすすめカテゴリ</h3>' +
        '<div class="month-category-links">' + categoryLinksHtml + '</div>' +
      '</div>' +
      featuredHtml +
      categorySectionsHtml +
      '<div class="month-tips">' +
        '<h3>プロのヒント</h3>' +
        '<p>' + data.tips + '</p>' +
      '</div>';
  }

  // Init
  document.addEventListener('DOMContentLoaded', function() {
    fetch('data/sites.json')
      .then(function(res) { return res.json(); })
      .then(function(json) {
        sitesData = json.sites || [];
        renderMonthSelector();
        renderMonth(new Date().getMonth() + 1);
      })
      .catch(function(e) {
        console.error('Failed to load sites:', e);
        renderMonthSelector();
        renderMonth(new Date().getMonth() + 1);
      });

    // Theme toggle
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        var html = document.documentElement;
        var next = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = next;
        localStorage.setItem('theme', next);
      });
    }

    // Hamburger menu toggle
    var hamburgerBtn = document.getElementById('hamburgerBtn');
    var mobileNav = document.getElementById('mobileNav');
    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener('click', function() {
        mobileNav.classList.toggle('open');
      });
    }

    // Back to top
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
      window.addEventListener('scroll', function() {
        backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
      });
      backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });
})();
