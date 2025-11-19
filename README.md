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
- 🔒 **Système de Confiance Progressif** - Déblocage sécurisé basé sur la fiabilité
- 🛍️ **Shop intégré** - Tenues MoovUp Now et produits sportifs
- 🧬 **Communauté dynamique** - Groupes, sessions, récompenses

## 🔒 Système de Confiance Progressif

MoovUp Now intègre un **système de sécurité unique** basé sur 5 niveaux de confiance :

| Niveau | Badge | Description | Restrictions |
|--------|-------|-------------|--------------|
| **1 - Débutant** | 🔰 | 0-4 sessions | Même sexe OU groupes uniquement |
| **2 - Confirmé** | ⚡ | 5-9 sessions | Déblocage groupes mixtes |
| **3 - Vérifié** | ✅ | 10-19 sessions | **Déblocage sexe opposé en binôme** |
| **4 - Expert** | 🏆 | 20-49 sessions | Priorité matching, +10% points |
| **5 - Legend** | 👑 | 50+ sessions | Parrainage, premium offert |

### Pourquoi ce système ?

- 🛡️ **Protection** - Les débutants prouvent leur fiabilité avant le matching complet
- 🎯 **Progressif** - Groupes mixtes autorisés dès le début pour socialiser en sécurité
- ⚖️ **Équitable** - Même règles pour tous, progression par le mérite
- 🚫 **Anti-dérive** - Évite la drague et le harcèlement
- ✅ **QR obligatoire** - Scan sur place = preuve de présence réelle

**Documentation complète :** [docs/TRUST_SYSTEM.md](docs/TRUST_SYSTEM.md)

---

## 💰 Modèle de Monétisation

MoovUp Now utilise un **modèle freemium multi-stream** pour assurer profitabilité et croissance :

### 📊 Projections An 1

**Revenus : 1,2M€** | **Marge : 71%**

### 💎 Offres Premium

| Plan | Prix | Fonctionnalités Clés |
|------|------|----------------------|
| **Gratuit** | 0€ | Matching illimité, chat basique, 10km géoloc |
| **Premium** | 9,99€/mois | Voir qui t'a visité, filtres illimités, stats avancées, +20% points |
| **Legend** | 19,99€/mois | Coaching humain 2h/mois, analytics pro, +50% points, events VIP |

### 💰 Sources de Revenus

1. **Abonnements Premium** (42%) - 500k€/an
2. **Boutique E-Commerce** (34%) - 420k€/an (produits brandés, marge 50%)
3. **Publicité Discrète** (15%) - 180k€/an (version gratuite uniquement)
4. **Partenariats B2B** (5%) - Salles de sport, marques, entreprises
5. **Événements & Coaching** (4%) - Compétitions, sessions premium

**Documentation détaillée :** [docs/MONETIZATION.md](docs/MONETIZATION.md)

---

## 🚀 Innovations Uniques

MoovUp Now se différencie avec des features qu'**aucun concurrent n'a** :

### 🤖 "Moov" - Coach IA Personnel
- Suggestions ultra-personnalisées basées sur sommeil, météo, humeur
- Messages vocaux pendant l'effort
- Prédictions intelligentes de performance

### 🎥 Session Replay AR
- Revois ta session en réalité augmentée
- Ghost racing contre ton record
- Stats 3D overlay

### 🏆 MoovUp Championships
- Compétitions mensuelles officielles
- Prizes : 500€ + trophée + premium
- Live streaming des finales
- Sponsoring Nike/Adidas

### 📸 Stories 24h
- Partage tes sessions comme Instagram
- Stickers exclusifs automatiques
- Feed communautaire engageant

### 🎮 Gamification Pokémon-Style
- Collectionne des "Moov Creatures" par sport
- Évolution selon tes performances
- Combats amicaux de stats

### 🔴 Live Streaming
- Stream tes sessions en direct
- Followers encouragent en temps réel
- Monétisation par tips

**Toutes les innovations :** [docs/INNOVATIONS.md](docs/INNOVATIONS.md)

---

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

## 📱 État du Développement

### ✅ Complété (Sprint 1)

**Authentification & Onboarding**
- [x] Inscription email/password avec validation avancée
- [x] Connexion avec Google/Apple OAuth
- [x] Vérification de disponibilité du pseudo en temps réel
- [x] Onboarding en 4 étapes (Sports, Objectifs, Disponibilités, Charte)
- [x] Acceptation de la charte de sécurité

**Home & Profile**
- [x] Dashboard dynamique avec stats de confiance
- [x] Affichage du niveau de trust (🔰 Débutant → 👑 Legend)
- [x] Profil utilisateur complet avec QR code
- [x] Sports et badges affichés
- [x] Pull-to-refresh

**Infrastructure**
- [x] React Native + Expo + TypeScript
- [x] Supabase (Auth + Database + RLS)
- [x] Design system complet
- [x] Navigation (Auth / Onboarding / Main)
- [x] Service layer (auth, profile)
- [x] Système de confiance progressif (backend)

### 🚧 En Cours (Sprint 2)

- [ ] Création et recherche de sessions
- [ ] Géolocalisation avec Mapbox
- [ ] Scanner QR code pour validation
- [ ] Chat entre utilisateurs
- [ ] Système de notation

### 📋 À Venir

- [ ] Notifications push
- [ ] Boutique e-commerce
- [ ] Coaching IA "Moov"
- [ ] Gamification complète
- [ ] Live streaming

**Guide complet :** [QUICKSTART.md](QUICKSTART.md) | **TODO :** [TODO.md](TODO.md)

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
