# Memory

## フリー素材ポータル (Free Asset Portal)
- Location: `G:\freesitePortal Site`
- GitHub: `https://github.com/freesozo/free-asset-portal`
- Live URL: `https://freesozo.github.io/free-asset-portal/`
- GitHubユーザー名: `freesozo`
- 静的サイト (HTML/CSS/JS/JSON, バックエンドなし)
- GitHub Pages でホスティング (workflow deploy 設定済み)
- 177サイト登録済み (sites.json), プレミアム5件
- 機能: ページネーション, ダークモード, お気に入り, 比較機能, 詳細ページ, 日英バイリンガル

### 自動化 (2026-02-28 追加)
- `manage.sh` - 全自動管理スクリプト (auto/validate/check/update/report/deploy)
- `.github/workflows/auto-check.yml` - 毎週月曜自動チェック＆デプロイ
- `go.html` - アフィリエイトリダイレクト追跡ページ
- sitemap.xml 188 URL自動生成

### 収益化の状況
- A8.net: 登録済み (ユーザー名: freesozo001a)
- A8.net 副サイト「おすすめツール比較ナビ」追加済み (2026-02-28)
- Adobe Affiliate Program: 申請済み (審査待ち)
- AdSense: 未申請 (独自ドメイン・トラフィック必要)
- アフィリエイトURL: プレミアム5件とも未設定 (A8.net提携申請中)

### SEO対策の状況
- Google Search Console: 登録済み・所有権確認済み
- sitemap.xml: 自動生成 (manage.sh update)
- robots.txt: 自動生成
- OGP / Twitter Card / canonical URL: 設定済み
- JSON-LD 構造化データ: index.html に設定済み

### ファイル構成
- `index.html` - トップページ
- `category.html` - カテゴリページ
- `detail.html` - サイト詳細ページ (?id=xxx)
- `privacy.html` - プライバシーポリシー
- `go.html` - アフィリエイトリダイレクト
- `js/app.js` - メインアプリロジック
- `js/i18n.js` - 日英翻訳
- `css/style.css` - 全スタイル
- `data/sites.json` - 全サイトデータ
- `manage.sh` - 自動管理スクリプト
- `.github/workflows/auto-check.yml` - CI/CD

### 関連サイト
- ツール比較ナビ: `G:\シンプルマネタイズシステム` / `https://freesozo.github.io/simple-monetize/`
- アフィリエイト一括管理: `G:\affiliate-auto-setup.sh`

### 次にやること
- A8.net で提携申請完了 → 広告リンク取得 → 自動反映
- Adobe審査結果待ち → 承認されたらaffiliateUrlを更新
- サイト数をさらに増やす (200サイト目標)
- 独自ドメイン取得検討 (Cloudflare ~1,200円/年)
- AdSense申請 (トラフィック増加後)
