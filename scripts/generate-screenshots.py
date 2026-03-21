#!/usr/bin/env python3
"""Generate editorial-style placeholder card images for top 50 sites."""

import json
import os
import random
from PIL import Image, ImageDraw, ImageFont

SITES_JSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'sites.json')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'images', 'screenshots')
WIDTH, HEIGHT = 600, 400

CAT_COLORS = {
    'photo': '#3d5a80', 'illustration': '#8b7bb8', 'icon': '#457b6e',
    'music': '#6d597a', 'video': '#b56b4f', 'font': '#2d3142',
    '3d': '#4a6fa5', 'template': '#9e8c6c', 'texture': '#7d8570',
    'asset': '#6a4c93', 'mockup': '#a68a64', 'archive': '#8b8589',
    'sound': '#5c6b73',
}

CAT_LABELS_JA = {
    'photo': '写真', 'illustration': 'イラスト', 'icon': 'アイコン',
    'music': '音楽', 'video': '動画', 'font': 'フォント',
    '3d': '3Dモデル', 'template': 'テンプレート', 'texture': 'テクスチャ',
    'asset': 'ゲーム素材', 'mockup': 'モックアップ', 'archive': '総合素材',
    'sound': '効果音',
}


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def add_noise(img, opacity=0.03):
    """Add subtle noise texture."""
    pixels = img.load()
    w, h = img.size
    random.seed(42)  # consistent noise
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if random.random() < 0.3:
                r, g, b = pixels[x, y]
                delta = random.randint(-8, 8)
                pixels[x, y] = (
                    max(0, min(255, r + delta)),
                    max(0, min(255, g + delta)),
                    max(0, min(255, b + delta))
                )


def generate_placeholder(site_id, site_name, category, output_path):
    color = CAT_COLORS.get(category, '#8b8589')
    rgb = hex_to_rgb(color)

    img = Image.new('RGB', (WIDTH, HEIGHT), rgb)
    draw = ImageDraw.Draw(img)

    # Add noise texture
    add_noise(img)

    # Left accent line (2px white, full height)
    draw.rectangle([(0, 0), (2, HEIGHT)], fill=(255, 255, 255, 180))

    # Load fonts
    try:
        font_name = ImageFont.truetype('C:/Windows/Fonts/NotoSansJP-VF.ttf', 28)
    except:
        try:
            font_name = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 28)
        except:
            font_name = ImageFont.load_default()

    try:
        font_cat = ImageFont.truetype('C:/Windows/Fonts/NotoSansJP-VF.ttf', 12)
    except:
        try:
            font_cat = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12)
        except:
            font_cat = ImageFont.load_default()

    # Site name (centered, slightly above middle)
    display_name = site_name if len(site_name) <= 22 else site_name[:20] + '...'
    bbox = draw.textbbox((0, 0), display_name, font=font_name)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (WIDTH - tw) // 2
    y = (HEIGHT - th) // 2 - 20
    draw.text((x, y), display_name, fill=(255, 255, 255), font=font_name)

    # Category label (bottom-left, small, semi-transparent)
    cat_label = CAT_LABELS_JA.get(category, category)
    # Mix with background: 0.7 opacity white on the bg color
    cat_r = int(rgb[0] * 0.3 + 255 * 0.7)
    cat_g = int(rgb[1] * 0.3 + 255 * 0.7)
    cat_b = int(rgb[2] * 0.3 + 255 * 0.7)
    draw.text((16, HEIGHT - 30), cat_label, fill=(cat_r, cat_g, cat_b), font=font_cat)

    img.save(output_path, 'PNG')


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(SITES_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sites = sorted(data['sites'], key=lambda s: s.get('rating', 0), reverse=True)
    top50 = sites[:50]

    generated = 0
    for site in top50:
        name = site.get('name', {})
        display_name = name.get('en', name.get('ja', site['id'])) if isinstance(name, dict) else str(name)
        category = site.get('category', 'archive')
        output_path = os.path.join(OUTPUT_DIR, f'{site["id"]}.png')

        generate_placeholder(site['id'], display_name, category, output_path)
        generated += 1
        print(f'  Generated: {site["id"]}.png')

    print(f'\nDone! Regenerated {generated} editorial-style placeholder images.')


if __name__ == '__main__':
    main()
