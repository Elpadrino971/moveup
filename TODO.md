# 📋 MoovUp Now - TODO List

## 🎯 MVP Core Features (Priorité Haute)

### Sessions & Matching
- [ ] **SessionCreateScreen** - Créer une session de sport
  - Formulaire : sport, lieu, date/heure, durée, type (1-on-1, groupe)
  - Géolocalisation avec Mapbox
  - Vérification des permissions (trust level)
  - Sauvegarde dans Supabase
- [ ] **FindScreen** - Trouver des sessions
  - Carte interactive avec Mapbox
  - Liste des sessions à proximité
  - Filtres (sport, distance, date, niveau)
  - Match basé sur le trust level
- [ ] **SessionDetailScreen** - Détails d'une session
  - Informations complètes
  - Profil du créateur
  - Bouton "Rejoindre"
  - Chat de session
- [ ] **Service matching.ts** - Logique de matching
  - Calcul de compatibilité
  - Vérification trust level (canMatch)
  - Restrictions sexe opposé
  - Alertes si blocage

### QR Code System
- [ ] Installer `react-native-qrcode-svg`
- [ ] **QRCodeComponent** - Afficher le QR code utilisateur
  - Génération dynamique
  - Design avec logo MoovUp
- [ ] **QRScannerScreen** - Scanner un QR code
  - Utiliser `expo-camera`
  - Validation du code scanné
  - Confirmation de présence
- [ ] **Service qrcode.ts** - Gestion QR codes
  - generateSessionQR() - Génère QR unique par session
  - validateQRScan() - Valide un scan
  - markAttendance() - Marque la présence
  - updateSessionStats() - Met à jour les stats

### Géolocalisation
- [ ] Configurer Mapbox
- [ ] Installer `@rnmapbox/maps`
- [ ] **Service location.ts** - Géolocalisation
  - getCurrentLocation()
  - watchLocation()
  - calculateDistance()
  - isLocationSafe() - Vérification sécurité
- [ ] Permissions de localisation
- [ ] Carte interactive sur FindScreen

### Chat & Messages
- [ ] **ChatScreen** - Conversation 1-on-1
  - Liste des messages
  - Envoi de messages
  - Indicateurs de lecture
- [ ] **MessagesListScreen** - Liste des conversations
- [ ] **Service chat.ts** - Messaging
  - sendMessage()
  - getConversation()
  - markAsRead()
  - Real-time avec Supabase Realtime

### Rating & Reviews
- [ ] **RatingModal** - Noter un partenaire après session
  - Étoiles 1-5
  - Commentaire optionnel
  - Signalement si problème
- [ ] **Service ratings.ts** - Gestion des notes
  - submitRating()
  - calculateAverageRating()
  - updateTrustLevel() - Trigger recalcul

## 🔒 Progressive Trust System (Priorité Haute)

### Trust Level Calculation
- [ ] Implémenter la fonction SQL `calculate_trust_level()`
- [ ] Trigger automatique après chaque session
- [ ] Dégradation automatique si note < 4.0
- [ ] Tests unitaires du calcul

### Restrictions & Permissions
- [ ] Middleware de vérification avant matching
- [ ] Modal d'explication si action bloquée
- [ ] Affichage des requirements pour déblocage
- [ ] Badge visuel du niveau partout dans l'app

### Signalement & Modération
- [ ] **ReportModal** - Signaler un utilisateur
  - Raisons prédéfinies
  - Description
  - Preuves (optionnel)
- [ ] **Service moderation.ts** - Modération
  - submitReport()
  - applyWarning() - Fonction SQL
  - banUser() - Si trop d'avertissements
- [ ] Dashboard admin (futur)

## 🎨 UI/UX Improvements

### Composants Manquants
- [ ] **Avatar** component - Gestion d'avatar
- [ ] **Badge** component - Affichage des badges
- [ ] **EmptyState** component - États vides
- [ ] **LoadingSpinner** component - Loading custom
- [ ] **BottomSheet** component - Modals bottom
- [ ] **Chip** component - Tags/Filters

### Screens à Améliorer
- [ ] **GoalsScreen** - Suivi des objectifs
  - Liste des objectifs actifs
  - Graphiques de progression
  - Ajout/modification d'objectifs
- [ ] **ShopScreen** - Boutique
  - Liste des produits
  - Panier
  - Checkout avec Stripe
