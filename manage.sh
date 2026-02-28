#!/bin/bash
# ============================================================
#  フリー素材ポータル - 全自動管理スクリプト
#  Usage: ./manage.sh [command]
#  Commands: auto | validate | check | update | report | deploy
# ============================================================

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd -W 2>/dev/null || pwd)"
DATA_DIR="$SCRIPT_DIR/data"
SITES_FILE="$DATA_DIR/sites.json"
LOG_FILE="$SCRIPT_DIR/manage.log"
ERRORS=0
WARNINGS=0
FIXES=0

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()  { echo -e "${GREEN}[OK]${NC}   $1"; }
warn(){ echo -e "${YELLOW}[WARN]${NC} $1"; ((WARNINGS++)) || true; }
err() { echo -e "${RED}[ERR]${NC}  $1"; ((ERRORS++)) || true; }
fix() { echo -e "${GREEN}[FIX]${NC}  $1"; ((FIXES++)) || true; }
timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

# ============================================================
#  VALIDATE - データ検証
# ============================================================
cmd_validate() {
  log "========== データ検証 =========="

  if [[ ! -f "$SITES_FILE" ]]; then
    err "sites.json が見つかりません"
    return 1
  fi
  ok "sites.json 存在確認"

  python3 -c "
import json, sys

with open(r'$SITES_FILE', encoding='utf-8') as f:
    data = json.load(f)

sites = data.get('sites', [])
categories = data.get('categories', [])
premium = data.get('premiumSites', [])
cat_ids = {c['id'] for c in categories}
errors = 0
warnings = 0

print(f'  サイト数: {len(sites)}')
print(f'  カテゴリ数: {len(categories)}')
print(f'  プレミアム数: {len(premium)}')

# Required fields
required = ['id','name','url','category','description','commercial','rating']
for i, s in enumerate(sites):
    for key in required:
        if key not in s:
            print(f'  ERROR: Site #{i} ({s.get(\"id\",\"?\")}) missing: {key}')
            errors += 1
    if s.get('category') and s['category'] not in cat_ids:
        print(f'  WARN: Site {s[\"id\"]} unknown category: {s[\"category\"]}')
        warnings += 1
    r = s.get('rating', 0)
    if r < 1 or r > 5:
        print(f'  WARN: Site {s[\"id\"]} rating out of range: {r}')
        warnings += 1

# Duplicate IDs
ids = [s['id'] for s in sites]
dupes = set(x for x in ids if ids.count(x) > 1)
if dupes:
    print(f'  ERROR: Duplicate IDs: {dupes}')
    errors += 1
else:
    print(f'  ID重複なし')

# Premium validation
for p in premium:
    if 'affiliateUrl' not in p or not p.get('affiliateUrl'):
        print(f'  WARN: Premium {p[\"id\"]} has no affiliateUrl')
        warnings += 1

print(f'  検証結果: errors={errors}, warnings={warnings}')
sys.exit(1 if errors else 0)
" && ok "データ検証OK" || err "データにエラーあり"

  # HTML files
  for f in index.html category.html detail.html privacy.html; do
    if [[ -f "$SCRIPT_DIR/$f" ]]; then
      ok "$f 存在確認"
    else
      warn "$f が見つかりません"
    fi
  done

  # SEO files
  for f in sitemap.xml robots.txt favicon.svg; do
    if [[ -f "$SCRIPT_DIR/$f" ]]; then
      ok "$f 存在確認"
    else
      warn "$f が見つかりません"
    fi
  done

  log "検証完了: エラー=$ERRORS, 警告=$WARNINGS"
}

# ============================================================
#  CHECK - リンクチェック (サンプル20件)
# ============================================================
cmd_check() {
  log "========== リンクチェック (サンプル) =========="

  python3 -c "
import json, urllib.request, ssl, sys, random

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open(r'$SITES_FILE', encoding='utf-8') as f:
    data = json.load(f)

sites = data.get('sites', [])
premium = data.get('premiumSites', [])

# Check all premium affiliate URLs
print('--- Premium Affiliate Links ---')
for p in premium:
    url = p.get('affiliateUrl', '')
    name = p.get('name', p.get('id','?'))
    if isinstance(name, dict): name = name.get('ja', name.get('en', '?'))
    if not url or 'XXXXX' in url:
        print(f'  SKIP  {name}: placeholder URL')
        continue
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent':'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        print(f'  OK    {name}: {resp.getcode()}')
    except:
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=10, context=ctx)
            print(f'  OK    {name}: {resp.getcode()} (GET)')
        except Exception as e:
            print(f'  FAIL  {name}: {e}')

