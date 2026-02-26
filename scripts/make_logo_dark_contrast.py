from pathlib import Path
from PIL import Image

src = Path('assets/kah-digital-logo/lux/kah-digital-lux-a-transparent.png')
if not src.exists():
    raise SystemExit(f'File not found: {src}')

img = Image.open(src).convert('RGBA')
pix = img.load()

# Deep gold for maximum contrast on white
DARK_GOLD = (92, 62, 18)  # #5C3E12

for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pix[x, y]
        if a == 0:
            continue
        pix[x, y] = (DARK_GOLD[0], DARK_GOLD[1], DARK_GOLD[2], a)

out = src.with_name('kah-digital-lux-a-transparent-dark.png')
img.save(out)
print('Generated', out)
