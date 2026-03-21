#!/usr/bin/env python3
"""Generate placeholder card images for top 50 sites."""

import json
import os
from PIL import Image, ImageDraw, ImageFont

SITES_JSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'sites.json')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'images', 'screenshots')
WIDTH, HEIGHT = 600, 400
RADIUS = 12

# Category color gradients (top color, bottom color)
CAT_COLORS = {
    'photo':        ('#1e3a5f', '#2980b9'),
    'illustration': ('#8e2457', '#e91e8c'),
    'icon':         ('#1a5e3a', '#27ae60'),
    'music':        ('#4a1a6b', '#8e44ad'),
    'video':        ('#7e3d0e', '#e67e22'),
    'font':         ('#0e4e5e', '#16a085'),
    '3d':           ('#1a1a6b', '#3f51b5'),
    'template':     ('#6b1a3a', '#c0392b'),
    'texture':      ('#2c3e50', '#607d8b'),
    'asset':        ('#1a4a1a', '#4caf50'),
    'mockup':       ('#4a3520', '#795548'),
    'archive':      ('#34495e', '#7f8c8d'),
    'sound':        ('#3a1a5e', '#9b59b6'),
}

CAT_LABELS_JA = {
    'photo': '写真', 'illustration': 'イラスト', 'icon': 'アイコン',
    'music': '音楽', 'video': '動画', 'font': 'フォント',
    '3d': '3Dモデル', 'template': 'テンプレート', 'texture': 'テクスチャ',
    'asset': 'ゲーム素材', 'mockup': 'モックアップ', 'archive': '総合素材',
    'sound': '効果音',
}

def round_rectangle(draw, xy, radius, fill):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    draw.rectangle([x0+radius, y0, x1-radius, y1], fill=fill)
    draw.rectangle([x0, y0+radius, x1, y1-radius], fill=fill)
    draw.pieslice([x0, y0, x0+2*radius, y0+2*radius], 180, 270, fill=fill)
    draw.pieslice([x1-2*radius, y0, x1, y0+2*radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1-2*radius, x0+2*radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1-2*radius, y1-2*radius, x1, y1], 0, 90, fill=fill)


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def create_gradient(width, height, top_color, bottom_color):
    """Create a vertical gradient image."""
    img = Image.new('RGB', (width, height))
    r1, g1, b1 = hex_to_rgb(top_color)
    r2, g2, b2 = hex_to_rgb(bottom_color)
    for y in range(height):
        ratio = y / height
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        for x in range(width):
            img.putpixel((x, y), (r, g, b))
    return img


def generate_placeholder(site_id, site_name, category, output_path):
    """Generate a single placeholder image."""
    colors = CAT_COLORS.get(category, ('#333', '#666'))
    img = create_gradient(WIDTH, HEIGHT, colors[0], colors[1])
    draw = ImageDraw.Draw(img)

    # Apply rounded corners by creating a mask
    mask = Image.new('L', (WIDTH, HEIGHT), 0)
    mask_draw = ImageDraw.Draw(mask)
    round_rectangle(mask_draw, (0, 0, WIDTH, HEIGHT), RADIUS, 255)

    # Create white background and paste gradient with mask
    bg = Image.new('RGB', (WIDTH, HEIGHT), (255, 255, 255))
    bg.paste(img, mask=mask)
    img = bg
    draw = ImageDraw.Draw(img)

    # Try to load fonts
    try:
        font_name = ImageFont.truetype('C:/Windows/Fonts/NotoSansJP-VF.ttf', 36)
    except:
        try:
            font_name = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 36)
        except:
            font_name = ImageFont.load_default()

    try:
        font_cat = ImageFont.truetype('C:/Windows/Fonts/NotoSansJP-VF.ttf', 20)
    except:
        try:
            font_cat = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 20)
        except:
            font_cat = ImageFont.load_default()

    # Draw site name (centered)
    # Handle long names by truncating
    display_name = site_name if len(site_name) <= 20 else site_name[:18] + '...'
    bbox = draw.textbbox((0, 0), display_name, font=font_name)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (WIDTH - tw) // 2
    y = (HEIGHT - th) // 2 - 20
    draw.text((x, y), display_name, fill='white', font=font_name)

    # Draw category label (bottom center)
    cat_label = CAT_LABELS_JA.get(category, category)
    bbox2 = draw.textbbox((0, 0), cat_label, font=font_cat)
    tw2 = bbox2[2] - bbox2[0]
    x2 = (WIDTH - tw2) // 2
    y2 = HEIGHT - 60
    # Draw label background pill
    pill_pad = 12
    draw.rounded_rectangle(
        [x2 - pill_pad, y2 - 4, x2 + tw2 + pill_pad, y2 + (bbox2[3] - bbox2[1]) + 4],
        radius=12, fill=(255, 255, 255, 40)
    )
    draw.text((x2, y2), cat_label, fill=(255, 255, 255, 200), font=font_cat)

    img.save(output_path, 'PNG')


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with open(SITES_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Sort by rating, take top 50
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
        print(f'  Generated: {site["id"]}.png ({display_name})')

    # Update sites.json: add screenshot field to top 50
    top50_ids = set(s['id'] for s in top50)
    for site in data['sites']:
        if site['id'] in top50_ids:
            site['screenshot'] = f'images/screenshots/{site["id"]}.png'

    with open(SITES_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'\nDone! Generated {generated} placeholder images.')
    print(f'Updated sites.json with screenshot field for {len(top50_ids)} sites.')


if __name__ == '__main__':
    main()
