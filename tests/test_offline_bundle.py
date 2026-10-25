import base64
import hashlib
import importlib.util
import re
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_offline', ROOT / 'scripts/build_offline.py')
bundle = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bundle)

class OfflineBundleTests(unittest.TestCase):
    def test_encoding_declaration_fits_in_first_1024_bytes_without_http_headers(self):
        raw = bundle.render().encode('utf-8')
        declaration = b'<meta charset="utf-8">'
        self.assertLessEqual(raw.index(declaration) + len(declaration), 1024)

    def test_inline_bytes_match_csp_and_have_no_loadable_dependencies(self):
        page = bundle.render()
        for pattern in (r'<script type="module">(.*?)</script>', r'<style>(.*?)</style>'):
            blocks = re.findall(pattern, page, re.S)
            self.assertEqual(len(blocks), 1)
            digest = base64.b64encode(hashlib.sha256(blocks[0].encode()).digest()).decode()
            self.assertIn("'sha256-" + digest + "'", page)
        self.assertIn("connect-src 'none'", page)
        self.assertNotIn('unsafe-inline', page)
        self.assertNotRegex(page, r'<script[^>]+src=|<link[^>]+rel="stylesheet"')
        self.assertNotIn("from './record.mjs'", page)
        self.assertIn((ROOT / 'LICENSE').read_text(), page)

    def test_offline_links_are_explicit_online_destinations(self):
        page = bundle.render()
        links = re.findall(r'href="([^"]+)"', page)
        self.assertTrue(all(link.startswith('https://') for link in links), links)
        self.assertIn('https://note.com/smartcareviz/n/naf463e2cc4cb', links)
        self.assertNotIn('id="offline-download"', page)
        self.assertIn('商品紹介やサイトへのリンクを開くと、インターネットに接続します。', page)

    def test_checked_in_bundle_tracks_source_changes(self):
        original = bundle.render()
        self.assertEqual((ROOT / bundle.OUTPUT).read_text(), original)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(ROOT / 'docs/adopted-version', root / 'docs/adopted-version')
            shutil.copyfile(ROOT / 'LICENSE', root / 'LICENSE')
            style = root / 'docs/adopted-version/style.css'
            style.write_text(style.read_text() + '\n/* fixture */\n')
            self.assertNotEqual(bundle.render(root), original)

    def test_tag_breakouts_and_external_styles_are_rejected(self):
        for name, addition in [('app.js', '\n// </sCrIpT>'), ('style.css', '\n/* </STYLE> */'), ('style.css', '\n@import "https://example.invalid/font";')]:
            with self.subTest(name=name, addition=addition), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                shutil.copytree(ROOT / 'docs/adopted-version', root / 'docs/adopted-version')
                shutil.copyfile(ROOT / 'LICENSE', root / 'LICENSE')
                path = root / 'docs/adopted-version' / name
                path.write_text(path.read_text() + addition)
                with self.assertRaises(ValueError):
                    bundle.render(root)

if __name__ == '__main__':
    unittest.main()
