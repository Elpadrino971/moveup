# 🎯 PLAN DE DÉPLOIEMENT - MoovUp Now
## Plan d'Action Complet pour Mise en Production

**Date:** 21 Janvier 2025
**Plateforme:** MoovUp Now
**Environnement:** Production
**Timeline:** 2-3 jours

---

## 📋 PHASE 0 : PRÉ-REQUIS (30 minutes)

### ✅ Vérifications Initiales

```bash
# 1. Vérifier Node.js et npm
node --version  # >= 18.x requis
npm --version   # >= 9.x requis

# 2. Vérifier installation Expo
npx expo --version

# 3. Vérifier Git
git --version
git status  # Doit être sur la bonne branche
```

### ✅ Comptes Requis

- [ ] **Expo Account** - https://expo.dev (pour EAS Build)
- [ ] **Apple Developer** - https://developer.apple.com (99$/an)
- [ ] **Google Play Console** - https://play.google.com/console (25$ one-time)
- [ ] **Supabase Project** - https://supabase.com (gratuit/pro)
- [ ] **OpenAI API** - https://platform.openai.com (pay-as-you-go)

### ✅ Fichiers de Configuration

```bash
cd /home/user/moveup

# Vérifier que tous les fichiers existent
ls -la mobile/.env                    # Variables d'environnement
ls -la mobile/app.json               # Config Expo
ls -la mobile/eas.json               # Config EAS Build
ls -la supabase/config.toml          # Config Supabase
```

---

## 🔧 PHASE 1 : CONFIGURATION (1-2 heures)

### Étape 1.1 : Configuration Expo/EAS

```bash
cd mobile

# Installer EAS CLI globalement
npm install -g eas-cli

# Login Expo
eas login
# Entrer email + password

# Vérifier le login
eas whoami
```

