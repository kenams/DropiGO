# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

out_dir = Path('assets/kah-digital-logo/lux')
out_dir.mkdir(parents=True, exist_ok=True)

W, H = 2400, 1200

# Palette (lux)
BLACK = (9, 9, 9, 255)
TRANSPARENT = (0, 0, 0, 0)
GOLD_TOP = (252, 230, 164, 255)   # #FCE6A4
GOLD_MID = (226, 196, 120, 255)   # #E2C478
GOLD_BOT = (156, 111, 34, 255)    # #9C6F22
GOLD_LINE = (188, 146, 52, 255)   # #BC9234
IVORY = (235, 229, 217, 255)

font_bold = r'C:\\Windows\\Fonts\\timesbd.ttf'
font_reg = r'C:\\Windows\\Fonts\\times.ttf'


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


wordmark_font = load_font(font_bold, 150)
wordmark_font_small = load_font(font_bold, 110)
monogram_font = load_font(font_bold, 360)


def vertical_gradient(size, top, mid, bottom):
    w, h = size
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    for y in range(h):
        t = y / max(h - 1, 1)
        if t < 0.5:
            tt = t / 0.5
            r = int(top[0] + (mid[0] - top[0]) * tt)
            g = int(top[1] + (mid[1] - top[1]) * tt)
            b = int(top[2] + (mid[2] - top[2]) * tt)
        else:
            tt = (t - 0.5) / 0.5
            r = int(mid[0] + (bottom[0] - mid[0]) * tt)
            g = int(mid[1] + (bottom[1] - mid[1]) * tt)
            b = int(mid[2] + (bottom[2] - mid[2]) * tt)
        img.putpixel((0, y), (r, g, b, 255))
    return img.resize(size)


def apply_gradient_text(base, text, position, font, gradient):
    mask = Image.new('L', base.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.text(position, text, font=font, fill=255)

    grad = gradient.copy()
    if grad.size != base.size:
        grad = grad.resize(base.size)

    text_layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    text_layer = Image.composite(grad, text_layer, mask)

    # subtle shadow
    shadow_layer = Image.new('RGBA', base.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_draw.text((position[0] + 4, position[1] + 6), text, font=font, fill=(0, 0, 0, 120))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(6))

    base.alpha_composite(shadow_layer)
    base.alpha_composite(text_layer)


def draw_ring(draw, center, radius, width=6):
    cx, cy = center
    for i in range(width):
        draw.ellipse((cx - radius + i, cy - radius + i, cx + radius - i, cy + radius - i), outline=GOLD_LINE)


def save_png(img, name):
    img.save(out_dir / name, format='PNG')


def concept_a(bg):
    img = Image.new('RGBA', (W, H), bg)
    draw = ImageDraw.Draw(img)

    cx, cy, r = 520, 600, 300
    draw_ring(draw, (cx, cy), r, width=7)

    grad = vertical_gradient((W, H), GOLD_TOP, GOLD_MID, GOLD_BOT)
    apply_gradient_text(img, 'K', (cx - 120, cy - 215), monogram_font, grad)

    apply_gradient_text(img, 'Kah-Digital', (920, 520), wordmark_font, grad)
    draw.line((920, 700, 1800, 700), fill=GOLD_LINE, width=4)

    return img


def concept_b(bg):
    img = Image.new('RGBA', (W, H), bg)
    draw = ImageDraw.Draw(img)
    grad = vertical_gradient((W, H), GOLD_TOP, GOLD_MID, GOLD_BOT)

    text = 'Kah-Digital'
    bbox = draw.textbbox((0, 0), text, font=wordmark_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (W - tw) // 2
    y = (H - th) // 2 - 30

    apply_gradient_text(img, text, (x, y), wordmark_font, grad)
    draw.line((x, y + th + 30, x + tw, y + th + 30), fill=GOLD_LINE, width=3)

    return img


def concept_c(bg):
    img = Image.new('RGBA', (W, H), bg)
    draw = ImageDraw.Draw(img)
    grad = vertical_gradient((W, H), GOLD_TOP, GOLD_MID, GOLD_BOT)

    # crest
    cx, cy, size = 520, 500, 300
    diamond = [(cx, cy - size), (cx + size, cy), (cx, cy + size), (cx - size, cy)]
    draw.polygon(diamond, outline=GOLD_LINE, width=6)
    apply_gradient_text(img, 'K', (cx - 120, cy - 215), monogram_font, grad)

    apply_gradient_text(img, 'Kah-Digital', (900, 520), wordmark_font_small, grad)
    draw.text((900, 650), 'Creative Studio', font=wordmark_font_small, fill=IVORY)

    return img


def save_svg(name, svg):
    (out_dir / name).write_text(svg, encoding='utf-8')


def svg_a():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCE6A4"/>
      <stop offset="50%" stop-color="#E2C478"/>
      <stop offset="100%" stop-color="#9C6F22"/>
    </linearGradient>
  </defs>
  <rect width="2400" height="1200" fill="transparent"/>
  <circle cx="520" cy="600" r="300" fill="none" stroke="#BC9234" stroke-width="7"/>
  <text x="400" y="680" font-family="Times New Roman, serif" font-size="360" font-weight="700" fill="url(#gold)">K</text>
  <text x="920" y="650" font-family="Times New Roman, serif" font-size="150" font-weight="700" fill="url(#gold)">Kah-Digital</text>
  <line x1="920" y1="700" x2="1800" y2="700" stroke="#BC9234" stroke-width="4"/>
</svg>'''
    save_svg('kah-digital-lux-a.svg', svg)


def svg_b():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCE6A4"/>
      <stop offset="50%" stop-color="#E2C478"/>
      <stop offset="100%" stop-color="#9C6F22"/>
    </linearGradient>
  </defs>
  <rect width="2400" height="1200" fill="transparent"/>
  <text x="650" y="650" font-family="Times New Roman, serif" font-size="150" font-weight="700" fill="url(#gold)">Kah-Digital</text>
  <line x1="650" y1="710" x2="1750" y2="710" stroke="#BC9234" stroke-width="3"/>
</svg>'''
    save_svg('kah-digital-lux-b.svg', svg)


def svg_c():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200" viewBox="0 0 2400 1200">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FCE6A4"/>
      <stop offset="50%" stop-color="#E2C478"/>
      <stop offset="100%" stop-color="#9C6F22"/>
    </linearGradient>
  </defs>
  <rect width="2400" height="1200" fill="transparent"/>
  <polygon points="520,200 820,500 520,800 220,500" fill="none" stroke="#BC9234" stroke-width="6"/>
  <text x="400" y="680" font-family="Times New Roman, serif" font-size="360" font-weight="700" fill="url(#gold)">K</text>
  <text x="900" y="620" font-family="Times New Roman, serif" font-size="110" font-weight="700" fill="url(#gold)">Kah-Digital</text>
  <text x="900" y="740" font-family="Times New Roman, serif" font-size="100" fill="#EBE5D9">Creative Studio</text>
</svg>'''
    save_svg('kah-digital-lux-c.svg', svg)


# Generate PNGs
for suffix, bg in [('dark', BLACK), ('transparent', TRANSPARENT)]:
    concept_a(bg).save(out_dir / f'kah-digital-lux-a-{suffix}.png')
    concept_b(bg).save(out_dir / f'kah-digital-lux-b-{suffix}.png')
    concept_c(bg).save(out_dir / f'kah-digital-lux-c-{suffix}.png')

# SVGs
svg_a()
svg_b()
svg_c()

print('Generated lux logos in', out_dir)
