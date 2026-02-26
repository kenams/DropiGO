# -*- coding: utf-8 -*-
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

note_path = Path('reports/DroPiPeche-Note-Fonctionnement-2026-02-25.md')
out_path = Path('reports/DroPiPeche-Note-Fonctionnement-2026-02-25.pdf')

font_regular = r'C:\\Windows\\Fonts\\segoeui.ttf'
font_bold = r'C:\\Windows\\Fonts\\segoeuib.ttf'

pdfmetrics.registerFont(TTFont('SegoeUI', font_regular))
pdfmetrics.registerFont(TTFont('SegoeUI-Bold', font_bold))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='DP_Title', fontName='SegoeUI-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#0B1A2B')))
styles.add(ParagraphStyle(name='DP_SubTitle', fontName='SegoeUI', fontSize=11, leading=14, textColor=colors.HexColor('#3D4B5C')))
styles.add(ParagraphStyle(name='DP_Section', fontName='SegoeUI-Bold', fontSize=12.5, leading=16, textColor=colors.HexColor('#0B1A2B'), spaceBefore=6))
styles.add(ParagraphStyle(name='DP_Body', fontName='SegoeUI', fontSize=10.5, leading=14, textColor=colors.HexColor('#1E2A38')))
styles.add(ParagraphStyle(name='DP_Bullet', fontName='SegoeUI', fontSize=10.5, leading=14, textColor=colors.HexColor('#1E2A38'), leftIndent=10, bulletIndent=4))


def p(text, style='DP_Body'):
    return Paragraph(text, styles[style])


lines = note_path.read_text(encoding='utf-8').splitlines()

story = []
first_title = True

for line in lines:
    raw = line.strip()
    if not raw:
        story.append(Spacer(1, 6))
        continue
    if raw.startswith('# '):
        title = raw[2:].strip()
        story.append(p(title, 'DP_Title'))
        story.append(Spacer(1, 4))
        story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#D5DBE3')))
        story.append(Spacer(1, 10))
        first_title = False
        continue
    if raw.startswith('## '):
        story.append(p(raw[3:].strip(), 'DP_Section'))
        story.append(Spacer(1, 2))
        continue
    if raw.startswith('- '):
        bullet_text = raw[2:].strip()
        story.append(Paragraph(bullet_text, styles['DP_Bullet'], bulletText='•'))
        continue
    story.append(p(raw, 'DP_Body'))

if not story:
    story.append(p('Note indisponible.', 'DP_Body'))


doc = SimpleDocTemplate(
    str(out_path),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=16 * mm,
    bottomMargin=16 * mm,
    title='DroPiPeche - Note de fonctionnement',
    author='DroPiPeche'
)

doc.build(story)
print('Generated', out_path)
