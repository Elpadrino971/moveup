# 🏃‍♂️ MoovUp Now

> **Bouge maintenant. Pas demain.**

Application mobile de mise en relation sportive sécurisée, motivante et communautaire.

## 🎯 Vision

Connecter les gens pour faire du sport ensemble de manière sécurisée et motivante. Une application hybride entre un coach personnel, une communauté sportive locale, et un outil social safe pour progresser à deux ou en groupe.

## ✨ Fonctionnalités principales

- 👥 **Match sportif** - Trouve ton binôme par affinité, objectif et localisation
- 📍 **Géolocalisation** - Vois les utilisateurs disponibles autour de toi
- 🎯 **Suivi des objectifs** - Défis personnels, progression gamifiée
- 🧠 **Coaching IA** - Suggestions d'exercices personnalisés
- 🛡️ **Sécurité maximale** - Signalement, QR codes, journal d'intégrité
- 🛍️ **Shop intégré** - Tenues MoovUp Now et produits sportifs
- 🧬 **Communauté dynamique** - Groupes, sessions, récompenses

## 🛠️ Stack Technique

### Frontend Mobile
- **React Native** + **Expo** (SDK 50+)
- **TypeScript** pour la sécurité du code
- **React Navigation** pour la navigation
- **Mapbox** pour la géolocalisation
- **React Query** pour la gestion des données

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Redis** pour la géolocalisation temps réel
- **Stripe** pour les paiements

### Services
- **Mapbox** - Cartographie
- **Firebase Cloud Messaging** - Notifications push
- **Cloudinary** - Gestion d'images
- **Sentry** - Monitoring d'erreurs

## 📁 Structure du projet

```
moovup-now/
├── mobile/                # Application React Native
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── screens/       # Écrans de l'app
│   │   ├── navigation/    # Configuration navigation
│   │   ├── services/      # Services API, Supabase
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # Types TypeScript
│   │   ├── utils/         # Utilitaires
│   │   ├── theme/         # Couleurs, design system
│   │   └── assets/        # Images, fonts
│   └── App.tsx
├── supabase/             # Configuration backend
│   ├── migrations/       # Migrations SQL
│   ├── functions/        # Edge functions
│   └── seed.sql         # Données de test
└── docs/                # Documentation
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Compte Supabase (gratuit)

### Installation

```bash
# Cloner le repo
git clone <repo-url>
cd moveup

# Installer les dépendances mobile
cd mobile
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec tes clés Supabase, Mapbox, etc.

# Lancer l'app
npm start
```

### Supabase Setup

```bash
# Créer un projet sur supabase.com
# Copier l'URL et la clé anon dans .env

# Appliquer les migrations
npm run supabase:migrate
```

## 🎨 Design System

### Couleurs principales
- **Bleu roi**: `#0047FF` - Couleur principale
- **Violet**: `#7B2FFF` - Accents
- **Noir**: `#1A1A1A` - Texte
- **Blanc**: `#FFFFFF` - Fond
- **Or**: `#FFD700` - Badges, récompenses

### Navigation

| 🏠 Accueil | 🔍 Trouver | 🎯 Objectifs | 🎒 Boutique | 👤 Profil |

## 📱 MVP Features (Phase 1)

- [x] Onboarding utilisateur
- [x] Création de profil avec QR code
- [x] Géolocalisation et carte interactive
- [x] Matching et création de séances
- [x] Système de points et badges
- [x] Boutique basique
- [x] Système de signalement

## 🔐 Sécurité & Éthique

- Charte de comportement obligatoire
- QR code de vérification sur place
- Système de signalement en 1 clic
- Journal d'intégrité visible
- Sanctions automatiques (3 signalements)
- Lieux publics privilégiés

## 👥 Contribution

Ce projet est en développement actif. Pour contribuer :

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commit tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

## 📄 Licence

Propriétaire - Tous droits réservés

## 📞 Contact

MoovUp Now Team - [@moovupnow](https://twitter.com/moovupnow)

---

**Slogan:** Bouge maintenant. Pas demain. 💪