# Sample 20 random site URLs
print()
print('--- Site URLs (random 20) ---')
sample = random.sample(sites, min(20, len(sites)))
ok_count = 0
fail_count = 0
for s in sample:
    url = s.get('url', '')
    name = s.get('name', {})
    if isinstance(name, dict): name = name.get('ja', name.get('en', s['id']))
    if not url:
        print(f'  SKIP  {name}: no URL')
        continue
    try:
        req = urllib.request.Request(url, method='HEAD', headers={'User-Agent':'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        print(f'  OK    {name}: {resp.getcode()}')
        ok_count += 1
    except:
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=10, context=ctx)
            print(f'  OK    {name}: {resp.getcode()} (GET)')
            ok_count += 1
        except Exception as e:
            print(f'  FAIL  {name}: {e}')
            fail_count += 1

print(f'\nSample result: OK={ok_count}, FAIL={fail_count} / {len(sample)} checked')
" && ok "リンクチェック完了" || warn "一部リンクに問題あり"

  log "リンクチェック完了"
}

# ============================================================
#  UPDATE - 自動更新 (sitemap, robots.txt)
# ============================================================
cmd_update() {
  log "========== 自動更新 =========="

  local today
  today=$(date '+%Y-%m-%d')

  # Regenerate sitemap.xml
  python3 -c "
import json

BASE_URL = 'https://freesozo.github.io/free-asset-portal'

with open(r'$SITES_FILE', encoding='utf-8') as f:
    data = json.load(f)

sites = data.get('sites', [])
categories = data.get('categories', [])

xml = '''<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
  <url><loc>{base}/index.html</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>{base}/privacy.html</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>'''.format(base=BASE_URL)

for cat in categories:
    xml += '''
  <url><loc>{base}/category.html?cat={cid}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>'''.format(base=BASE_URL, cid=cat['id'])

for s in sites:
    xml += '''
  <url><loc>{base}/detail.html?id={sid}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>'''.format(base=BASE_URL, sid=s['id'])

xml += '''
</urlset>'''

with open(r'$SCRIPT_DIR/sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(xml)
total = 2 + len(categories) + len(sites)
print(f'sitemap.xml: {total} URLs generated')
"
  fix "sitemap.xml 更新 ($today)"

  # Update robots.txt
  cat > "$SCRIPT_DIR/robots.txt" << 'ROBOTS'
User-agent: *
Allow: /
Sitemap: https://freesozo.github.io/free-asset-portal/sitemap.xml
ROBOTS
  fix "robots.txt 更新"

  log "自動更新完了: $FIXES 件"
}

# ============================================================
#  REPORT - レポート
# ============================================================
cmd_report() {
  log "========== レポート =========="

  python3 -c "
import json
from collections import Counter

with open(r'$SITES_FILE', encoding='utf-8') as f:
    data = json.load(f)

sites = data.get('sites', [])
categories = data.get('categories', [])
premium = data.get('premiumSites', [])
use_cases = data.get('useCases', [])
def get_name(obj, fallback='?'):
    if isinstance(obj, dict):
        return obj.get('ja', obj.get('en', fallback))
    return str(obj) if obj else fallback

cat_map = {c['id']: get_name(c['name'], c['id']) for c in categories}
cat_counts = Counter(s['category'] for s in sites)

no_url = [s for s in sites if not s.get('url')]
low_rating = [s for s in sites if s.get('rating', 0) < 3]

print(f'''
{'='*55}
  フリー素材ポータル レポート
{'='*55}

【サイト統計】
  総サイト数:     {len(sites)}
  カテゴリ数:     {len(categories)}
  プレミアム数:   {len(premium)}
  用途数:         {len(use_cases)}

【カテゴリ別】''')
for cat_id, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    name = cat_map.get(cat_id, cat_id)
    bar = '█' * (count // 2)
    print(f'  {name:<20s} {count:3d}件 {bar}')

commercial = sum(1 for s in sites if s.get('commercial'))
credit_free = sum(1 for s in sites if not s.get('creditRequired'))
no_reg = sum(1 for s in sites if not s.get('registrationRequired'))
beginner = sum(1 for s in sites if s.get('beginnerFriendly'))
avg_rating = sum(s.get('rating',0) for s in sites) / len(sites) if sites else 0

print(f'''
【属性分布】
  商用利用OK:     {commercial}/{len(sites)} ({commercial*100//len(sites)}%)
  クレジット不要: {credit_free}/{len(sites)} ({credit_free*100//len(sites)}%)
  登録不要:       {no_reg}/{len(sites)} ({no_reg*100//len(sites)}%)
  初心者向け:     {beginner}/{len(sites)} ({beginner*100//len(sites)}%)
  平均評価:       {avg_rating:.1f} / 5.0''')

if premium:
    print(f'''
【プレミアムサイト】''')
    for p in premium:
        name = get_name(p.get('name', p.get('id','?')))
        has_aff = '✓' if p.get('affiliateUrl') else '✗'
        pricing = p.get('pricing','')
        if isinstance(pricing, dict): pricing = get_name(pricing, '')
        print(f'  {has_aff} {name} - {pricing}')

if no_url:
    print(f'\n【注意】 URL未設定: {len(no_url)}件')
if low_rating:
    print(f'【注意】 低評価(3未満): {len(low_rating)}件')

print(f'''
{'='*55}''')
"
}

# ============================================================
#  DEPLOY
# ============================================================
cmd_deploy() {
  log "========== デプロイ =========="
  cd "$SCRIPT_DIR"
  git add -A
  if git diff --cached --quiet 2>/dev/null; then
    ok "変更なし"
    return
  fi
  git commit -m "auto-update: $(date '+%Y-%m-%d %H:%M')"
  ok "コミット作成"
  git push origin main && ok "プッシュ完了" || warn "プッシュ失敗"
}

# ============================================================
#  AUTO - 全自動
# ============================================================
cmd_auto() {
  echo ""
  echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  フリー素材ポータル 全自動管理システム   ║${NC}"
  echo -e "${BLUE}║  $(timestamp)                ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
  echo ""

  cmd_update;   echo ""
  cmd_validate; echo ""
  cmd_check;    echo ""
  cmd_report;   echo ""

  echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  実行結果サマリー                        ║${NC}"
  echo -e "${BLUE}╠══════════════════════════════════════════╣${NC}"
  echo -e "${BLUE}║${NC}  更新: ${GREEN}$FIXES 件${NC}                           ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  エラー: ${RED}$ERRORS 件${NC}                         ${BLUE}║${NC}"
  echo -e "${BLUE}║${NC}  警告: ${YELLOW}$WARNINGS 件${NC}                         ${BLUE}║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"

  echo "[$(timestamp)] auto: fixes=$FIXES errors=$ERRORS warnings=$WARNINGS" >> "$LOG_FILE"
}

# ============================================================
cmd_help() {
  echo ""
  echo "フリー素材ポータル 管理スクリプト"
  echo ""
  echo "Usage: ./manage.sh [command]"
  echo ""
  echo "  auto      全自動実行（更新→検証→チェック→レポート）"
  echo "  validate  sites.json データ検証"
  echo "  check     サイトURL・アフィリエイトリンクチェック"
  echo "  update    sitemap.xml / robots.txt 再生成"
  echo "  report    統計レポート"
  echo "  deploy    git commit & push"
  echo "  help      ヘルプ"
  echo ""
}

case "${1:-help}" in
  auto)     cmd_auto ;;
  validate) cmd_validate ;;
  check)    cmd_check ;;
  update)   cmd_update ;;
  report)   cmd_report ;;
  deploy)   cmd_deploy ;;
  help|*)   cmd_help ;;
esac
