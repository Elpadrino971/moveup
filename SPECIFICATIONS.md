# 📋 CAHIER DES CHARGES COMPLET — Application Mobile "MoovUp Now"

## 🌟 Objectif du projet

Créer une application mobile de mise en relation sportive sécurisée, motivante, gamifiée et communautaire. "MoovUp Now" incite les utilisateurs à bouger à deux ou en groupe, en toute confiance, tout en suivant des objectifs personnels et collectifs.

---

## 📚 I. Fonctionnalités principales

### 1. Onboarding & profil utilisateur

**Onboarding (première connexion)**
- Questions initiales :
  - Objectif sportif (perte de poids, cardio, muscu, bien-être, etc.)
  - Disponibilités (matin, midi, soir, weekend)
  - Sports favoris (running, HIIT, yoga, boxe, etc.)
  - Préférences de partenaire (sexe, zone géographique, type de sport)
- **Charte de comportement à valider** (obligatoire)
- Création du profil :
  - Photo de profil
  - Pseudo
  - Bio courte
  - Badge de fiabilité
  - Historique (nombre de séances effectuées)
  - **QR code personnel** généré automatiquement

**Profil utilisateur**
- Affichage :
  - Photo, pseudo, âge, ville
  - Sports pratiqués + niveau
  - Objectifs actuels
  - Badges obtenus
  - Journal d'intégrité : `"0 avertissement / 4 séances / vérifié"`
  - QR code scannable
- Édition :
  - Modifier bio, photo, disponibilités
  - Gérer les préférences de match

---

### 2. Géolocalisation & recherche

**Carte interactive**
- Technologie : Mapbox ou Google Maps
- Affichage :
  - Utilisateurs disponibles autour (dans un rayon défini)
  - Séances en cours ou planifiées
  - Lieux publics partenaires (parcs, salles, terrains)

