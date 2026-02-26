from pathlib import Path
from PIL import Image

src = Path('assets/kah-digital-logo/lux/kah-digital-lux-a-dark.png')
if not src.exists():
    raise SystemExit(f'File not found: {src}')

img = Image.open(src).convert('RGBA')
pix = img.load()

# Replace near-black background with transparent
threshold = 18
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pix[x, y]
        if r <= threshold and g <= threshold and b <= threshold:
            pix[x, y] = (r, g, b, 0)

out = src.with_name('kah-digital-lux-a-transparent.png')
img.save(out)
print('Generated', out)
