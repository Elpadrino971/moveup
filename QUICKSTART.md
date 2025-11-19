# 🚀 MoovUp Now - Guide de Démarrage Rapide

Ce guide vous permettra de lancer l'application en moins de 10 minutes !

## 📋 Prérequis

- Node.js 18+ et npm installés
- Un compte Supabase (gratuit)
- Expo Go app sur votre téléphone (optionnel)

## ⚡ Installation Express

### 1. Clone et Installation (2 min)

```bash
cd mobile
npm install
```

### 2. Configuration Supabase (5 min)

#### a) Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL** et votre **anon key**

#### b) Appliquer les migrations SQL

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Exécutez les migrations dans l'ordre :
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_trust_system.sql`
   - `supabase/migrations/003_user_availability.sql`
3. Vérifiez que toutes les tables sont créées

#### c) Ajouter les données de démo

1. Dans SQL Editor, exécutez `supabase/seed.sql`
2. Cela créera :
   - 21 sports
   - 15 badges
   - 8 exercices
   - 4 produits

### 3. Variables d'Environnement (1 min)

```bash
cd mobile
cp .env.example .env
```

Éditez `.env` avec vos credentials Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

### 4. Lancer l'Application (1 min)

```bash
npm start
```

Scannez le QR code avec Expo Go, ou appuyez sur :
- `a` pour Android Emulator
- `i` pour iOS Simulator
- `w` pour Web

## 🎯 Premier Test

### Créer un compte utilisateur

1. Sur l'écran d'accueil, appuyez sur **"Créer un compte"**
2. Remplissez le formulaire :
   - Pseudo : `testuser`
   - Email : `test@example.com`
   - Mot de passe : `Test1234`
3. Complétez l'onboarding en 4 étapes :
   - **Étape 1** : Sélectionnez vos sports préférés
   - **Étape 2** : Choisissez vos objectifs (max 3)
   - **Étape 3** : Définissez vos disponibilités
   - **Étape 4** : Acceptez la charte de sécurité

### Explorer l'Application

Une fois l'onboarding terminé, vous arriverez sur le **Home** :

- 🏠 **Home** : Dashboard avec votre niveau de confiance (🔰 Débutant)
- 🔍 **Find** : Recherche de sessions (à venir)
- 🎯 **Goals** : Suivi de vos objectifs (à venir)
- 🛍️ **Shop** : Boutique (à venir)
- 👤 **Profile** : Votre profil avec QR code et stats

### Tester le Système de Confiance

Votre profil démarre au **Niveau 1 - 🔰 Débutant** avec :
- ✅ Sessions même sexe autorisées
- ✅ Sessions en groupe autorisées
- ❌ Sessions sexe opposé en 1-on-1 **bloquées**

Pour débloquer le Niveau 3 (sexe opposé) :
- 10 sessions validées minimum
- Note moyenne ≥ 4.5/5
- Aucun avertissement

## 🔧 Commandes Utiles

```bash
# Lancer l'app en mode dev
npm start

# Lancer avec cache clear
npm start --clear

# Build Android
npm run android

# Build iOS
npm run ios

# Linter TypeScript
npm run lint

# Format code
npm run format
```

## 📱 Fonctionnalités Implémentées

### ✅ Authentification
- [x] Inscription avec email/password
- [x] Connexion
- [x] OAuth Google (config à faire)
- [x] OAuth Apple (config à faire)
- [x] Validation du pseudo en temps réel
- [x] Validation avancée des mots de passe

### ✅ Onboarding
- [x] Sélection des sports (21 disponibles)
- [x] Choix des objectifs (10 types)
- [x] Définition des disponibilités
- [x] Acceptation de la charte

### ✅ Home Dashboard
- [x] Salutation dynamique
- [x] Badge de niveau de confiance
- [x] Stats (sessions, note, ancienneté)
- [x] Actions rapides
- [x] Conseils contextuels

### ✅ Profil
- [x] Avatar avec initiales
- [x] Stats complètes
- [x] Détails du niveau de confiance
- [x] QR Code (placeholder)
- [x] Sports et badges
- [x] Déconnexion

### 🚧 En Développement
- [ ] Création de sessions
- [ ] Recherche et matching
- [ ] Géolocalisation avec Mapbox
- [ ] Scan QR code pour validation
- [ ] Chat entre utilisateurs
- [ ] Système de notation
- [ ] Notifications push

## 🎨 Architecture Technique

```
mobile/
├── src/
│   ├── components/       # Composants réutilisables
│   │   └── common/       # Button, Input, Card, TrustBadge
│   ├── contexts/         # React Context (AuthContext)
│   ├── navigation/       # React Navigation
│   ├── screens/
│   │   ├── auth/         # SignIn, SignUp, Landing
│   │   ├── onboarding/   # 4 étapes
│   │   └── main/         # Home, Profile, Find, Goals, Shop
│   ├── services/         # API Supabase
│   │   ├── auth.ts       # Authentification
│   │   ├── profile.ts    # Profils utilisateurs
│   │   └── supabase.ts   # Client Supabase
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilitaires (trustLevel.ts)
│   └── theme/            # Design system
├── App.tsx               # Point d'entrée
└── package.json
```

## 🐛 Résolution de Problèmes

### Erreur "Supabase client not initialized"
- Vérifiez que `.env` existe et contient les bonnes valeurs
- Redémarrez le serveur Metro : `npm start --clear`

### Erreur SQL lors des migrations
- Vérifiez que les migrations sont exécutées **dans l'ordre**
- Supprimez toutes les tables et recommencez si nécessaire

### L'app ne charge pas
- Vérifiez que vous êtes sur le même réseau WiFi (Expo Go)
- Essayez `npm start --tunnel` pour passer en mode tunnel

### Erreur TypeScript
- Lancez `npm install` pour installer toutes les dépendances
- Vérifiez que TypeScript est à jour : `npm install -D typescript@latest`

## 📚 Prochaines Étapes

1. **Testez l'authentification** complète
2. **Explorez le dashboard** et le profil
3. **Lisez la documentation** du système de confiance : `docs/TRUST_SYSTEM.md`
4. **Consultez les spécifications** complètes : `SPECIFICATIONS.md`
5. **Parcourez la roadmap** : `ROADMAP.md`

## 🤝 Besoin d'Aide ?

- 📖 Documentation complète : `GETTING_STARTED.md`
- 🔒 Système de confiance : `docs/TRUST_SYSTEM.md`
- 💰 Stratégie de monétisation : `docs/MONETIZATION.md`
- 💡 Innovations : `docs/INNOVATIONS.md`

## 🎉 Félicitations !

Votre environnement MoovUp Now est prêt ! Vous pouvez maintenant :
- ✅ Créer des comptes utilisateurs
- ✅ Tester l'onboarding complet
- ✅ Explorer le système de confiance
- ✅ Voir votre profil et vos stats

Prochaine étape : Implémentation du matching et des sessions ! 🚀
