#!/usr/bin/env python3
"""Generate tweet data for all sites in sites.json.

Reads data/sites.json and produces tweets/tweets.json with one tweet per site,
ordered by round-robin across categories (high quality first within each category).
"""

import json
import random
from collections import defaultdict

CATEGORY_HASHTAGS = {
    "photo": "#写真素材 #ストックフォト",
    "illustration": "#イラスト素材 #イラスト",
    "icon": "#アイコン素材 #UIデザイン",
    "music": "#フリー音楽 #BGM素材",
    "video": "#動画素材 #映像制作",
    "font": "#フリーフォント #タイポグラフィ",
    "3d": "#3Dモデル #3DCG",
    "template": "#テンプレート #デザイン素材",
    "texture": "#テクスチャ素材 #背景素材",
    "asset": "#ゲーム素材 #ゲーム開発",
    "archive": "#素材サイト #クリエイター",
    "mockup": "#モックアップ #Webデザイン",
    "sound": "#効果音 #SE素材",
}

CAT_EMOJI = {
    "photo": "\U0001f4f8",
    "illustration": "\U0001f3a8",
    "icon": "\U0001f537",
    "music": "\U0001f3b5",
    "video": "\U0001f3ac",
    "font": "\U0001f524",
    "3d": "\U0001f9ca",
    "template": "\U0001f4c4",
    "texture": "\U0001f5bc\ufe0f",
    "asset": "\U0001f3ae",
    "archive": "\U0001f4da",
    "mockup": "\U0001f4f1",
    "sound": "\U0001f50a",
}


def compute_quality(site):
    """Compute overall quality score (average of 6 metrics) and letter grade."""
    qs = site.get("qualityScore")
    if not qs:
        return None, None
    values = [
        qs.get("security", 0),
        qs.get("usability", 0),
        qs.get("downloadEase", 0),
        qs.get("termsClarity", 0),
        qs.get("adFree", 0),
        qs.get("japaneseSupport", 0),
    ]
    overall = round(sum(values) / len(values), 1)
    if overall >= 4.5:
        grade = "S"
    elif overall >= 4.0:
        grade = "A"
    elif overall >= 3.0:
        grade = "B"
    elif overall >= 2.0:
        grade = "C"
    else:
        grade = "D"
    return overall, grade


def generate_tweet(site, index):
    """Generate tweet text for a single site."""
    # Name (use ja, fallback to en)
    name_obj = site.get("name", {})
    if isinstance(name_obj, dict):
        name = name_obj.get("ja") or name_obj.get("en") or site.get("id", "Unknown")
    else:
        name = str(name_obj)

    site_id = site.get("id", "unknown")
    category = site.get("category", "archive")

    # Description (ja, truncated to 80 chars)
    desc_obj = site.get("description", {})
    if isinstance(desc_obj, dict):
        description = desc_obj.get("ja") or desc_obj.get("en") or ""
    else:
        description = str(desc_obj)
    if len(description) > 80:
        description = description[:77] + "..."

    # License info
    license_lines = []
    if site.get("commercial"):
        license_lines.append("\u2705 商用利用OK")
    else:
        license_lines.append("\u26a0\ufe0f 商用利用は要確認")

    if site.get("creditRequired") is False:
        license_lines.append("\u2705 クレジット不要")
    elif site.get("creditRequired") is True:
        license_lines.append("\U0001f4dd クレジット表記必要")

    if site.get("registrationRequired") is False:
        license_lines.append("\u2705 登録不要")
    elif site.get("registrationRequired") is True:
        license_lines.append("\U0001f4dd 要ユーザー登録")

    # Quality score
    overall, grade = compute_quality(site)
    quality_line = ""
    if overall is not None and grade is not None:
        quality_line = f"\u2b50 品質: {grade} ({overall}/5.0)"

    # Hashtags
    cat_tags = CATEGORY_HASHTAGS.get(category, "#クリエイター")
    emoji = CAT_EMOJI.get(category, "\u2728")

    # Build tweet
    tweet = f"{emoji} 今日のおすすめ素材サイト #{index}\n\n【{name}】\n"
    tweet += "\n".join(license_lines)

    if quality_line:
        tweet += f"\n{quality_line}"

    tweet += f"\n\n{description}"
    tweet += f"\n\n\u2192 詳細＆比較: https://freesozo.com/detail.html?id={site_id}"
    tweet += f"\n\n#フリー素材 #デザイン {cat_tags}"

    # Truncation if over 280 chars
    tweet = truncate_tweet(tweet, site, index, category, emoji, name, license_lines, description, quality_line, cat_tags)

    return tweet.strip()


