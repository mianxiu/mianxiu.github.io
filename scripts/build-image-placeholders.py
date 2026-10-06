"""Generate tiny, source-derived mosaics. Run again after adding site images.

Requires Pillow. Full-size remote images are read into memory, never committed.
Use --proxy http://127.0.0.1:7897 only if your network needs a proxy.
"""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from io import BytesIO
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
from urllib.request import ProxyHandler, build_opener

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]


class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get('class', '').split()
        if any(c in classes for c in ('_banner', 'preview-img', 'gallery-link')):
            self.sources.update(re.findall(r'url\([\"\']?([^\)\"\']+)', attrs.get('style', '')))
        if tag == 'img' and attrs.get('src'):
            self.sources.add(attrs['src'])


def source_key(source):
    parsed = urlsplit(source)
    if parsed.netloc:
        if parsed.netloc != 'img.mianxiu.me':
            return None
        return 'https://img.mianxiu.me' + parsed.path
    path = '/' + parsed.path.lstrip('./')
    return path if path.startswith('/gallery/') else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--proxy')
    args = parser.parse_args()
    images = Images()
    for folder in ('essay', 'gallery'):
        for file in (ROOT / folder).rglob('*.html'):
            images.feed(file.read_text(encoding='utf-8'))
    sources = sorted({key for src in images.sources if (key := source_key(src))})
    opener = build_opener(ProxyHandler({'http': args.proxy, 'https': args.proxy} if args.proxy else {}))

    def generate(source):
        try:
            if source.startswith('https:'):
                with opener.open(source, timeout=25) as response:
                    data = response.read()
            else:
                file = (ROOT / unquote(source).lstrip('/')).resolve()
                if not file.is_relative_to(ROOT):
                    raise ValueError('Image path outside site')
                data = file.read_bytes()
            with Image.open(BytesIO(data)) as original:
                original.seek(0)  # GIF placeholders use the first frame; playback stays original.
                image = ImageOps.exif_transpose(original).convert('RGB')
                width, height = image.size
                small = image.resize((16, max(1, round(16 * height / width))), Image.Resampling.BOX)
                mosaic = small.resize((256, max(1, round(256 * height / width))), Image.Resampling.NEAREST)
                output = BytesIO()
                mosaic.save(output, format='PNG', optimize=True)
                png = 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode('ascii')
                # Keep the original intrinsic dimensions for img layout, without wrappers.
                svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><image width="{width}" height="{height}" href="{png}"/></svg>'
                return source, {'width': width, 'height': height, 'preview': 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode('ascii')}
        except Exception as error:
            print('Skipped:', source, str(error), flush=True)
            return source, None

    with ThreadPoolExecutor(max_workers=6) as pool:
        entries = dict((key, value) for key, value in pool.map(generate, sources) if value)
    destination = ROOT / 'assets' / 'image-placeholders.json'
    destination.write_text(json.dumps(entries, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'Generated {len(entries)}/{len(sources)} source mosaics, {destination.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
