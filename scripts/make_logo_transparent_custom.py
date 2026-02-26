from pathlib import Path
from PIL import Image

src = Path(r"C:\Users\kenam\Application-Projet-K\DropiGO\assets\kah-digital-logo\Logo élégant de Kah-Digital.png")
if not src.exists():
    raise SystemExit(f'File not found: {src}')

img = Image.open(src).convert('RGBA')
px = img.load()

# Remove black background with soft threshold
threshold = 22
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = px[x, y]
        if r <= threshold and g <= threshold and b <= threshold:
            px[x, y] = (r, g, b, 0)

out = src.with_name('Logo elegant Kah-Digital transparent.png')
img.save(out)
print('Generated', out)
