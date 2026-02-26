# -*- coding: utf-8 -*-
from pathlib import Path
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image
from pypdf import PdfReader, PdfWriter

logo_path = Path('assets/kah-digital-logo/Logo elegant Kah-Digital transparent.png')
input_pdf = Path('DEVIS/DEVIS_DROPIPECHE-v1.pdf')
output_pdf = Path('DEVIS/DEVIS_DROPIPECHE-v1-logo-v4.pdf')

if not logo_path.exists():
    raise SystemExit(f'Logo not found: {logo_path}')
if not input_pdf.exists():
    raise SystemExit(f'PDF not found: {input_pdf}')

logo_reader = ImageReader(str(logo_path))
with Image.open(logo_path) as img:
    lw, lh = img.size
ratio = lw / lh if lh else 1

reader = PdfReader(str(input_pdf))
writer = PdfWriter()

for page in reader.pages:
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)

    overlay = BytesIO()
    c = canvas.Canvas(overlay, pagesize=(width, height))

    # Place logo top-right with margin, keep aspect ratio
    max_w = width * 0.22
    max_h = height * 0.08
    logo_w = min(max_w, max_h * ratio)
    logo_h = logo_w / ratio
    margin = width * 0.04
    x = width - logo_w - margin
    y = height - logo_h - margin
    c.drawImage(logo_reader, x, y, width=logo_w, height=logo_h, mask='auto')
    c.save()

    overlay.seek(0)
    overlay_pdf = PdfReader(overlay)
    page.merge_page(overlay_pdf.pages[0])
    writer.add_page(page)

with open(output_pdf, 'wb') as f:
    writer.write(f)

print('Generated', output_pdf)
