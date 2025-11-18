# 🚀 Guide de Démarrage - MoovUp Now

Guide rapide pour démarrer avec MoovUp Now.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js 18+** - [Télécharger](https://nodejs.org/)
- **npm** ou **yarn**
- **Git** - [Télécharger](https://git-scm.com/)
- **Expo CLI** - `npm install -g expo-cli`

### Comptes à créer

- **Supabase** (gratuit) - [supabase.com](https://supabase.com)
- **Mapbox** (gratuit) - [mapbox.com](https://mapbox.com)
- **Stripe** (optionnel pour le MVP) - [stripe.com](https://stripe.com)

---

## 🏗️ Installation

### 1. Cloner le repository

```bash
git clone <repo-url>
cd moveup
```

### 2. Installer les dépendances

```bash
cd mobile
npm install
```

### 3. Configuration Supabase

#### a. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'**URL** et la **clé anon** du projet

#### b. Appliquer le schéma de base de données

1. Dans Supabase, aller dans **SQL Editor**
2. Copier le contenu de `supabase/migrations/001_initial_schema.sql`
3. Coller et exécuter dans l'éditeur SQL
4. Copier le contenu de `supabase/seed.sql`
5. Coller et exécuter pour ajouter les données de test

### 4. Configuration Mapbox

1. Créer un compte sur [mapbox.com](https://mapbox.com)
2. Créer un nouveau token d'accès
3. Noter le token

### 5. Variables d'environnement

```bash
cd mobile
cp .env.example .env
```

Éditer `.env` et ajouter vos clés :

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoixxxxx...
```

---

## 🎯 Lancer l'application

### Mode développement

```bash
cd mobile
npm start
```

Vous verrez un QR code. Plusieurs options :

#### Option 1 : Sur téléphone réel (recommandé)

1. Installer **Expo Go** sur votre téléphone :
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scanner le QR code avec :
   - **iOS** : Camera app
   - **Android** : Expo Go app

#### Option 2 : Émulateur iOS (Mac uniquement)

```bash
npm run ios
```

#### Option 3 : Émulateur Android

```bash
npm run android
```

#### Option 4 : Web (pour tester rapidement)

```bash
npm run web
```

---

## 🧭 Navigation dans l'app

### Écrans disponibles (MVP)

L'application démarre sur l'écran d'authentification avec :

1. **Auth Landing** - Page d'accueil
2. **Sign In** - Connexion (placeholder)
3. **Sign Up** - Inscription (placeholder)

Ensuite, les 5 onglets principaux :

| Onglet | Description |
|--------|-------------|
| 🏠 **Accueil** | Dashboard, prochaines séances |
| 🔍 **Trouver** | Carte et recherche de partenaires |
| 🎯 **Objectifs** | Suivi de progression, coaching |
| 🎒 **Boutique** | Produits MoovUp Now |
| 👤 **Profil** | Profil utilisateur, QR code |

---

## 📦 Structure du projet

```
moveup/
├── README.md                    # Documentation principale
├── SPECIFICATIONS.md            # Cahier des charges complet
├── GETTING_STARTED.md          # Ce fichier
│
├── mobile/                     # Application React Native
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── screens/            # Écrans de l'app
│   │   ├── navigation/         # Navigation
│   │   ├── services/           # API, Supabase
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utilitaires
│   │   ├── theme/              # Design system
│   │   ├── constants/          # Constantes
│   │   └── assets/             # Images, fonts
│   ├── App.tsx                 # Point d'entrée
│   ├── .env.example            # Template variables env
│   └── package.json            # Dépendances
│
└── supabase/                   # Backend configuration
    ├── migrations/             # Migrations SQL
    │   └── 001_initial_schema.sql
    └── seed.sql               # Données de test
```

---

## 🛠️ Prochaines étapes de développement

### Phase 1 : MVP (en cours)

- [x] Architecture et setup initial
- [x] Design system
- [x] Navigation de base
- [x] Écrans placeholders
- [ ] **À faire** :
  - [ ] Authentification complète (Supabase Auth)
  - [ ] Onboarding utilisateur
  - [ ] Création de profil avec QR code
  - [ ] Carte interactive (Mapbox)
  - [ ] Création et matching de séances
  - [ ] Scan de QR code
  - [ ] Système de points et badges

### Phase 2 : Features avancées

- [ ] Coaching IA
- [ ] Chat entre utilisateurs
- [ ] Paiements (Stripe)
- [ ] Notifications push
- [ ] Boutique complète

### Phase 3 : Production

- [ ] Tests end-to-end
- [ ] Optimisations performances
- [ ] Soumission App Store / Play Store

---

## 🐛 Dépannage

### Problème : "Module not found"

```bash
cd mobile
rm -rf node_modules
npm install
```

### Problème : Metro bundler bloqué

```bash
npx expo start -c
```

### Problème : "Cannot connect to Expo Go"

1. Vérifier que le téléphone et l'ordinateur sont sur le **même réseau Wi-Fi**
2. Désactiver les VPN
3. Redémarrer Expo avec `npm start`

### Problème : Supabase connection failed

1. Vérifier que les variables d'environnement sont correctes dans `.env`
2. Vérifier que le projet Supabase est bien actif
3. Tester la connexion dans l'éditeur SQL Supabase

---

## 📚 Ressources

### Documentation

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Supabase](https://supabase.com/docs)
- [Mapbox](https://docs.mapbox.com/)

### Tutoriels utiles

- [Supabase Auth with React Native](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [Mapbox with React Native](https://github.com/rnmapbox/maps)
- [QR Code with React Native](https://www.npmjs.com/package/react-native-qrcode-svg)

---

## 🆘 Besoin d'aide ?

- Consulter `SPECIFICATIONS.md` pour le cahier des charges complet
- Consulter `mobile/README.md` pour la doc technique de l'app
- Vérifier les issues GitHub (si configuré)

---

**MoovUp Now** - Bouge maintenant. Pas demain. 💪

Bon développement ! 🚀
