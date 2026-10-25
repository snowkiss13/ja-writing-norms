"""Bundle the existing record tool into one offline HTML file, with CSP hashes."""
import argparse
import base64
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path('docs/adopted-version-offline.html')
HOME = 'https://snowkiss13.github.io/ja-writing-norms/'

def replace_once(source, old, new):
    if source.count(old) != 1:
        raise ValueError('Expected exactly one template marker: ' + old)
    return source.replace(old, new)

def csp_hash(source):
    return 'sha256-' + base64.b64encode(hashlib.sha256(source.encode('utf-8')).digest()).decode('ascii')

def render(root=ROOT):
    source = root / 'docs/adopted-version'
    page = (source / 'index.html').read_text()
    css = '\n' + (source / 'style.css').read_text() + '\n'
    record = re.sub(r'(?m)^export ', '', (source / 'record.mjs').read_text())
    app = replace_once((source / 'app.js').read_text(), "import {fields, markdown, validation} from './record.mjs';", '')
    script = '\n' + record + '\n' + app + '\n'
    # Closing raw-text tags would end the element before its CSP-protected bytes.
    if re.search(r'</script', script, re.I) or re.search(r'</style', css, re.I):
        raise ValueError('Source contains a raw-text closing tag')
    if re.search(r'@import|url\s*\(', css, re.I):
        raise ValueError('Offline styles must not load external resources')
    page = replace_once(page, '<link rel="stylesheet" href="style.css">', '<style>' + css + '</style>')
    page = replace_once(page, '<script type="module" src="app.js"></script>', '<script type="module">' + script + '</script>')
    page = replace_once(page, "script-src 'self'; style-src 'self'", "script-src '" + csp_hash(script) + "'; style-src '" + csp_hash(css) + "'")
    page = replace_once(page, '無料ツール | ja-writing-norms</title>', '無料ツール（オフライン版） | ja-writing-norms</title>')
    page = replace_once(page, '<p class="eyebrow">無料の記入ツール</p>', '<p class="eyebrow">無料の記入ツール（オフライン版）</p>')
    marker = re.findall(r'<p id="offline-download">.*?</p>', page, re.S)
    if len(marker) != 1:
        raise ValueError('Expected one offline-download paragraph')
    page = replace_once(page, marker[0], '<p class="privacy">保存したHTMLファイルだけで記入と記録の保存ができます。商品紹介やサイトへのリンクを開くと、インターネットに接続します。</p>')
    page = page.replace('href="../"', 'href="' + HOME + '"')
    license_text = (root / 'LICENSE').read_text()
    if '-->' in license_text:
        raise ValueError('License cannot be embedded as an HTML comment')
    page = replace_once(page, '<meta charset="utf-8">', '<meta charset="utf-8">\n<!--\n' + license_text + '-->')
    return page

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='fail if the checked-in bundle is missing or stale')
    args = parser.parse_args()
    generated = render().encode('utf-8')
    path = ROOT / OUTPUT
    if args.check:
        if not path.exists() or path.read_bytes() != generated:
            raise SystemExit('Offline HTML is stale. Run python3 scripts/build_offline.py')
        print('Offline HTML matches its sources')
    else:
        path.write_bytes(generated)
        print(str(OUTPUT))

if __name__ == '__main__':
    main()