### Étape 1.2 : Créer eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.moovupnow.app",
        "buildNumber": "1"
      },
      "android": {
        "buildType": "apk",
        "package": "com.moovupnow.app",
        "versionCode": 1
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "votre-apple-id@email.com",
        "ascAppId": "XXXXXXXXXX",
        "appleTeamId": "XXXXXXXXXX"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Étape 1.3 : Mettre à jour app.json

```json
{
  "expo": {
    "name": "MoovUp Now",
    "slug": "moovup-now",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0047FF"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.moovupnow.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "MoovUp Now utilise votre position pour trouver des sessions sportives près de chez vous.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "MoovUp Now utilise votre position en arrière-plan pour le Mode Sentinel (sécurité).",
        "NSCameraUsageDescription": "MoovUp Now utilise la caméra pour scanner les QR codes de check-in.",
        "NSPhotoLibraryUsageDescription": "MoovUp Now accède à vos photos pour mettre à jour votre avatar."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0047FF"
      },
      "package": "com.moovupnow.app",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "VOTRE_PROJECT_ID"
      }
    }
  }
}
```

### Étape 1.4 : Configuration Variables d'Environnement

```bash
# Créer .env.production
cat > mobile/.env.production << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://votre-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-openai-key
EXPO_PUBLIC_ENV=production
EOF

# Sécuriser le fichier
chmod 600 mobile/.env.production
```

### Étape 1.5 : Configuration Supabase Production

```bash
# 1. Aller dans Supabase Dashboard
# → Settings → API
# Copier: Project URL + anon/public key

# 2. Vérifier que toutes les migrations sont appliquées
cd supabase
supabase db push

# 3. Activer Row Level Security sur TOUTES les tables
# → Database → Tables → Cliquer sur chaque table → Enable RLS

# 4. Configurer Auth
# → Authentication → Providers
# - Email: Activé
# - Confirm email: Activé (optionnel)

# 5. Configurer Storage
# → Storage → New bucket
# - Nom: "avatars", Public: true
# - Nom: "session-photos", Public: true

# 6. Configurer Rate Limiting
# → Settings → API Settings
# - Auth requests: 100/hour per IP
# - Database requests: 1000/minute
```

---

## 🏗️ PHASE 2 : BUILD & TEST LOCAL (2-3 heures)

### Étape 2.1 : Tests Locaux

```bash
cd mobile

# Nettoyer le cache
rm -rf node_modules
rm -rf .expo
npm install

# Démarrer en mode développement
expo start -c

# Tester sur iOS Simulator
i

# Tester sur Android Emulator
a
```

### Étape 2.2 : Checklist Tests Manuels

#### Auth Flow
- [ ] Inscription avec email
- [ ] Vérification email (si activé)
- [ ] Connexion
- [ ] Onboarding Step 1 (Profil)
- [ ] Onboarding Step 2 (Objectifs)
- [ ] Onboarding Step 3 (Disponibilités)
- [ ] Onboarding Step 4 (Charte)
- [ ] Logout

#### Session Flow
- [ ] Créer une session (tous les champs)
- [ ] Liste des sessions (FindScreen)
- [ ] Détails d'une session
- [ ] Rejoindre une session
- [ ] Quitter une session
- [ ] Check-in QR code
- [ ] Noter une session

#### Features
- [ ] Coach IA - Envoyer un message
- [ ] Programme Parrainage - Générer code
- [ ] Mode Sentinel - Ajouter contact
- [ ] HomeScreen - Navigation complète
- [ ] Shop - Acheter un produit (si implémenté)

### Étape 2.3 : Tests TypeScript

```bash
# Vérifier compilation TypeScript
npm run tsc

# Linter
npm run lint

# Si erreurs, corriger avant de continuer
```

---

## 📱 PHASE 3 : BUILD PRODUCTION iOS (3-4 heures)

### Étape 3.1 : Configuration Apple Developer

1. **Créer App ID**
   - Aller sur https://developer.apple.com/account
   - Certificates, Identifiers & Profiles → Identifiers → +
   - App IDs → App
   - Description: MoovUp Now
   - Bundle ID: `com.moovupnow.app` (Explicit)
   - Capabilities:
     - ✅ Push Notifications
     - ✅ Background Modes (Location updates)
     - ✅ Sign in with Apple (optionnel)

2. **Créer App sur App Store Connect**
   - Aller sur https://appstoreconnect.apple.com
   - My Apps → + → New App
   - Platforms: iOS
   - Name: MoovUp Now
   - Primary Language: French
   - Bundle ID: com.moovupnow.app
   - SKU: moovupnow001

### Étape 3.2 : Build iOS

```bash
cd mobile

# Configurer le projet Expo pour EAS
eas build:configure

# Build production iOS
eas build --profile production --platform ios

# ⏱️ Temps estimé: 15-20 minutes
# Le build se fait sur les serveurs Expo

# Suivre la progression
# URL fournie dans le terminal
```

### Étape 3.3 : Soumettre à l'App Store

```bash
# Option 1: Via EAS CLI (recommandé)
eas submit --platform ios

# Option 2: Manuel via App Store Connect
# 1. Télécharger le .ipa depuis Expo
# 2. Uploader via Transporter app
```

### Étape 3.4 : Remplir Métadonnées App Store

Dans App Store Connect → MoovUp Now → App Information:

**App Information:**
- Name: `MoovUp Now`
- Subtitle: `Trouve des partenaires sportifs`
- Privacy Policy URL: `https://moovupnow.com/privacy`
- Category: Health & Fitness
- Secondary Category: Social Networking

**Version Information (1.0):**

**Description (4000 chars max):**
```
🏃 MoovUp Now - La plateforme sociale du sport

Trouve des partenaires sportifs près de chez toi pour bouger ensemble !

⚽ 8 SPORTS DISPONIBLES
Running, Football, Basketball, Tennis, Yoga, Cyclisme, Natation, Fitness

🔒 SYSTÈME DE CONFIANCE UNIQUE
Notre Trust Level basé sur tes sessions et notes garantit ta sécurité. Plus tu participes, plus tu débloques de fonctionnalités.

🛡️ MODE SENTINEL - SÉCURITÉ MAXIMALE
Partage ta position en temps réel avec tes contacts de confiance lors de sessions 1-on-1. Système d'alertes automatiques.

🤖 COACH IA PERSONNALISÉ
Assistant sportif powered by Intelligence Artificielle pour te motiver, te conseiller et suivre tes progrès.

🎁 PROGRAMME DE PARRAINAGE
Invite tes amis et gagne des récompenses : MoovCoins, jours Premium gratuits, et jusqu'à 30% de commissions récurrentes !

💰 MOOVCOINS - ÉCONOMIE VIRTUELLE
Gagne des MoovCoins en participant à des sessions. Échange-les contre des produits Premium, des cours, du matériel sportif.

💎 GRATUIT AVEC OPTION PREMIUM
Version FREE:
• 2 sessions actives simultanées
• 10 messages Coach IA par jour
• Accès à toutes les fonctionnalités de base

Version PREMIUM (4.99€/mois):
• Sessions illimitées
• Coach IA illimité
• x1.5 MoovCoins sur toutes les sessions
• Badge Premium
• Support prioritaire

🎯 PARFAIT POUR:
• Trouver des partenaires de running dans ton quartier
• Organiser des matchs de foot amateurs
• Découvrir de nouveaux spots de yoga
• Progresser avec un coach virtuel
• Rejoindre une communauté sportive bienveillante

🌍 LOCAL ET SÉCURISÉ
Toutes les sessions sont géolocalisées. Trouve des partenaires à moins de 10km de chez toi.

📈 SUIVI DE PROGRESSION
Trust Level, statistiques, objectifs, historique des sessions, notes reçues.

Rejoins la communauté MoovUp Now et bouge maintenant, pas demain ! 🚀

---

CONDITIONS:
Version minimale iOS: 13.0
Connexion Internet requise
Localisation recommandée

Support: support@moovupnow.com
Site web: https://moovupnow.com
```

**Keywords (100 chars max, séparés par virgules):**
```
sport,running,football,fitness,partenaires,local,tennis,yoga,basket,cyclisme,natation,coach
```

**Screenshots:**
- iPhone 6.7" (iPhone 14 Pro Max): 6-10 screenshots
- iPhone 5.5" (iPhone 8 Plus): 6-10 screenshots (optionnel)

**Promotional Text (170 chars):**
```
🏃 Trouve des partenaires sportifs près de chez toi ! Coach IA, Mode Sentinel pour ta sécurité, Programme de Parrainage. Bouge maintenant ! 🚀
```

**App Review Information:**
- First Name: [Votre prénom]
- Last Name: [Votre nom]
- Phone Number: [Votre téléphone]
- Email: [Votre email]
- Demo Account:
  - Username: demo@moovupnow.com
  - Password: DemoTest2025!

**Notes:**
```
MoovUp Now est une plateforme sociale pour trouver des partenaires sportifs locaux.

Fonctionnalités testables:
1. Inscription/Connexion
2. Création de session sportive
3. Recherche de sessions
4. Coach IA (10 messages/jour en Free)
5. Programme de Parrainage
6. Mode Sentinel (géolocalisation)

Permissions requises:
- Localisation: Pour trouver sessions à proximité
- Caméra: Pour QR code check-in
- Photos: Pour avatar utilisateur

Compte démo pré-configuré avec quelques sessions test.
```

---

## 🤖 PHASE 4 : BUILD PRODUCTION ANDROID (2-3 heures)

### Étape 4.1 : Configuration Google Play Console

1. **Créer l'Application**
   - Aller sur https://play.google.com/console
   - Create app
   - Name: MoovUp Now
   - Default language: French
   - App or Game: App
   - Free or Paid: Free

2. **Configurer App Signing**
   - Release → Setup → App signing
   - Continue avec Google-managed key

### Étape 4.2 : Build Android

```bash
cd mobile

# Build production Android
eas build --profile production --platform android

# ⏱️ Temps estimé: 15-20 minutes
```

### Étape 4.3 : Créer Service Account pour Submission

```bash
# 1. Aller dans Google Cloud Console
# https://console.cloud.google.com

# 2. Créer Service Account
# IAM & Admin → Service Accounts → Create Service Account
# Name: moovup-play-store
# Role: Service Account User

# 3. Créer clé JSON
# Actions → Manage keys → Add key → Create new key → JSON
# Télécharger le fichier

# 4. Renommer et placer dans le projet
mv ~/Downloads/service-account-key.json mobile/google-play-service-account.json

# 5. Activer l'API
# Google Play Android Developer API → Enable

# 6. Donner accès dans Play Console
# Users and permissions → Invite new users
# Coller l'email du service account
# Permissions: Release apps to production
```

### Étape 4.4 : Soumettre au Play Store

```bash
cd mobile

# Soumettre
eas submit --platform android

# Suivre les instructions
```

### Étape 4.5 : Remplir Métadonnées Play Store

**Store listing:**

**App name:**
```
MoovUp Now - Sports & Partenaires
```

**Short description (80 chars):**
```
Trouve des partenaires sportifs locaux. Bouge maintenant, pas demain ! 🏃⚽
```

**Full description (4000 chars):**
```
[Même description que iOS, adaptée si nécessaire]
```

**App icon:** 512x512 PNG

**Feature graphic:** 1024x500 PNG

**Screenshots:**
- Phone: 2-8 screenshots (1080x1920 minimum)
- 7" Tablet: 1-8 screenshots (optionnel)
- 10" Tablet: 1-8 screenshots (optionnel)

**Category:**
- Primary: Health & Fitness
- Tags: Sports, Social, Local, Fitness

**Contact details:**
- Email: support@moovupnow.com
- Website: https://moovupnow.com
- Phone: [Optionnel]

**Privacy Policy:**
URL: https://moovupnow.com/privacy

**App content:**
- Target age: 13+
- Content rating: Everyone
- Data safety:
  - Collects: Location, Personal info, Photos, App activity
  - Shares: No
  - Encrypted in transit: Yes
  - Can request data deletion: Yes

---

## 🔍 PHASE 5 : VALIDATION & MONITORING (1-2 jours)

### Étape 5.1 : Review Process

**iOS App Store:**
- ⏱️ Durée: 24-48 heures généralement
- Statut: App Store Connect → App Status
- États:
  - Waiting for Review
  - In Review
  - Pending Developer Release (approuvé !)
  - Ready for Sale (en ligne)

**Google Play Store:**
- ⏱️ Durée: Quelques heures à 2 jours
- Statut: Play Console → Dashboard
- Track: Internal → Beta → Production

### Étape 5.2 : Si Rejection

**Raisons Courantes iOS:**
1. **Permissions non justifiées**
   - Solution: Améliorer les descriptions dans Info.plist

2. **Demo account ne fonctionne pas**
   - Solution: Créer un compte test fonctionnel

3. **Crash au lancement**
   - Solution: Tester avec TestFlight avant submission

4. **Métadonnées incorrectes**
   - Solution: Vérifier keywords, description

**Raisons Courantes Android:**
1. **Permissions dangereuses non déclarées**
   - Solution: Ajouter dans AndroidManifest.xml

2. **Target API level trop bas**
   - Solution: Mettre à jour dans app.json

3. **Content policy violation**
   - Solution: Vérifier images/textes

### Étape 5.3 : Configuration Monitoring

```bash
# Installer Sentry pour error tracking
npm install @sentry/react-native

# Configuration dans App.tsx
```

**Sentry Config:**
```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://votre-sentry-dsn',
  environment: __DEV__ ? 'development' : 'production',
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
});
```

### Étape 5.4 : Analytics

**Amplitude / Mixpanel:**
```bash
npm install @amplitude/analytics-react-native
```

**Events à tracker:**
```typescript
// Signup
amplitude.track('User Signup', { method: 'email' });

// Session Created
amplitude.track('Session Created', {
  sport: 'running',
  type: '1-on-1',
  duration: 60
});

// Session Joined
amplitude.track('Session Joined', { sessionId: 'xxx' });

// Coach Message
amplitude.track('Coach Message Sent', { isPremium: false });

// Referral
amplitude.track('Referral Code Shared', { code: 'ALEX123' });
```

---

## 📊 PHASE 6 : POST-LAUNCH (Semaine 1)

### Jour 1 : Launch Day 🚀

**Matin (08h00):**
- [ ] Vérifier que l'app est live sur les deux stores
- [ ] Tester le téléchargement et installation
- [ ] Créer un compte utilisateur "réel"
- [ ] Faire un tour complet de l'app

**Midi (12h00):**
- [ ] Vérifier Supabase Dashboard (users, sessions)
- [ ] Vérifier Sentry (crashes)
- [ ] Répondre aux premiers reviews

**Soir (18h00):**
- [ ] Check analytics (downloads, signups)
- [ ] Post réseaux sociaux (Instagram, Twitter, LinkedIn)
- [ ] Email liste (si newsletter)

### Jour 2-7 : Monitoring Intensif

**Daily Checks:**
- [ ] Crash reports (Sentry)
- [ ] User reviews (App Store + Play Store)
- [ ] Analytics (DAU, retention D1)
- [ ] Database performance (Supabase)
- [ ] API costs (OpenAI)

**KPIs Semaine 1:**
- Objectif Downloads: 100-500
- Objectif Signups: 50-250
- Objectif Sessions créées: 20-100
- Crash rate: <1%
- Retention D1: >40%

---

## 🚨 PLAN B : ROLLBACK

### Si Bug Critique Détecté

```bash
# 1. Retirer l'app temporairement
# iOS: App Store Connect → Remove from Sale
# Android: Play Console → Unpublish

# 2. Fix le bug en local
git checkout -b hotfix/critical-bug
# ... fix code ...
git commit -m "🔥 Hotfix: [description]"

# 3. Build nouvelle version
# Incrémenter buildNumber/versionCode
eas build --profile production --platform all

# 4. Submit nouvelle version
eas submit --platform ios
eas submit --platform android

# 5. Attendre review (prioritaire si c'est un hotfix)
```

---

## ✅ CHECKLIST FINALE

### Avant de lancer le build production:
- [ ] Tous les tests manuels passent
- [ ] TypeScript compile sans erreurs
- [ ] Variables d'environnement production configurées
- [ ] Supabase en production avec RLS activé
- [ ] OpenAI API key configurée
- [ ] Icons et splash screens créés
- [ ] App.json configuré correctement
- [ ] eas.json configuré
- [ ] Comptes Apple Developer et Google Play actifs

### Avant de soumettre aux stores:
- [ ] Métadonnées complètes (descriptions, keywords)
- [ ] Screenshots de qualité (6 minimum)
- [ ] Privacy Policy URL live
- [ ] Terms of Service URL live
- [ ] Demo account créé et fonctionnel
- [ ] App testée sur devices réels

### Après approbation:
- [ ] Monitoring configuré (Sentry)
- [ ] Analytics configuré (Amplitude)
- [ ] Support email actif
- [ ] Réseaux sociaux prêts
- [ ] Plan marketing activé
- [ ] Documentation utilisateur prête

---

## 📞 SUPPORT & CONTACTS

**Problèmes Techniques:**
- Expo Support: https://expo.dev/support
- Supabase Support: https://supabase.com/support
- Stack Overflow: tag `react-native`, `expo`

**Review Process:**
- Apple Review Status: https://developer.apple.com/contact/app-store/
- Google Play Support: https://support.google.com/googleplay/android-developer

**Urgences:**
- Crash critique: Rollback immédiat
- Data breach: Notifier users + CNIL (RGPD)
- API costs explosion: Rate limiting

---

## 🎊 C'EST PARTI !

**Commande pour démarrer:**
```bash
cd /home/user/moveup/mobile
eas build --profile production --platform all
```

**Timeline Totale Estimée:**
- Configuration: 1-2 heures
- Builds: 30-40 minutes
- Submissions: 5 minutes
- Review iOS: 24-48 heures
- Review Android: 2-24 heures
- **TOTAL: 2-3 jours**

**Bonne chance ! 🚀💪**

---

*Plan créé le 21 Janvier 2025*
*Version: 1.0*
*Plateforme: MoovUp Now*
