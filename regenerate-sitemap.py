#!/usr/bin/env python3
"""
Regenerate sitemap.xml for freesozo.com, including all blog articles.
Usage: py regenerate-sitemap.py
"""

import json
import os
import glob

BASE_URL = "https://freesozo.com"
base_dir = os.path.dirname(os.path.abspath(__file__))

# Load sites
with open(os.path.join(base_dir, "data", "sites.json"), "r", encoding="utf-8") as f:
    data = json.load(f)

sites = data["sites"]

categories = [
    "illustration", "photo", "music", "sound", "video", "icon",
    "texture", "asset", "mockup", "archive", "font", "3d", "template"
]

urls = []

# 1. Main pages
urls.append(("index.html", "weekly", "1.0"))
urls.append(("privacy.html", "monthly", "0.3"))

# 2. Category pages
for cat in categories:
    urls.append((f"category.html?cat={cat}", "weekly", "0.7"))

# 3. Detail pages
seen_ids = set()
for s in sites:
    sid = s["id"]
    if sid not in seen_ids:
        urls.append((f"detail.html?id={sid}", "monthly", "0.6"))
        seen_ids.add(sid)

# 4. Blog pages
blog_dir = os.path.join(base_dir, "blog")
if os.path.isdir(blog_dir):
    # Blog index
    urls.append(("blog/index.html", "weekly", "0.8"))
    # Blog articles
    for html_file in sorted(glob.glob(os.path.join(blog_dir, "*.html"))):
        fname = os.path.basename(html_file)
        if fname == "index.html":
            continue
        urls.append((f"blog/{fname}", "monthly", "0.7"))

# 5. Go page
urls.append(("go.html", "monthly", "0.2"))

# Build XML
xml_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
xml_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
for path, freq, priority in urls:
    xml_lines.append(f"  <url><loc>{BASE_URL}/{path}</loc><changefreq>{freq}</changefreq><priority>{priority}</priority></url>")
xml_lines.append("</urlset>")

sitemap_path = os.path.join(base_dir, "sitemap.xml")
with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write("\n".join(xml_lines) + "\n")

print(f"Sitemap generated: {len(urls)} URLs written to sitemap.xml")