**Filtres de recherche**
- Sport
- Niveau (débutant, intermédiaire, avancé)
- Distance (1km, 5km, 10km, 20km)
- Disponibilités (maintenant, aujourd'hui, cette semaine)
- Utilisateurs vérifiés uniquement (badge)

**Fonctionnalités carte**
- Voir profil en cliquant sur un marqueur
- Proposer une séance directement
- Enregistrer un lieu favori

---

### 3. Match & organisation de séance

**Proposition de séance**
- Créer une séance :
  - Sport
  - Lieu (carte + adresse)
  - Date et heure
  - Durée estimée
  - Niveau requis
  - Nombre de participants (1 binôme ou groupe)
  - Message optionnel

**Matching**
- Algorithme de matching basé sur :
  - Proximité géographique
  - Sports en commun
  - Objectifs similaires
  - Disponibilités concordantes
  - Historique de fiabilité
- **Confirmation mutuelle obligatoire**

**Validation sur place**
- Chaque participant scanne le QR code de l'autre
- Débloque :
  - Points de récompense
  - Badge de présence
  - Possibilité d'évaluer après la séance

---

### 4. Coaching & progression

**Objectifs personnalisés**
- Cardio, muscu, perte de poids, bien-être, etc.
- Objectifs hebdo/mensuels
- Suivi de progression (graphiques)

**Séances guidées**
- Vidéos d'exercices
- Plans d'entraînement
- Audio coaching pendant la séance

**Coaching IA**
- Suggestions basées sur :
  - Historique d'activité
  - Objectifs
  - Météo
  - Disponibilité
- Messages motivants

**Coaching humain (premium)**
- Accès à des coachs certifiés
- Chat en direct
- Plans personnalisés

---

### 5. Récompenses & shop

**Système de points**
- Gagner des points via :
  - Assiduité (séances complétées)
  - Évaluations positives
  - Objectifs atteints
  - Parrainage

**Boutique intégrée**
- Produits MoovUp Now :
  - T-shirts avec QR code intégré
  - Brassards
  - Gourdes brandées
  - Patches QR
- Produits partenaires :
  - Nutrition sportive
  - Équipement
- Modes de paiement :
  - Points accumulés
  - Paiement classique (Stripe)

**Badges & niveaux**
- Système de gamification :
  - Niveau 1 → 10 (Novice → Legend)
  - Badges spéciaux : "Early bird", "Social butterfly", "Iron will", etc.
  - Affichage sur le profil

---

### 6. Communauté & modération

**Groupes locaux**
- Par ville ou quartier
- Par sport
- Chat de groupe
- Organisation de sessions collectives

**Journal d'intégrité**
- Visible sur chaque profil :
  - Nombre d'avertissements
  - Nombre de séances effectuées
  - Statut de vérification (email, téléphone, photo)

**Système de signalement**
- Bouton signalement sur :
  - Tous les profils
  - Toutes les séances
  - Tous les messages
- Types de signalement :
  - Comportement inapproprié
  - Annulation répétée
  - Harcèlement
  - Faux profil
- **Action automatique** :
  - 1 signalement → vérification
  - 3 signalements → suspension temporaire
  - 5 signalements → bannissement

**Enregistrement des discussions**
- Messages stockés et modérables
- Détection automatique de contenu inapproprié
- Alertes éthiques

---

## 🔍 II. Navigation principale

```
┌────────────────────────────────────────────┐
│  🏠 Accueil │ 🔍 Trouver │ 🎯 Objectifs │ 🎒 Shop │ 👤 Profil  │
└────────────────────────────────────────────┘
```

### Détail des onglets

**🏠 Accueil**
- Prochaine séance planifiée
- Suggestions de partenaires
- Objectif en cours (barre de progression)
- Notifications récentes
- Séances recommandées

**🔍 Trouver**
- Carte interactive
- Liste d'utilisateurs disponibles
- Filtres
- Créer une séance

**🎯 Objectifs**
- Objectif actuel
- Routine du jour
- Suivi hebdomadaire
- Accès coaching
- Historique de progression

**🎒 Boutique**
- Produits disponibles
- Points accumulés
- Badges débloqués
- Historique d'achats

**👤 Profil**
- QR code personnel
- Éditer le profil
- Paramètres
- Statistiques
- Journal d'intégrité

---

## 💡 III. Maquettes et UX/UI

### Style visuel

**Couleurs**
- Primaire : Bleu roi `#0047FF`
- Secondaire : Violet `#7B2FFF`
- Fond : Blanc `#FFFFFF`
- Texte : Noir `#1A1A1A`
- Accent : Or `#FFD700` (badges, "Now")
- Touches : Fluo (vert, rose) pour les notifications et actions

**Typographie**
- Titres : **Inter Bold** ou **Poppins Bold**
- Corps : **Inter Regular** ou **Roboto**
- Taille : lisible, moderne, aérée

**Iconographie**
- Style : flat, moderne
- Éléments clés :
  - Badge/étoile pour vérification
  - QR code
  - Flèche "Now" (dynamique)
  - Timer/chrono
  - Localisation

### Écrans clés

**Page d'accueil**
- Header : "Bonjour [Prénom] 👋"
- Card "Prochaine séance" (grande, visuelle)
- Section "Suggestions" (cartes utilisateurs)
- Objectif du jour (barre progression)

**Carte (Trouver)**
- Map full screen
- Bouton filtres (floating)
- Marqueurs utilisateurs
- Card preview en bas (swipe up pour détails)

**Page profil (autre utilisateur)**
- Photo header
- Pseudo + badges
- Bio
- Sports + niveau
- Journal d'intégrité
- Bouton "Proposer une séance"
- Bouton "Signaler"

**Coaching**
- Routine du jour
- Vidéos/plans
- Suivi hebdo (graphiques)
- Coachs disponibles (premium)

**Boutique**
- Grid de produits
- Points affichés en haut
- Filtres : "Déblocables" / "À acheter"
- Product cards avec image + prix

---

## 🚀 IV. MVP (version minimale viable)

### Fonctionnalités essentielles

1. **Onboarding utilisateur**
   - Inscription/connexion (email, Google, Apple)
   - Questions de profil
   - Charte à valider

2. **Création de séances**
   - Formulaire simple
   - Sélection lieu sur carte

3. **Matching**
   - Affichage utilisateurs disponibles
   - Proposition/acceptation de séance

4. **Carte interactive**
   - Géolocalisation
   - Marqueurs utilisateurs

5. **QR code séance**
   - Génération automatique
   - Scan pour validation

6. **Historique + points**
   - Nombre de séances
   - Points gagnés
   - Badges basiques

7. **Boutique simple**
   - Affichage produits
   - (Paiement optionnel au départ)

8. **Signalement + charte**
   - Bouton signalement
   - Charte obligatoire

### Ce qui peut attendre (v2)

- Coaching IA avancé
- Groupes et chat
- Vidéos d'exercices
- Paiements intégrés
- Partenariats salles

---

## 💪 V. Branding & positionnement

### Slogan principal
**"Bouge maintenant. Pas demain."**

### Autres accroches
- "À deux, c'est mieux."
- "MoovUp Now : la sécurité avant tout."
- "Le sport en confiance."
- "Trouve ton binôme. Atteins tes objectifs."

### Ton de communication
- Sérieux mais énergique
- Inclusif (tous niveaux, tous âges)
- Motivant sans être agressif
- Axé sécurité et respect
- Non sexuel, non drague

### Persona cible
- Prénom : Sophie, 28 ans
- Profil : Active, souhaite se remettre au sport mais manque de motivation seule
- Peur : Se faire harceler, rencontrer des gens louches
- Besoin : Un partenaire fiable, un cadre sécurisé, des objectifs clairs

---

## 🌐 VI. Cibles prioritaires

1. **Jeunes adultes 18–35 ans**
   - Urbains, actifs, connectés
   - Cherchent motivation et lien social

2. **Femmes sportives**
   - Priorité sécurité
   - Besoin de cadre safe

3. **Utilisateurs urbains / semi-urbains**
   - Accès à des lieux publics
   - Connectivité réseau

4. **Coachs sportifs freelance**
   - Monétisation via la plateforme
   - Visibilité locale

5. **Salles de sport partenaires**
   - Référencement sur la carte
   - Partenariats commerciaux

---

## 👨‍💼 VII. Business model

### Freemium
- **Gratuit** :
  - Création de profil
  - Recherche et match
  - Séances illimitées
  - Points et badges basiques
  - Chat

- **Premium (9,99€/mois)** :
  - Coaching humain
  - Statistiques avancées
  - Visibilité boostée
  - Badges exclusifs
  - Pas de pub

### Vente de produits
- Tenues brandées (t-shirts, brassards, gourdes)
- Marges : 30–50%
- Drop shipping ou stock propre

### Partenariats
- Salles de sport : commission sur abonnements
- Marques nutrition : affiliation
- Événements sportifs : sponsoring

### Abonnement premium
- Coaching personnalisé
- Plans d'entraînement avancés
- Support prioritaire

---

## 🔐 VIII. Règles éthiques & sécurité

### Règles strictes

1. **Aucun contact hors plateforme avant validation**
   - Pas de numéro de téléphone partagé
   - Pas de réseaux sociaux avant séance validée (QR scanné)

2. **Sanctions automatiques**
   - 3 signalements → vérification manuelle ou exclusion temporaire
   - 5 signalements → bannissement définitif

3. **Lieux publics privilégiés**
   - Recommandation de lieux ouverts, sécurisés
   - Alerte si lieu isolé sélectionné

4. **Mixité contrôlée**
   - Choix du sexe du binôme lors de l'onboarding
   - Respect strict des préférences

5. **Affichage du passé comportemental**
   - Journal d'intégrité visible pour tous
   - Transparence totale

### Mesures techniques

- **Chiffrement** des messages
- **Modération automatique** (IA)
- **Enregistrement** des conversations (RGPD compliant)
- **Bouton panique** (alerte + géolocalisation envoyée à contacts d'urgence)

---

## 🧪 IX. Tests & validation

### Tests utilisateurs (MVP)
- 20 bêta-testeurs
- Feedback sur :
  - Onboarding
  - Facilité de match
  - Sécurité perçue
  - UX/UI

### KPIs à suivre
- Nombre d'inscriptions
- Taux de conversion (inscription → première séance)
- Taux de rétention (J7, J30)
- Nombre de séances par utilisateur
- Taux de signalement
- NPS (Net Promoter Score)

---

## 📅 X. Planning de développement

### Phase 1 - MVP (3 mois)
- Architecture & setup
- Design system
- Onboarding + profil
- Géolocalisation + carte
- Matching + séances
- QR code
- Système de points
- Boutique basique

### Phase 2 - Features (2 mois)
- Coaching IA
- Groupes
- Chat amélioré
- Paiements Stripe
- Vidéos d'exercices

### Phase 3 - Scale (ongoing)
- Optimisations
- Partenariats
- Marketing
- Expansion géographique

---

## ✅ Checklist de lancement

- [ ] App mobile iOS + Android
- [ ] Backend Supabase configuré
- [ ] Design system complet
- [ ] Onboarding fonctionnel
- [ ] Géolocalisation testée
- [ ] QR codes testés
- [ ] Système de signalement actif
- [ ] Charte légale validée
- [ ] CGU/CGV/Politique de confidentialité
- [ ] 20 bêta-testeurs recrutés
- [ ] Feedback collecté et intégré
- [ ] Monitoring (Sentry, Analytics)
- [ ] Soumission App Store + Google Play

---

**MoovUp Now** — Bouge maintenant. Pas demain. 💪
