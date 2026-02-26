from pathlib import Path
from PIL import Image

src = Path('assets/kah-digital-logo/lux/kah-digital-lux-a-transparent.png')
if not src.exists():
    raise SystemExit(f'File not found: {src}')

img = Image.open(src).convert('RGBA')
pix = img.load()

BLACK = (0, 0, 0)

for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pix[x, y]
        if a == 0:
            continue
        pix[x, y] = (BLACK[0], BLACK[1], BLACK[2], a)

out = src.with_name('kah-digital-lux-a-transparent-black.png')
img.save(out)
print('Generated', out)
