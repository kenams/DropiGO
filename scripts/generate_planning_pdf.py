# -*- coding: utf-8 -*-
from pathlib import Path
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, Image as RLImage
from PIL import Image

out_path = Path('reports/DroPiPeche-Planning-Kah-Digital-2026-02-26-v4.pdf')
logo_path = Path('assets/kah-digital-logo/Logo elegant Kah-Digital transparent.png')

font_regular = r'C:\\Windows\\Fonts\\segoeui.ttf'
font_bold = r'C:\\Windows\\Fonts\\segoeuib.ttf'

pdfmetrics.registerFont(TTFont('SegoeUI', font_regular))
pdfmetrics.registerFont(TTFont('SegoeUI-Bold', font_bold))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='DP_Title', fontName='SegoeUI-Bold', fontSize=20, leading=24, textColor=colors.HexColor('#0B1A2B')))
styles.add(ParagraphStyle(name='DP_SubTitle', fontName='SegoeUI', fontSize=11, leading=14, textColor=colors.HexColor('#3D4B5C')))
styles.add(ParagraphStyle(name='DP_Section', fontName='SegoeUI-Bold', fontSize=12.5, leading=16, textColor=colors.HexColor('#0B1A2B'), spaceBefore=6))
styles.add(ParagraphStyle(name='DP_Body', fontName='SegoeUI', fontSize=10.5, leading=14, textColor=colors.HexColor('#1E2A38')))
styles.add(ParagraphStyle(name='DP_Bullet', fontName='SegoeUI', fontSize=10.5, leading=14, textColor=colors.HexColor('#1E2A38'), leftIndent=10, bulletIndent=4))


def p(text, style='DP_Body'):
    return Paragraph(text, styles[style])


def week_range(start_week, end_week):
    return f"S{start_week}–S{end_week}"


plan = [
    ("Cadrage & specs finales", 1, 2,
     "Spécifications validées, choix PSP/KYC, règles métiers figées."),
    ("Backend core", 3, 8,
     "Auth, profils, lots, commandes, panier, statuts, notifications, logs."),
    ("Paiement séquestre", 9, 12,
     "Intégration PSP, webhooks, états transactionnels, tests cas limites."),
    ("KYC + registres officiels", 13, 16,
     "SIRENE/INSEE, registre navires, workflow vérif, scoring."),
    ("GPS / ETA", 17, 20,
     "Tracking, historique positions, ETA, états bateau."),
    ("Back-office web", 21, 24,
     "Admin, litiges, supervision, exports."),
    ("Durcissement apps mobiles", 25, 29,
     "QA, performances, UX final, corrections."),
    ("Pré-prod & release", 30, 32,
     "Sécurité, tests E2E, publication stores, monitoring."),
]

story = []
if logo_path.exists():
    with Image.open(logo_path) as img:
        lw, lh = img.size
    ratio = lw / lh if lh else 1
    max_w = 60 * mm
    max_h = 28 * mm
    w = min(max_w, max_h * ratio)
    h = w / ratio
    logo = RLImage(str(logo_path), width=w, height=h)
else:
    logo = Paragraph('', styles['DP_Body'])

header_table = Table(
    [
        [
            Paragraph('DroPiPeche — Planning de réalisation', styles['DP_Title']),
            logo,
        ],
        [
            Paragraph('KAH-DIGITAL — Keita Namake Kenams', styles['DP_SubTitle']),
            Paragraph('Date : 26/02/2026', styles['DP_SubTitle']),
        ],
    ],
    colWidths=[120 * mm, 60 * mm],
)
header_table.setStyle(
    TableStyle(
        [
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]
    )
)

story.append(header_table)
story.append(Spacer(1, 6))
story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#D5DBE3')))
story.append(Spacer(1, 10))

story.append(p('Hypothèses', 'DP_Section'))
for it in [
    'Rythme: 1 développeur, 8h/jour, 5j/semaine.',
    'APIs tiers (PSP, SIRENE/INSEE, registre navires) disponibles et stables.',
    'Périmètre conforme au devis v1 (MVP).',
]:
    story.append(Paragraph(it, styles['DP_Bullet'], bulletText='•'))

story.append(Spacer(1, 6))

story.append(p('Planning indicatif (32 semaines)', 'DP_Section'))

# Table
rows = [[
    Paragraph('Phase', styles['DP_Body']),
    Paragraph('Période', styles['DP_Body']),
    Paragraph('Livrables clés', styles['DP_Body'])
]]
for title, w1, w2, desc in plan:
    rows.append([
        Paragraph(title, styles['DP_Body']),
        Paragraph(week_range(w1, w2), styles['DP_Body']),
        Paragraph(desc, styles['DP_Body']),
    ])

table = Table(rows, colWidths=[62*mm, 45*mm, 75*mm])
table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EEF2F7')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0B1A2B')),
    ('FONTNAME', (0,0), (-1,0), 'SegoeUI-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 10),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D5DBE3')),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FAFBFD')]),
]))

story.append(table)

story.append(Spacer(1, 10))

story.append(p('Buffer recommandé', 'DP_Section'))
for it in [
    'Ajouter 2 semaines de marge pour retours client et aléas fournisseurs.',
    'Toute évolution hors périmètre fera l’objet d’un avenant.',
]:
    story.append(Paragraph(it, styles['DP_Bullet'], bulletText='•'))



doc = SimpleDocTemplate(
    str(out_path),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=16 * mm,
    bottomMargin=16 * mm,
    title='DroPiPeche — Planning de réalisation',
    author='KAH-DIGITAL'
)

doc.build(story)
print('Generated', out_path)
