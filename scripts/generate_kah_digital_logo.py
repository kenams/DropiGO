# -*- coding: utf-8 -*-
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

out_dir = Path('assets/kah-digital-logo')
out_dir.mkdir(parents=True, exist_ok=True)

# Colors
GOLD = (214, 178, 94, 255)  # #D6B25E
GOLD_DARK = (176, 140, 52, 255)  # #B08C34
OFFWHITE = (240, 236, 228, 255)
BLACK = (0, 0, 0, 0)  # transparent

# Canvas
W, H = 2000, 1000

# Fonts
font_bold = r'C:\\Windows\\Fonts\\cambriaz.ttf'
font_reg = r'C:\\Windows\\Fonts\\cambria.ttc'


def load_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


wordmark_font = load_font(font_bold, 140)
wordmark_font_small = load_font(font_bold, 90)
monogram_font = load_font(font_bold, 320)


def save_png(img, name):
    img.save(out_dir / name, format='PNG')


def concept_a():
    img = Image.new('RGBA', (W, H), BLACK)
    draw = ImageDraw.Draw(img)

    # Circle + K monogram
    cx, cy, r = 420, 500, 260
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=GOLD, width=8)
    draw.text((cx - 95, cy - 180), 'K', font=monogram_font, fill=GOLD)

    # Wordmark
    draw.text((760, 430), 'Kah-Digital', font=wordmark_font, fill=GOLD)
    draw.line((760, 610, 1500, 610), fill=GOLD_DARK, width=4)

    save_png(img, 'kah-digital-logo-a.png')


def concept_b():
    img = Image.new('RGBA', (W, H), BLACK)
    draw = ImageDraw.Draw(img)

    # Wordmark centered
    text = 'Kah-Digital'
    bbox = draw.textbbox((0, 0), text, font=wordmark_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (W - tw) // 2
    y = (H - th) // 2 - 40
    draw.text((x, y), text, font=wordmark_font, fill=GOLD)

    # Minimal underline + accent dot
    draw.line((x, y + th + 20, x + tw, y + th + 20), fill=GOLD_DARK, width=4)
    draw.ellipse((x - 24, y - 10, x - 4, y + 10), fill=GOLD)

    save_png(img, 'kah-digital-logo-b.png')


def concept_c():
    img = Image.new('RGBA', (W, H), BLACK)
    draw = ImageDraw.Draw(img)

    # Diamond crest
    cx, cy = 500, 450
    size = 260
    diamond = [(cx, cy - size), (cx + size, cy), (cx, cy + size), (cx - size, cy)]
    draw.polygon(diamond, outline=GOLD, width=8)
    draw.text((cx - 85, cy - 170), 'K', font=monogram_font, fill=GOLD)

    # Wordmark below
    draw.text((900, 420), 'Kah-Digital', font=wordmark_font_small, fill=GOLD)
    draw.text((900, 520), 'Creative Studio', font=wordmark_font_small, fill=OFFWHITE)

    save_png(img, 'kah-digital-logo-c.png')


def save_svg(name, svg):
    (out_dir / name).write_text(svg, encoding='utf-8')


def svg_a():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1000" viewBox="0 0 2000 1000">
  <rect width="2000" height="1000" fill="transparent"/>
  <circle cx="420" cy="500" r="260" fill="none" stroke="#D6B25E" stroke-width="8"/>
  <text x="325" y="600" font-family="Cambria, 'Times New Roman', serif" font-size="320" font-weight="700" fill="#D6B25E">K</text>
  <text x="760" y="560" font-family="Cambria, 'Times New Roman', serif" font-size="140" font-weight="700" fill="#D6B25E">Kah-Digital</text>
  <line x1="760" y1="610" x2="1500" y2="610" stroke="#B08C34" stroke-width="4"/>
</svg>'''
    save_svg('kah-digital-logo-a.svg', svg)


def svg_b():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1000" viewBox="0 0 2000 1000">
  <rect width="2000" height="1000" fill="transparent"/>
  <text x="520" y="560" font-family="Cambria, 'Times New Roman', serif" font-size="140" font-weight="700" fill="#D6B25E">Kah-Digital</text>
  <line x1="520" y1="610" x2="1480" y2="610" stroke="#B08C34" stroke-width="4"/>
  <circle cx="480" cy="520" r="10" fill="#D6B25E"/>
</svg>'''
    save_svg('kah-digital-logo-b.svg', svg)


def svg_c():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1000" viewBox="0 0 2000 1000">
  <rect width="2000" height="1000" fill="transparent"/>
  <polygon points="500,190 760,450 500,710 240,450" fill="none" stroke="#D6B25E" stroke-width="8"/>
  <text x="415" y="560" font-family="Cambria, 'Times New Roman', serif" font-size="320" font-weight="700" fill="#D6B25E">K</text>
  <text x="900" y="520" font-family="Cambria, 'Times New Roman', serif" font-size="90" font-weight="700" fill="#D6B25E">Kah-Digital</text>
  <text x="900" y="620" font-family="Cambria, 'Times New Roman', serif" font-size="80" fill="#F0ECE4">Creative Studio</text>
</svg>'''
    save_svg('kah-digital-logo-c.svg', svg)


concept_a()
concept_b()
concept_c()
svg_a()
svg_b()
svg_c()

print('Generated logos in', out_dir)