def truncate_tweet(tweet, site, index, category, emoji, name, license_lines, description, quality_line, cat_tags):
    """Progressively shorten tweet to fit 280 chars."""
    if len(tweet) <= 280:
        return tweet

    site_id = site.get("id", "unknown")

    # Step 1: shorten description to 50 chars
    desc_obj = site.get("description", {})
    if isinstance(desc_obj, dict):
        desc_short = desc_obj.get("ja") or desc_obj.get("en") or ""
    else:
        desc_short = str(desc_obj)
    if len(desc_short) > 50:
        desc_short = desc_short[:47] + "..."

    tweet = rebuild_tweet(emoji, index, name, license_lines, quality_line, desc_short, site_id, cat_tags)
    if len(tweet) <= 280:
        return tweet

    # Step 2: reduce category hashtags to 1
    first_tag = cat_tags.split(" ")[0]
    tweet = rebuild_tweet(emoji, index, name, license_lines, quality_line, desc_short, site_id, first_tag)
    if len(tweet) <= 280:
        return tweet

    # Step 3: remove quality line
    tweet = rebuild_tweet(emoji, index, name, license_lines, "", desc_short, site_id, first_tag)
    if len(tweet) <= 280:
        return tweet

    # Step 4: reduce license to 2 lines
    tweet = rebuild_tweet(emoji, index, name, license_lines[:2], "", desc_short, site_id, first_tag)
    if len(tweet) <= 280:
        return tweet

    # Step 5: further shorten description
    if len(desc_short) > 30:
        desc_short = desc_short[:27] + "..."
    tweet = rebuild_tweet(emoji, index, name, license_lines[:2], "", desc_short, site_id, first_tag)
    return tweet


def rebuild_tweet(emoji, index, name, license_lines, quality_line, description, site_id, cat_tags):
    tweet = f"{emoji} 今日のおすすめ素材サイト #{index}\n\n【{name}】\n"
    tweet += "\n".join(license_lines)
    if quality_line:
        tweet += f"\n{quality_line}"
    tweet += f"\n\n{description}"
    tweet += f"\n\n\u2192 詳細＆比較: https://freesozo.com/detail.html?id={site_id}"
    tweet += f"\n\n#フリー素材 #デザイン {cat_tags}"
    return tweet.strip()


def generate_schedule(sites):
    """Create a round-robin schedule across categories, high quality first."""
    by_category = defaultdict(list)
    for site in sites:
        cat = site.get("category", "archive")
        by_category[cat].append(site)

    # Sort each category by quality score descending
    for cat in by_category:
        by_category[cat].sort(
            key=lambda s: compute_quality(s)[0] or 0,
            reverse=True,
        )

    # Round-robin across shuffled categories
    schedule = []
    categories = list(by_category.keys())
    random.seed(42)
    random.shuffle(categories)

    while any(by_category[cat] for cat in categories):
        for cat in categories:
            if by_category[cat]:
                schedule.append(by_category[cat].pop(0))

    return schedule


def main():
    with open("data/sites.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    sites = data.get("sites", data) if isinstance(data, dict) else data

    schedule = generate_schedule(sites)

    tweets = []
    for i, site in enumerate(schedule, 1):
        tweet_text = generate_tweet(site, i)
        name_obj = site.get("name", {})
        site_name = (
            (name_obj.get("ja") or name_obj.get("en"))
            if isinstance(name_obj, dict)
            else str(name_obj)
        )
        tweets.append(
            {
                "index": i,
                "site_id": site.get("id"),
                "site_name": site_name,
                "category": site.get("category"),
                "tweet": tweet_text,
                "posted": False,
            }
        )

    with open("tweets/tweets.json", "w", encoding="utf-8") as f:
        json.dump(tweets, f, ensure_ascii=False, indent=2)

    print(f"Generated {len(tweets)} tweets")

    # Preview first 3
    for t in tweets[:3]:
        print(f"\n--- Tweet #{t['index']} ({t['site_name']}) ---")
        print(t["tweet"])
        print(f"[{len(t['tweet'])} chars]")

    # Check for over-limit
    over = [t for t in tweets if len(t["tweet"]) > 280]
    if over:
        print(f"\nWARNING: {len(over)} tweets exceed 280 chars!")
        for t in over:
            print(f"  #{t['index']} {t['site_name']}: {len(t['tweet'])} chars")
    else:
        print("\nAll tweets within 280 char limit.")


if __name__ == "__main__":
    main()
