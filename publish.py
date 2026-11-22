"""Set absolute social share URL metadata before publishing to GitHub Pages.

Usage:
    python publish.py https://YOUR-USERNAME.github.io/portfolio/

This script updates index.html and intentionally only uses a real URL provided
by the site owner. Social crawlers do not resolve relative og:image URLs.
"""
from pathlib import Path
import sys
from urllib.parse import urlsplit
from html import escape

if len(sys.argv) != 2:
    raise SystemExit('Usage: python publish.py https://your-actual-site.example/portfolio/')
url = sys.argv[1].strip().rstrip('/') + '/'
parts = urlsplit(url)
if parts.scheme != 'https' or not parts.netloc or parts.username or parts.password:
    raise SystemExit('Provide the final, public HTTPS site URL, including any repository path.')

html_path = Path(__file__).resolve().parent/'index.html'
html = html_path.read_text(encoding='utf-8')
start = '  <!-- Before publishing: run python publish.py https://YOUR-REAL-DOMAIN/portfolio/ to add absolute og:url and og:image values. -->'
meta = f'  <meta property="og:url" content="{escape(url, quote=True)}">\n  <meta property="og:image" content="{escape(url + "assets/social-preview.png", quote=True)}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">'
if start in html:
    html = html.replace(start, meta)
else:
    import re
    html, count = re.subn(r'  <meta property="og:url"[^>]*>\n  <meta property="og:image"[^>]*>\n  <meta property="og:image:width"[^>]*>\n  <meta property="og:image:height"[^>]*>',lambda match:meta,html,count=1)
    if not count: raise SystemExit('Cannot find social metadata block. Edit index.html manually.')
html_path.write_text(html,encoding='utf-8')
print('Updated og:url and og:image with absolute URL:',url)