- [ ] **EditProfileScreen** - Modifier le profil
  - Upload photo
  - Modifier bio, sports, etc.
- [ ] **SettingsScreen** - Paramètres
  - Notifications
  - Confidentialité
  - Disponibilités
  - Langue

### Navigation
- [ ] Ajouter navigation vers SessionCreate
- [ ] Stack Navigator pour les détails (session, user)
- [ ] Modal pour les actions rapides
- [ ] Deep linking pour partage

## 📱 Features Premium

### Notifications
- [ ] Configurer Expo Notifications
- [ ] Service notifications.ts
- [ ] Push pour nouveaux matchs
- [ ] Push pour messages
- [ ] Push pour rappels de sessions
- [ ] Préférences de notifications

### Analytics & Tracking
- [ ] Intégrer Segment ou Mixpanel
- [ ] Tracker les événements clés
- [ ] Dashboard analytics dans l'app
- [ ] Graphiques de progression

### Gamification
- [ ] Système de points
- [ ] Déblocage de badges
- [ ] Animations de célébration
- [ ] Leaderboard (optionnel)
- [ ] Achievements

### Social Features
- [ ] Followers/Following
- [ ] Feed d'activités
- [ ] Stories (futures sessions)
- [ ] Partage sur réseaux sociaux

## 🧪 Testing & Quality

### Tests
- [ ] Tests unitaires (Jest)
  - Services (auth, profile, trust)
  - Utilitaires (trustLevel)
- [ ] Tests d'intégration
  - Flows complets (signup → onboarding → home)
- [ ] Tests E2E (Detox)
  - Parcours utilisateur critiques

### Code Quality
- [ ] ESLint configuration stricte
- [ ] Prettier pour formatting
- [ ] Husky pre-commit hooks
- [ ] TypeScript strict mode
- [ ] Code review checklist

### Performance
- [ ] Lazy loading des images
- [ ] Pagination des listes
- [ ] Cache avec React Query
- [ ] Optimisation des re-renders
- [ ] Bundle size analysis

## 🚀 DevOps & Deployment

### CI/CD
- [ ] GitHub Actions
  - Lint on PR
  - Tests on push
  - Build preview
- [ ] Automatic versioning
- [ ] Changelog génération

### Deployment
- [ ] EAS Build configuration
- [ ] App Store preparation
  - Screenshots
  - Description
  - Privacy policy
- [ ] Google Play preparation
- [ ] Beta testing avec TestFlight
- [ ] Staged rollout

### Monitoring
- [ ] Sentry pour error tracking
- [ ] Crashlytics
- [ ] Performance monitoring
- [ ] Logs centralisés

## 📚 Documentation

### User Docs
- [ ] FAQ
- [ ] Tutoriels vidéo
- [ ] Guide de sécurité
- [ ] Politique de confidentialité
- [ ] CGU (Conditions Générales d'Utilisation)

### Developer Docs
- [ ] Architecture Decision Records (ADR)
- [ ] API documentation
- [ ] Component library (Storybook?)
- [ ] Contributing guide

## 💰 Business Features

### Monetization
- [ ] Intégration Stripe
- [ ] Abonnements Premium/Legend
- [ ] In-app purchases
- [ ] Système de parrainage
- [ ] Codes promo

### Marketing
- [ ] Landing page web
- [ ] Blog
- [ ] Email marketing (Newsletter)
- [ ] Referral program
- [ ] Partenariats salles de sport

## 🔮 Future Ideas (Nice to Have)

- [ ] Coach IA "Moov" avec ChatGPT
- [ ] AR Session Replay
- [ ] Voice commands
- [ ] Wearables integration (Apple Watch, Garmin)
- [ ] DNA testing integration
- [ ] Live streaming de sessions
- [ ] Championships & Challenges
- [ ] Traduction multi-langue
- [ ] Mode sombre
- [ ] Accessibilité (A11y)

---

## 🎯 Sprint Actuel

**Sprint 1 - MVP Core (2 semaines)**
- [x] Auth & Onboarding ✅
- [x] Home & Profile ✅
- [ ] Sessions & Matching
- [ ] QR Code System
- [ ] Basic Trust Level implementation

**Prochains sprints :**
- Sprint 2 : Chat, Ratings, Notifications
- Sprint 3 : Polish, Testing, Beta
- Sprint 4 : Launch 🚀

---

_Dernière mise à jour : 2025-01-19_
