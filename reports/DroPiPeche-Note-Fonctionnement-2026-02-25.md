# DroPiPeche — Note de fonctionnement (démo)
Date : 25/02/2026

## Accès (comptes de démo)
- Acheteur : acheteur@dropipeche.demo / demo123
- Pêcheur : pecheur@dropipeche.demo / demo123
- Admin : admin@dropipeche.demo / admin123

## Rôles et accès
- Admin : accès total (back-office + vues acheteur/pêcheur).
- Acheteur : réservations, panier, suivi, conformité, favoris, messages.
- Pêcheur : publication, réservations reçues, statut bateau, MAJ GPS, remise.
- UI verrouillée : actions non autorisées masquées selon le rôle.

## Parcours acheteur (démo)
1. Voir les pêches disponibles + filtres.
2. Détail annonce → réserver ou ajouter au panier.
3. Paiement séquestré (démo) + bon de retrait.
4. Suivi commande (ETA, statut, carte).
5. Validation conformité, puis déblocage paiement.

## Parcours pêcheur (démo)
1. Publication d’une annonce avec photo et position.
2. Réservations reçues : confirmer/refuser.
3. Déclarer arrivée + MAJ GPS + statut (en mer / approche / arrivé).
4. Confirmer la remise de marchandise.

## Admin (démo)
- KPIs : transactions, séquestres, litiges.
- Accès rapide aux vues acheteur/pêcheur.

## Carte & navigation
- Carte légère OpenStreetMap (sans clé).
- Ouverture Waze si dispo, sinon Google Maps.

## Remarques
- Mode démo sans backend temps réel.
- Stockage KYC et synchro Supabase activables ensuite.

