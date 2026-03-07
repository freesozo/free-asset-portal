#!/usr/bin/env python3
"""
Auto-discover and add new free asset sites from the discovery pool.
Picks 3-5 candidates per run, validates URLs, adds to sites.json.
"""

import json
import random
import ssl
import urllib.request
from datetime import date

DATA_DIR = "data"
SITES_FILE = f"{DATA_DIR}/sites.json"
POOL_FILE = f"{DATA_DIR}/discovery-pool.json"
MAX_PICKS = 5
TIMEOUT = 15
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def validate_url(url):
    """Try HEAD then GET request to check if URL is live."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(
                url,
                method=method,
                headers={"User-Agent": USER_AGENT},
            )
            resp = urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx)
            code = resp.getcode()
            if 200 <= code < 400:
                return True, code
        except Exception:
            continue

    return False, None


def candidate_to_site(candidate, today_str):
    """Convert a discovery-pool candidate to a sites.json site entry."""
    site = {
        "id": candidate["id"],
        "name": candidate["name"],
        "url": candidate["url"],
        "category": candidate["category"],
        "useCases": candidate.get("useCases", []),
        "description": candidate["description"],
        "highlight": candidate["highlight"],
        "commercial": candidate.get("commercial", True),
        "creditRequired": candidate.get("creditRequired", False),
        "registrationRequired": candidate.get("registrationRequired", False),
        "beginnerFriendly": candidate.get("beginnerFriendly", True),
        "rating": candidate.get("rating", 3),
        "tags": candidate.get("tags", []),
        "dateAdded": today_str,
    }
    return site


def sort_sites(sites):
    """Sort sites by category, then by rating descending."""
    return sorted(sites, key=lambda s: (s.get("category", ""), -s.get("rating", 0)))


def main():
    # Load data
    sites_data = load_json(SITES_FILE)
    pool_data = load_json(POOL_FILE)

    sites = sites_data.get("sites", [])
    candidates = pool_data.get("candidates", [])

    # Get existing site IDs
    existing_ids = {s["id"] for s in sites}

    # Filter: not processed AND not already in sites
    available = [
        c for c in candidates
        if not c.get("processed", False) and c["id"] not in existing_ids
    ]

    if not available:
        print("Discovery pool exhausted. Please replenish.")
        return

    # Pick up to MAX_PICKS random candidates
    picks = random.sample(available, min(MAX_PICKS, len(available)))
    today_str = date.today().isoformat()

    added_names = []
    failed_count = 0

    for candidate in picks:
        name = candidate["name"]
        display_name = name.get("en", name.get("ja", candidate["id"])) if isinstance(name, dict) else name
        url = candidate["url"]

        print(f"Checking: {display_name} ({url})...", end=" ")

        is_live, code = validate_url(url)

        # Find the candidate in the pool list and mark it
        for c in candidates:
            if c["id"] == candidate["id"]:
                c["processed"] = True
                if is_live:
                    print(f"OK ({code})")
                    site_entry = candidate_to_site(candidate, today_str)
                    sites.append(site_entry)
                    added_names.append(display_name)
                else:
                    print("FAILED")
                    c["failed"] = True
                    failed_count += 1
                break

    # Sort sites and save
    sites_data["sites"] = sort_sites(sites)
    save_json(SITES_FILE, sites_data)

    pool_data["candidates"] = candidates
    save_json(POOL_FILE, pool_data)

    # Summary
    if added_names:
        print(f"\nAdded {len(added_names)} new sites: {', '.join(added_names)}. Failed: {failed_count}.")
    else:
        print(f"\nAdded 0 new sites. Failed: {failed_count}.")


if __name__ == "__main__":
    main()
