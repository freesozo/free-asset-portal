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
      // Quiz
      quizBtn: '🔍 おすすめ診断',
      quizQ1: 'どんな素材を探していますか？',
      quizQ2: '何に使いますか？',
      quizQ2any: '🔍 こだわらない',
      quizQ3: '重視するポイントは？',
      quizQ3a: '💼 商用利用OK重視',
      quizQ3b: '🔓 手軽さ重視（登録不要・クレジット不要）',
      quizQ3c: '🌱 初心者向け・使いやすさ',
      quizResultTitle: 'あなたにおすすめのフリー素材サイト',
      quizNoResult: '条件に合うサイトが見つかりませんでした。',
      quizRetry: 'もう一度診断する',
      quizBack: '← 戻る',
      quizClose: '自分で見つける',
      // プライバシーポリシー
      privacyPolicy: 'プライバシーポリシー',
      privacyIntro: '当サイト「フリー素材ポータル」（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーでは、当サイトにおける情報の取り扱いについてご説明いたします。',
      privacyLocalStorageHeading: '1. ローカルストレージの使用について',
      privacyLocalStorageBody: '当サイトでは、より快適にご利用いただくために、お使いのブラウザのローカルストレージ（localStorage）に以下の情報を保存しています。これらの情報はすべてお使いのブラウザ内にのみ保存され、当サイトのサーバーに送信されることはありません。',
      privacyLocalStorageFav: 'お気に入り登録したサイトの情報',
      privacyLocalStorageTheme: 'テーマ設定（ダークモード / ライトモード）',
      privacyLocalStorageLang: '言語設定（日本語 / 英語）',
      privacyLocalStorageNote: 'これらのデータはブラウザの設定からいつでも削除することができます。個人を特定できる情報は一切収集しておりません。',
      privacyAdsHeading: '2. 広告について',
      privacyAdsBody: '当サイトでは、今後 Google AdSense 等の第三者配信の広告サービスを利用する予定です。これらの広告配信事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。Cookie を無効にする設定やGoogle アドセンスに関する詳細は、広告設定またはwww.aboutads.infoをご確認ください。',
      privacyAffiliateHeading: '3. アフィリエイトリンクについて',
      privacyAffiliateBody: '当サイトは以下のアフィリエイトプログラムに参加しています。当サイト経由で商品・サービスをご購入いただいた場合、当サイトが紹介料を受け取ることがあります。これによりユーザーに追加の費用が発生することはありません。',
      privacyAffiliateA8: 'A8.net アフィリエイトプログラム',
      privacyAffiliateAdobe: 'Adobe アフィリエイトプログラム',
      privacyAffiliateNote: 'アフィリエイトリンクを含むコンテンツには、その旨を明示しています。',
      privacyAnalyticsHeading: '4. アクセス解析について',
      privacyAnalyticsBody: '当サイトでは、今後 Google アナリティクス等のアクセス解析ツールを導入する可能性があります。アクセス解析ツールでは、トラフィックデータの収集のために Cookie を使用しています。このデータは匿名で収集されており、個人を特定するものではありません。この機能はブラウザの設定により Cookie を無効にすることで拒否できます。',
      privacyExternalLinksHeading: '5. 外部リンクについて',
      privacyExternalLinksBody: '当サイトにはフリー素材サイトへのリンクが多数含まれています。外部サイトにおけるプライバシーポリシーおよび利用規約は、各サイトの管理者が定めるものであり、当サイトの管理範囲外となります。リンク先サイトのご利用については、各サイトの利用規約をご確認ください。',
      privacyChangesHeading: '6. プライバシーポリシーの変更について',
      privacyChangesBody: '当サイトは、必要に応じて本プライバシーポリシーの内容を変更することがあります。変更後のプライバシーポリシーは、当ページに掲載した時点から効力を有するものとします。',
      privacyContactHeading: '7. お問い合わせ',
      privacyContactBody: 'プライバシーポリシーに関するお問い合わせは、GitHubリポジトリの Issues ページよりお願いいたします。',
      privacyUpdated: '最終更新日: 2026年2月27日',
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
      // Quiz
      quizBtn: '🔍 Find Your Site',
      quizQ1: 'What kind of asset are you looking for?',
      quizQ2: 'What will you use it for?',
      quizQ2any: '🔍 No preference',
      quizQ3: 'What matters most to you?',
      quizQ3a: '💼 Commercial use OK',
      quizQ3b: '🔓 Easy access (No registration / No credit needed)',
      quizQ3c: '🌱 Beginner friendly',
      quizResultTitle: 'Recommended Free Asset Sites',
      quizNoResult: 'No sites matched your criteria.',
      quizRetry: 'Try Again',
      quizBack: '← Back',
      quizClose: 'Browse on my own',
      // Detail page
      relatedHeading: 'Related Sites',
      viewDetail: 'View Details',
      siteNotFound: 'Site not found',
      // Privacy Policy
      privacyPolicy: 'Privacy Policy',
      privacyIntro: 'At "Free Asset Portal" (hereinafter "this site"), we respect user privacy and are committed to protecting personal information. This Privacy Policy explains how we handle information on this site.',
      privacyLocalStorageHeading: '1. Use of Local Storage',
      privacyLocalStorageBody: 'This site uses your browser\'s local storage (localStorage) to save the following information for a better user experience. All of this data is stored only in your browser and is never sent to our servers.',
      privacyLocalStorageFav: 'Favorited site information',
      privacyLocalStorageTheme: 'Theme preference (Dark mode / Light mode)',
      privacyLocalStorageLang: 'Language preference (Japanese / English)',
      privacyLocalStorageNote: 'You can delete this data at any time through your browser settings. We do not collect any personally identifiable information.',
      privacyAdsHeading: '2. Advertising',
      privacyAdsBody: 'This site plans to use third-party advertising services such as Google AdSense in the future. These advertising providers may use cookies to display ads based on user interests. For details on how to disable cookies and about Google AdSense, please visit your ad settings or www.aboutads.info.',
      privacyAffiliateHeading: '3. Affiliate Links',
      privacyAffiliateBody: 'This site participates in the following affiliate programs. If you purchase products or services through this site, we may receive a referral commission. This does not result in any additional cost to you.',
      privacyAffiliateA8: 'A8.net Affiliate Program',
      privacyAffiliateAdobe: 'Adobe Affiliate Program',
      privacyAffiliateNote: 'Content containing affiliate links is clearly disclosed as such.',
      privacyAnalyticsHeading: '4. Analytics',
      privacyAnalyticsBody: 'This site may implement analytics tools such as Google Analytics in the future. Analytics tools use cookies to collect traffic data. This data is collected anonymously and does not identify individuals. You can opt out of this by disabling cookies in your browser settings.',
      privacyExternalLinksHeading: '5. External Links',
      privacyExternalLinksBody: 'This site contains numerous links to free asset sites. The privacy policies and terms of service of external sites are governed by their respective administrators and are outside the scope of this site\'s management. Please review each site\'s terms of service before use.',
      privacyChangesHeading: '6. Changes to This Policy',
      privacyChangesBody: 'This site may update this Privacy Policy as needed. The revised Privacy Policy will take effect from the time it is posted on this page.',
      privacyContactHeading: '7. Contact',
      privacyContactBody: 'For inquiries regarding this Privacy Policy, please use the Issues page on our GitHub repository.',
      privacyUpdated: 'Last updated: February 27, 2026',
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
