# 📱 MoovUp Now - Mobile App

Application mobile React Native pour MoovUp Now.

## 🛠️ Technologies

- **React Native** avec **Expo**
- **TypeScript**
- **React Navigation** pour la navigation
- **Supabase** pour le backend
- **React Query** pour la gestion de données
- **Mapbox** pour la géolocalisation

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`

### Étapes

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos clés
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
# - EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
```

## 📱 Lancer l'application

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur iOS (Mac uniquement)
npm run ios

# Lancer sur Android
npm run android

# Lancer sur le web
npm run web
```

## 📁 Structure du projet

```
mobile/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── common/       # Boutons, inputs, cards
│   │   ├── auth/         # Composants d'authentification
│   │   ├── profile/      # Composants de profil
│   │   ├── session/      # Composants de sessions
│   │   ├── map/          # Composants de carte
│   │   ├── shop/         # Composants de boutique
│   │   └── coaching/     # Composants de coaching
│   ├── screens/          # Écrans de l'app
│   │   ├── auth/         # Écrans d'authentification
│   │   └── main/         # Écrans principaux
│   ├── navigation/       # Configuration navigation
│   ├── services/         # Services API, Supabase
│   ├── hooks/            # Custom hooks React
│   ├── types/            # Types TypeScript
│   ├── utils/            # Fonctions utilitaires
│   ├── theme/            # Design system
│   ├── constants/        # Constantes de l'app
│   └── assets/           # Images, fonts
├── App.tsx              # Point d'entrée
├── app.json             # Configuration Expo
└── package.json         # Dépendances
```

## 🎨 Design System

### Couleurs

- **Primaire**: `#0047FF` (Bleu roi)
- **Secondaire**: `#7B2FFF` (Violet)
- **Accent**: `#FFD700` (Or - badges)
- **Texte**: `#1A1A1A` (Noir)
- **Fond**: `#FFFFFF` (Blanc)

### Typographie

- Titres: Inter/Poppins Bold
- Corps: Inter/Roboto Regular
- Boutons: Inter/Roboto Semibold

## 🔐 Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Appliquer les migrations SQL:
   ```bash
   # Depuis la racine du projet
   cd supabase
   # Copier le contenu de migrations/001_initial_schema.sql
   # Le coller dans l'éditeur SQL de Supabase
   ```
3. Appliquer les données de seed:
   ```bash
   # Copier le contenu de seed.sql
   # Le coller dans l'éditeur SQL de Supabase
   ```
4. Récupérer l'URL et la clé anon du projet
5. Les ajouter dans `.env`

## 🗺️ Configuration Mapbox

1. Créer un compte sur [mapbox.com](https://mapbox.com)
2. Créer un token d'accès
3. L'ajouter dans `.env` comme `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

## 📦 Dépendances principales

```json
{
  "@react-navigation/native": "Navigation",
  "@react-navigation/bottom-tabs": "Onglets du bas",
  "@react-navigation/native-stack": "Stack navigation",
  "@supabase/supabase-js": "Client Supabase",
  "@tanstack/react-query": "Gestion des données",
  "expo-camera": "Caméra (QR codes)",
  "expo-location": "Géolocalisation",
  "react-native-qrcode-svg": "Génération QR codes"
}
```

## 🧪 Tests

```bash
# Tests unitaires (à configurer)
npm test

# Linting
npm run lint
```

## 📝 Scripts disponibles

```bash
npm start          # Démarrer le serveur Expo
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Lancer sur web
npm run lint       # Linter le code
npm run type-check # Vérifier les types TypeScript
```

## 🔧 Configuration avancée

### Variables d'environnement

Toutes les variables d'environnement doivent être préfixées par `EXPO_PUBLIC_` pour être accessibles dans l'app.

Exemple:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Build de production

```bash
# Build Android
eas build --platform android

# Build iOS
eas build --platform ios
```

## 🆘 Dépannage

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Metro bundler stuck"
```bash
npx expo start -c
```

### Problème de cache
```bash
npx expo start --clear
```

## 📄 Licence

Propriétaire - Tous droits réservés

---

**MoovUp Now** - Bouge maintenant. Pas demain. 💪
