# -*- coding: utf-8 -*-
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

out_path = Path('reports/DroPiPeche-Statut-2026-02-22.pdf')

font_regular = r'C:\\Windows\\Fonts\\segoeui.ttf'
font_bold = r'C:\\Windows\\Fonts\\segoeuib.ttf'

pdfmetrics.registerFont(TTFont('SegoeUI', font_regular))
pdfmetrics.registerFont(TTFont('SegoeUI-Bold', font_bold))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='DP_Title', fontName='SegoeUI-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#0B1A2B')))
styles.add(ParagraphStyle(name='DP_SubTitle', fontName='SegoeUI', fontSize=11, leading=14, textColor=colors.HexColor('#3D4B5C')))
styles.add(ParagraphStyle(name='DP_Section', fontName='SegoeUI-Bold', fontSize=12.5, leading=16, textColor=colors.HexColor('#0B1A2B'), spaceBefore=8))
styles.add(ParagraphStyle(name='DP_Body', fontName='SegoeUI', fontSize=10.5, leading=14, textColor=colors.HexColor('#1E2A38')))


def p(text, style='DP_Body'):
    return Paragraph(text, styles[style])


def section(title):
    return [Spacer(1, 6), p(title, 'DP_Section'), Spacer(1, 2)]


story = []

story.append(p('DroPiPeche - Statut du projet', 'DP_Title'))
story.append(p('Date : 22/02/2026', 'DP_SubTitle'))
story.append(Spacer(1, 6))
story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#D5DBE3')))

story.append(Spacer(1, 10))

story += section('1. Synthese (executif)')
story.append(p('Le prototype fonctionnel est prêt pour démonstration côté acheteur et pêcheur, avec une interface unifiée, des scénarios de test et des flux principaux simulés.', 'DP_Body'))
story.append(p('Le système de vérification 100 % automatique (KYC + registres officiels) est modélisé côté application ; l’intégration backend (Supabase, PSP, registres officiels) reste à brancher pour la mise en production.', 'DP_Body'))

story += section('2. Perimetre couvert (demo realiste sans backend)')
items = [
    'Parcours création de compte avec choix du rôle (Acheteur / Pêcheur).',
    'Statuts KYC visibles (PENDING / VERIFIED / REJECTED) avec scénarios de démonstration.',
    'Pages Acheteur : offres en mer, filtres, panier, réservations, suivi, profil.',
    'Pages Pêcheur : publication des prises, commandes, validation, profil.',
    'Navigation complète, retour sur pages clés, corrections de scroll et zone sûre (Android/iOS).',
    'Design unifié : fond chalutier, logo officiel, palette bleue transparente, typographies renforcées.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))

story += section('3. Verification 100 % automatique (France)')
story.append(p('Objectif : zéro validation manuelle. Tous les comptes sont bloqués tant que la vérification n’est pas validée côté backend.', 'DP_Body'))
items = [
    'Acheteurs : vérification via API officielle SIRENE/INSEE (SIRET actif, APE cohérent).',
    'Pêcheurs : registre officiel des navires + KYC PSP (identité + IBAN).',
    'Blocage automatique des tentatives frauduleuses + journalisation.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))

story += section('4. Paiement sequestre et compensation (specification)')
items = [
    'Paiement en ligne obligatoire, argent bloqué jusqu’à validation de la livraison.',
    'Règles de compensation prévues si retard/annulation (acheteur ou pêcheur).',
    'Interface de litiges préparée pour arbitrage et décisions automatiques/assistées.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))

story += section('5. Carte et navigation')
items = [
    'Ouverture directe Waze si disponible, sinon Google Maps.',
    'ETA et statut des bateaux affichés dans la démo.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))

story += section('6. Tests realises')
items = [
    'Compilation TypeScript sans erreurs.',
    'Tests manuels Android : navigation, scroll, formulaires, scénarios KYC.',
    'APK de démonstration disponible pour tests mobiles.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))

story += section('7. Points restants pour production')
items = [
    'Intégration Supabase (auth, stockage, base de données, sécurité).',
    'Connexion aux API officielles SIRENE/INSEE et registre des navires.',
    'Intégration PSP pour KYC et paiement séquestré.',
    'Traçabilité complète + logs + back office admin avancé.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))

story += section('8. Prochaine etape proposee')
items = [
    'Créer le projet Supabase et établir les schémas de données.',
    'Brancher authentification + stockage de documents KYC.',
    'Connecter les APIs officielles pour vérification automatique.',
]
for it in items:
    story.append(p(f'- {it}', 'DP_Body'))


doc = SimpleDocTemplate(
    str(out_path),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=16 * mm,
    bottomMargin=16 * mm,
    title='DroPiPeche - Statut du projet',
    author='DroPiPeche'
)

doc.build(story)
print('Generated', out_path)
