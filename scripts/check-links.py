#!/usr/bin/env python3
"""Weekly link checker for freesozo.com - checks all site URLs in sites.json"""

import json
import sys
import os
import time
from datetime import datetime, timezone

import requests

SITES_JSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'sites.json')
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), '..', 'broken_links.json')
TIMEOUT = 10
USER_AGENT = 'freesozo-link-checker/1.0'
HEADERS = {'User-Agent': USER_AGENT}


def check_url(url):
    """Check a single URL. Returns (status_code, error_message)."""
    try:
        resp = requests.head(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True, verify=True)
        if resp.status_code < 400:
            return resp.status_code, None
        # Some servers reject HEAD, try GET
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True, verify=True, stream=True)
        resp.close()
        if resp.status_code < 400:
            return resp.status_code, None
        return resp.status_code, f'HTTP {resp.status_code}'
    except requests.exceptions.SSLError as e:
        return None, f'SSL Error: {str(e)[:100]}'
    except requests.exceptions.Timeout:
        return None, f'Timeout ({TIMEOUT}s)'
    except requests.exceptions.ConnectionError as e:
        return None, f'Connection Error: {str(e)[:100]}'
    except Exception as e:
        return None, f'Error: {str(e)[:100]}'


def main():
    with open(SITES_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sites = data.get('sites', [])
    print(f'Checking {len(sites)} sites...')

    broken = []
    checked = 0
    start_time = time.time()

    for site in sites:
        url = site.get('url', '')
        site_id = site.get('id', 'unknown')
        name = site.get('name', {})
        display_name = name.get('ja', name.get('en', site_id)) if isinstance(name, dict) else str(name)

        if not url:
            continue

        status, error = check_url(url)
        checked += 1

        if error:
            print(f'  BROKEN: {display_name} ({url}) - {error}')
            broken.append({
                'id': site_id,
                'name': display_name,
                'url': url,
                'status': status,
                'error': error,
                'checked_at': datetime.now(timezone.utc).isoformat()
            })
        else:
            print(f'  OK: {display_name} ({status})')

        # Rate limiting
        time.sleep(0.5)

    elapsed = time.time() - start_time

    result = {
        'checked_at': datetime.now(timezone.utc).isoformat(),
        'total_checked': checked,
        'total_broken': len(broken),
        'elapsed_seconds': round(elapsed, 1),
        'broken_links': broken
    }

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f'\nDone: {checked} checked, {len(broken)} broken in {elapsed:.1f}s')
    print(f'Results saved to {OUTPUT_JSON}')

    if broken:
        print('\n=== BROKEN LINKS SUMMARY ===')
        for b in broken:
            print(f'  - {b["name"]}: {b["url"]} ({b["error"]})')
        sys.exit(1)
    else:
        print('\nAll links are healthy!')
        sys.exit(0)


if __name__ == '__main__':
    main()
