// i18n.js – 日英切替モジュール
const I18n = (() => {
  const dict = {
    ja: {
      siteTitle: 'フリー素材ポータル',
      siteSubtitle: '著作権フリー素材サイトを比較・検索',
      heroHeading: 'ぴったりのフリー素材サイトを見つけよう',
      heroSub: '商用利用・クレジット・登録の有無をひと目で比較できるポータルサイト',
      searchPlaceholder: 'サイト名・キーワードで検索...',
      filterCommercial: '商用利用可',
      filterNoCredit: 'クレジット不要',
      filterNoReg: '登録不要',
      filterBeginner: '初心者向け',
      regionGlobal: '🌍 海外含む',
      regionJp: '🇯🇵 日本のみ',
      categoryHeading: 'カテゴリで探す',
      useCaseHeading: '用途で探す',
      recommendHeading: 'おすすめサイト',
      allSitesHeading: '全サイト一覧',
      sortRecommend: 'おすすめ順',
      sortName: '名前順',
      commercial: '商用可',
      creditRequired: 'クレジット要',
      creditFree: 'クレジット不要',
      regRequired: '要登録',
      regFree: '登録不要',
      beginnerOk: '初心者向け',
      visitSite: 'サイトを開く',
      close: '閉じる',
      footerNotice: '※ 各サイトの利用規約は変更される場合があります。素材利用前に必ず各サイトの最新の利用規約をご確認ください。',
      noResults: '該当するサイトが見つかりませんでした',
      lang: '🌐 English',
      breadcrumbHome: 'ホーム',
      allCategories: 'すべてのカテゴリ',
      all: 'すべて',
      modalUseCases: '用途',
      modalCategory: 'カテゴリ',
      modalRating: '評価',
      modalLicense: 'ライセンス情報',
      // 収益化
      premiumHeading: 'もっと高品質な素材が必要？',
      premiumSub: '無料素材では物足りない方に。プロ品質の有料素材サービスを比較。',
      premiumBadge: 'PR',
      premiumVisit: '無料で試す',
      premiumPricing: '料金',
      newsletterHeading: '最新のフリー素材情報を受け取る',
      newsletterSub: '新しいフリー素材サイトの追加や、お得な情報をお届けします。',
      newsletterPlaceholder: 'メールアドレスを入力',
      newsletterBtn: '登録する',
      newsletterSuccess: '登録ありがとうございます！',
      newsletterAlready: '既に登録済みです',
      adLabel: '広告',
      affiliateBadge: 'おすすめ',
      affiliateDisclosure: '※ 一部リンクはアフィリエイトリンクを含みます。サイト運営のサポートにご協力ください。',
      // ページネーション
      loadMore: 'もっと見る',
      // ダークモード
      themeDarkLabel: 'ダークモードに切替',
      themeLightLabel: 'ライトモードに切替',
      // お気に入り
      filterFavorites: '❤️ お気に入りのみ',
      favorite: 'お気に入りに追加',
      unfavorite: 'お気に入りから削除',
      // 比較
      compareToggle: '⚖️ 比較モード',
      compareSelect: '比較するサイトを選択（最大3件）',
      compareNow: '比較を見る',
      compareHeading: 'サイト比較',
      // 詳細ページ
      relatedHeading: '関連サイト',
      viewDetail: '詳細を見る',
      siteNotFound: 'サイトが見つかりませんでした',
    },
    en: {
      siteTitle: 'Free Asset Portal',
      siteSubtitle: 'Compare & search royalty-free asset sites',
      heroHeading: 'Find the perfect free asset site',
      heroSub: 'Compare commercial use, credit requirements, and registration at a glance',
      searchPlaceholder: 'Search by site name or keyword...',
      filterCommercial: 'Commercial OK',
      filterNoCredit: 'No Credit Needed',
      filterNoReg: 'No Registration',
      filterBeginner: 'Beginner Friendly',
      regionGlobal: '🌍 Global + Japan',
      regionJp: '🇯🇵 Japan Only',
      categoryHeading: 'Browse by Category',
      useCaseHeading: 'Browse by Use Case',
      recommendHeading: 'Recommended Sites',
      allSitesHeading: 'All Sites',
      sortRecommend: 'By Rating',
      sortName: 'By Name',
      commercial: 'Commercial OK',
      creditRequired: 'Credit Required',
      creditFree: 'No Credit Needed',
      regRequired: 'Registration Req.',
      regFree: 'No Registration',
      beginnerOk: 'Beginner Friendly',
      visitSite: 'Visit Site',
      close: 'Close',
      footerNotice: '* Terms of service may change. Always check each site\'s latest terms before using assets.',
      noResults: 'No matching sites found',
      lang: '🌐 日本語',
      breadcrumbHome: 'Home',
      allCategories: 'All Categories',
      all: 'All',
      modalUseCases: 'Use Cases',
      modalCategory: 'Category',
      modalRating: 'Rating',
      modalLicense: 'License Info',
      // Monetization
      premiumHeading: 'Need higher quality assets?',
      premiumSub: 'For those who need more than free. Compare pro-quality paid asset services.',
      premiumBadge: 'AD',
      premiumVisit: 'Try Free',
      premiumPricing: 'Pricing',
      newsletterHeading: 'Get the latest free asset updates',
      newsletterSub: 'We\'ll notify you about new free asset sites and special deals.',
      newsletterPlaceholder: 'Enter your email',
      newsletterBtn: 'Subscribe',
      newsletterSuccess: 'Thanks for subscribing!',
      newsletterAlready: 'Already subscribed',
      adLabel: 'Ad',
      affiliateBadge: 'Recommended',
      affiliateDisclosure: '* Some links are affiliate links. Your support helps us keep this site running.',
      // Pagination
      loadMore: 'Load More',
      // Dark mode
      themeDarkLabel: 'Switch to Dark Mode',
      themeLightLabel: 'Switch to Light Mode',
      // Favorites
      filterFavorites: '❤️ Favorites Only',
      favorite: 'Add to Favorites',
      unfavorite: 'Remove from Favorites',
      // Compare
      compareToggle: '⚖️ Compare Mode',
      compareSelect: 'Select sites to compare (max 3)',
      compareNow: 'Compare Now',
      compareHeading: 'Site Comparison',
      // Detail page
      relatedHeading: 'Related Sites',
      viewDetail: 'View Details',
      siteNotFound: 'Site not found',
    }
  };

  let current = localStorage.getItem('lang') || 'ja';

  function getLang() { return current; }

  function setLang(lang) {
    current = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    applyAll();
  }

  function t(key) {
    return (dict[current] && dict[current][key]) || key;
  }

  function localize(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[current] || obj.ja || obj.en || '';
  }

  function toggle() {
    setLang(current === 'ja' ? 'en' : 'ja');
  }

  function applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    });
    // Fire custom event so app.js can re-render
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: current } }));
  }

  // Init
  document.documentElement.lang = current;

  return { getLang, setLang, t, localize, toggle, applyAll };
})();
