// i18n.js – 日英切替モジュール
const I18n = (() => {
  const dict = {
    ja: {
      siteTitle: 'フリー素材ポータル',
      siteSubtitle: '著作権フリー素材サイトを比較・検索',
      heroHeading: '無料で使える、プロ品質の素材を。',
      heroSub: '厳選された221サイトから、あなたの制作を加速するフリー素材を見つけよう',
      heroCta1: '素材を探す',
      heroCta2: 'ツールを比較する',
      searchPlaceholder: 'サイト名・キーワードで検索...',
      filterFreeOnly: '🆓 無料のみ',
      filterCommercial: '商用利用可',
      filterNoCredit: 'クレジット不要',
      filterNoReg: '登録不要',
      filterBeginner: '初心者向け',
      filterMore: '詳細フィルター',
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
      // 免責
      cardDisclaimer: '※利用規約は各サイトでご確認ください',
      detailDisclaimer: '掲載情報は定期的に確認していますが、各サイトの利用規約は変更される場合があります。素材利用前に必ず公式サイトで最新の利用規約をご確認ください。',
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
      // パーソナライズ
      recentlyViewed: '最近チェックしたサイト',
      favSection: '❤️ お気に入りサイト',
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
      // About
      aboutHeading: 'フリー素材ポータルとは',
      aboutBody: 'フリー素材ポータルは、Web制作・デザイン・動画編集・ゲーム開発など幅広い用途に対応した無料素材サイトを200件以上掲載する日本最大級の比較ポータルサイトです。写真・イラスト・音楽・効果音・動画・アイコン・フォント・3Dモデル・テクスチャ・テンプレートなど13カテゴリに分類し、「商用利用OK」「クレジット表記不要」「会員登録不要」「初心者向け」といった条件でワンクリック絞り込みが可能です。各素材サイトの対応フォーマット（PNG / SVG / JPG / MP3 / MP4 / OTF）も一覧で比較でき、目的の素材をすばやく見つけられます。すべての情報は定期的に更新しており、利用規約の変更や新しいサイトの追加にも対応しています。',
      // Navigation
      navFont: '🔤 フォント',
      nav3D: '🎲 3D',
      navTemplate: '📄 テンプレート',
      navBlog: 'ブログ',
      // Format filter
      formatLabel: '形式:',
      // Shutterstock banner
      ssBannerLabel: '📸 プロ品質の有料素材をお探しなら',
      ssBannerDesc: '写真・動画・音楽・イラスト3億点以上。フリー素材では見つからないクオリティを。',
      ssBannerFeat1: '✅ 商用利用OK',
      ssBannerFeat2: '✅ 日本語サポート',
      ssBannerFeat3: '✅ 定額制プランあり',
      ssBannerCta: '無料トライアルを試す →',
      ssBannerNote: '※ 初月無料プランあり',
      // Sister site
      sisterBannerPrefix: '🔧 ビジネスツールを探すなら →',
      sisterBannerName: 'おすすめツール比較ナビ',
      sisterBannerSuffix: '- 100以上のツールを徹底比較',
      footerSister: '姉妹サイト:',
      footerSisterName: 'おすすめツール比較ナビ',
      // Blog
      blogTitle: 'ブログ – フリー素材の選び方・比較記事',
      blogDesc: 'フリー素材サイトのカテゴリ別まとめ、特徴別比較、形式別ガイドなど、最適な素材サイトを見つけるための記事を掲載しています。',
      blogSectionGuide: 'クリエイター向けガイド',
      blogSectionCategory: 'カテゴリ別まとめ',
      blogSectionFeature: '特集記事',
      blogSectionFormat: '形式別まとめ',
      blogBack: '← ブログ記事一覧に戻る',
      blogBackShort: '← ブログ一覧に戻る',
      blogUpdatedLabel: '更新日:',
      blogArticlesCount: '記事',
      blogSitesCount: 'サイト掲載',
      blogSitesCompare: 'サイトを比較',
      blogTopSelected: 'TOP20を厳選',
      // Blog original article cards
      blogFontGuideTag: 'フォント',
      blogFontGuideTitle: '【2026年最新】商用利用OKの無料フォント30選｜デザイナーが本当に使うおすすめフリーフォント',
      blogFontGuideExcerpt: 'プロのデザイナーが実際の制作現場で使っている、商用利用可能な無料フォントを30個厳選。ゴシック体・明朝体・手書き風・欧文まで、ジャンル別に特徴と使いどころを解説。',
      blogFontGuideMeta: '30選 | 2026-03-16 | 約15分',
      blogServerTag: 'サーバー',
      blogServerTitle: 'クリエイター向けレンタルサーバー比較｜ポートフォリオサイトに最適なのは？',
      blogServerExcerpt: 'イラストレーター・デザイナー・写真家がポートフォリオサイトを作るなら、どのレンタルサーバーが最適？5社を実際のクリエイター目線で徹底比較。料金・速度・WordPress対応を解説。',
      blogServerMeta: '5社比較 | 2026-03-16 | 約10分',
      blog3DTag: '3Dモデル',
      blog3DTitle: '【初心者向け】無料3Dモデルの始め方ガイド｜ダウンロードから商用利用の注意点まで',
      blog3DExcerpt: '3DCGに興味があるけど何から始めればいい？無料3Dモデルのダウンロード方法、ライセンスの見分け方、おすすめソフト（Blender）との連携まで、初心者向けに丁寧に解説。',
      blog3DMeta: '初心者ガイド | 2026-03-16 | 約12分',
      blogVPNTag: 'セキュリティ',
      blogVPNTitle: 'クリエイターにVPNが必要な5つの理由｜海外素材サイトへの安全なアクセス方法',
      blogVPNExcerpt: '海外のフリー素材サイトを使うとき、VPNは必要？セキュリティリスクから身を守りながら、世界中の素材にアクセスする方法を解説。おすすめVPNの選び方も紹介。',
      blogVPNMeta: '5つの理由 | 2026-03-16 | 約8分',
      blogAITag: 'AIツール',
      blogAITitle: '無料で使えるAIツール vs 有料プラン｜クリエイターが課金すべきタイミングとは',
      blogAIExcerpt: 'ChatGPT、Midjourney、Canva、Adobe Firefly…無料プランで十分なケースと、有料プランに切り替えるべきタイミングを具体的なユースケースで解説。',
      blogAIMeta: '無料vs有料 | 2026-03-16 | 約10分',
      // Blog generated card labels
      blogCatIllustration: 'イラスト',
      blogCatPhoto: '写真',
      blogCatIcon: 'アイコン',
      blogCatMusic: '音楽',
      blogCatArchive: '総合素材',
      blogCatTexture: 'テクスチャ・背景',
      blogCatAsset: 'ゲーム素材',
      blogCatSound: '効果音',
      blogCatVideo: '動画',
      blogCatFont: 'フォント',
      blogCatMockup: 'モックアップ',
      blogCat3D: '3Dモデル',
      blogCatTemplate: 'テンプレート',
      blogCatFeature: '特集',
      blogCatRanking: 'ランキング',
      // Generated article titles template parts
      blogGenTitlePrefix: '【{year}年版】おすすめの',
      blogGenTitleSuffix: 'フリー素材サイト',
      blogGenTitleCommercial: '商用利用OK',
      blogGenFeatureCommercial: '商用利用OKのフリー素材サイトまとめ',
      blogGenFeatureNoCredit: 'クレジット表記不要のフリー素材サイトまとめ',
      blogGenFeatureNoReg: '登録不要で使えるフリー素材サイトまとめ',
      blogGenFeatureBeginner: '初心者におすすめのフリー素材サイトまとめ',
      blogGenRankingTitle: 'フリー素材サイトおすすめランキングTOP20',
      blogGenFormatTitle: '{format}形式でダウンロードできるフリー素材サイトまとめ',
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
      heroHeading: 'Pro-quality assets, completely free.',
      heroSub: 'Discover free assets from 221 curated sites to accelerate your creative work',
      heroCta1: 'Browse Assets',
      heroCta2: 'Compare Tools',
      searchPlaceholder: 'Search by site name or keyword...',
      filterFreeOnly: '🆓 Free Only',
      filterCommercial: 'Commercial OK',
      filterNoCredit: 'No Credit Needed',
      filterNoReg: 'No Registration',
      filterBeginner: 'Beginner Friendly',
      filterMore: 'More Filters',
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
      // Disclaimer
      cardDisclaimer: 'Please check each site\'s terms of use',
      detailDisclaimer: 'We regularly verify the information listed, but each site\'s terms of use may change. Always check the latest terms on the official site before using any assets.',
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
      // Personalized sections
      recentlyViewed: 'Recently Viewed',
      favSection: '❤️ Your Favorites',
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
      // About
      aboutHeading: 'About Free Asset Portal',
      aboutBody: 'Free Asset Portal is one of Japan\'s largest comparison portals, listing over 200 free asset sites for web design, graphic design, video editing, game development, and more. Assets are organized into 13 categories — photos, illustrations, music, sound effects, videos, icons, fonts, 3D models, textures, and templates — with one-click filtering by "Commercial Use OK," "No Credit Required," "No Registration," and "Beginner Friendly." Compare supported formats (PNG / SVG / JPG / MP3 / MP4 / OTF) at a glance to quickly find exactly what you need. All information is regularly updated to reflect terms-of-service changes and newly added sites.',
      // Navigation
      navFont: '🔤 Fonts',
      nav3D: '🎲 3D',
      navTemplate: '📄 Templates',
      navBlog: 'Blog',
      // Format filter
      formatLabel: 'Format:',
      // Shutterstock banner
      ssBannerLabel: '📸 Looking for pro-quality paid assets?',
      ssBannerDesc: 'Over 300 million photos, videos, music & illustrations. The quality you can\'t find in free assets.',
      ssBannerFeat1: '✅ Commercial Use OK',
      ssBannerFeat2: '✅ Japanese Support',
      ssBannerFeat3: '✅ Subscription Plans',
      ssBannerCta: 'Start Free Trial →',
      ssBannerNote: '* Free first month available',
      // Sister site
      sisterBannerPrefix: '🔧 Looking for business tools? →',
      sisterBannerName: 'Tool Comparison Navi',
      sisterBannerSuffix: '- Compare 100+ tools',
      footerSister: 'Sister site:',
      footerSisterName: 'Tool Comparison Navi',
      // Detail page
      relatedHeading: 'Related Sites',
      viewDetail: 'View Details',
      siteNotFound: 'Site not found',
      // Blog
      blogTitle: 'Blog – Choosing & Comparing Free Assets',
      blogDesc: 'Browse our articles on free asset sites: category roundups, feature comparisons, format guides, and more to help you find the perfect resources.',
      blogSectionGuide: 'Creator Guides',
      blogSectionCategory: 'By Category',
      blogSectionFeature: 'Featured Articles',
      blogSectionFormat: 'By Format',
      blogBack: '← Back to Blog',
      blogBackShort: '← Back to Blog',
      blogUpdatedLabel: 'Updated:',
      blogArticlesCount: 'articles',
      blogSitesCount: 'sites listed',
      blogSitesCompare: 'sites compared',
      blogTopSelected: 'TOP 20 selected',
      // Blog original article cards
      blogFontGuideTag: 'Fonts',
      blogFontGuideTitle: '[2026] 30 Best Free Fonts for Commercial Use – Designer\'s Top Picks',
      blogFontGuideExcerpt: '30 handpicked free fonts that professional designers actually use. Covers Gothic, Mincho, handwritten, and Latin fonts with usage tips for each.',
      blogFontGuideMeta: '30 picks | 2026-03-16 | ~15 min',
      blogServerTag: 'Hosting',
      blogServerTitle: 'Web Hosting Comparison for Creators – Best Options for Portfolio Sites',
      blogServerExcerpt: 'Which web hosting is best for illustrators, designers, and photographers building portfolio sites? A hands-on comparison of 5 providers covering price, speed, and WordPress support.',
      blogServerMeta: '5 compared | 2026-03-16 | ~10 min',
      blog3DTag: '3D Models',
      blog3DTitle: '[Beginner\'s Guide] Getting Started with Free 3D Models – From Download to Commercial Use',
      blog3DExcerpt: 'New to 3DCG? Learn how to download free 3D models, understand licenses, and use them with Blender. A step-by-step beginner\'s guide.',
      blog3DMeta: 'Beginner guide | 2026-03-16 | ~12 min',
      blogVPNTag: 'Security',
      blogVPNTitle: '5 Reasons Creators Need a VPN – Safe Access to Global Asset Sites',
      blogVPNExcerpt: 'Do you need a VPN when using overseas free asset sites? Learn how to stay secure while accessing resources worldwide. Includes VPN selection tips.',
      blogVPNMeta: '5 reasons | 2026-03-16 | ~8 min',
      blogAITag: 'AI Tools',
      blogAITitle: 'Free AI Tools vs Paid Plans – When Should Creators Upgrade?',
      blogAIExcerpt: 'ChatGPT, Midjourney, Canva, Adobe Firefly… When is the free plan enough, and when should you switch to paid? Explained with real use cases.',
      blogAIMeta: 'Free vs Paid | 2026-03-16 | ~10 min',
      // Blog generated card labels
      blogCatIllustration: 'Illustration',
      blogCatPhoto: 'Photo',
      blogCatIcon: 'Icon',
      blogCatMusic: 'Music',
      blogCatArchive: 'Archive',
      blogCatTexture: 'Texture & BG',
      blogCatAsset: 'Game Asset',
      blogCatSound: 'Sound FX',
      blogCatVideo: 'Video',
      blogCatFont: 'Font',
      blogCatMockup: 'Mockup',
      blogCat3D: '3D Model',
      blogCatTemplate: 'Template',
      blogCatFeature: 'Featured',
      blogCatRanking: 'Ranking',
      // Generated article titles template parts
      blogGenTitlePrefix: '[{year}] Best ',
      blogGenTitleSuffix: ' Free Asset Sites',
      blogGenTitleCommercial: 'Commercial Use OK',
      blogGenFeatureCommercial: 'Commercial Use OK Free Asset Sites',
      blogGenFeatureNoCredit: 'No Credit Required Free Asset Sites',
      blogGenFeatureNoReg: 'No Registration Required Free Asset Sites',
      blogGenFeatureBeginner: 'Beginner-Friendly Free Asset Sites',
      blogGenRankingTitle: 'Best Free Asset Sites Ranking TOP 20',
      blogGenFormatTitle: 'Free Asset Sites with {format} Downloads',
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
    // Blog cards: inline ja/en translations
    document.querySelectorAll('[data-i18n-ja]').forEach(el => {
      el.textContent = current === 'en'
        ? (el.getAttribute('data-i18n-en') || el.getAttribute('data-i18n-ja'))
        : el.getAttribute('data-i18n-ja');
    });
    // Fire custom event so app.js can re-render
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: current } }));
  }

  // Init
  document.documentElement.lang = current;

  return { getLang, setLang, t, localize, toggle, applyAll };
})();
