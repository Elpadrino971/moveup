/**
 * MoovUp Now - App Constants
 */

export const APP_CONFIG = {
  name: 'MoovUp Now',
  slogan: 'Bouge maintenant. Pas demain.',
  version: '1.0.0',
  minAge: 18,
  maxDistance: 50, // km
  defaultDistance: 10, // km
};

export const SCREEN_NAMES = {
  // Auth
  AUTH_LANDING: 'AuthLanding',
  AUTH_SIGN_IN: 'SignIn',
  AUTH_SIGN_UP: 'SignUp',

  // Onboarding
  ONBOARDING_SPORTS: 'OnboardingSports',
  ONBOARDING_GOALS: 'OnboardingGoals',
  ONBOARDING_AVAILABILITY: 'OnboardingAvailability',
  ONBOARDING_CHARTER: 'OnboardingCharter',

  // Main tabs
  HOME: 'Home',
  FIND: 'Find',
  GOALS: 'Goals',
  SHOP: 'Shop',
  PROFILE: 'Profile',

  // Session
  SESSION_CREATE: 'SessionCreate',
  SESSION_DETAIL: 'SessionDetail',
  SESSION_QR_SCAN: 'SessionQRScan',

  // Map
  MAP_VIEW: 'MapView',
  USER_PROFILE: 'UserProfile',

  // Coaching
  WORKOUT_DETAIL: 'WorkoutDetail',
  EXERCISE_PLAYER: 'ExercisePlayer',

  // Shop
  PRODUCT_DETAIL: 'ProductDetail',
  CART: 'Cart',
  CHECKOUT: 'Checkout',

  // Settings
  SETTINGS: 'Settings',
  EDIT_PROFILE: 'EditProfile',
  NOTIFICATIONS: 'Notifications',
};

export const QUERY_KEYS = {
  profile: 'profile',
  sessions: 'sessions',
  nearbyUsers: 'nearbyUsers',
  workouts: 'workouts',
  products: 'products',
  orders: 'orders',
  notifications: 'notifications',
  badges: 'badges',
};

export const STORAGE_KEYS = {
  onboardingComplete: '@moovup/onboarding_complete',
  charterAccepted: '@moovup/charter_accepted',
  lastLocation: '@moovup/last_location',
};

export const REPORT_REASONS = [
  { value: 'inappropriate-behavior', label: 'Comportement inapproprié' },
  { value: 'harassment', label: 'Harcèlement' },
  { value: 'repeated-cancellation', label: 'Annulations répétées' },
  { value: 'fake-profile', label: 'Faux profil' },
  { value: 'unsafe-location', label: 'Lieu non sécurisé' },
  { value: 'other', label: 'Autre' },
];

export const SESSION_STATUS_LABELS = {
  pending: 'En attente',
  matched: 'Matché',
  confirmed: 'Confirmé',
  'in-progress': 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
  'no-show': 'Absence',
};
