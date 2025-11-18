/**
 * MoovUp Now - Trust System Types
 *
 * Système de confiance progressif pour la sécurité des utilisateurs
 */

export type TrustLevel = 1 | 2 | 3 | 4 | 5;

export type TrustLevelName =
  | 'beginner'    // Niveau 1
  | 'confirmed'   // Niveau 2
  | 'verified'    // Niveau 3
  | 'expert'      // Niveau 4
  | 'legend';     // Niveau 5

export type SessionType = 'one-on-one' | 'group';

export type LocationType =
  | 'public-park'
  | 'gym'
  | 'stadium'
  | 'public-street'
  | 'private-home'
  | 'isolated-area';

export type LocationSafety = 'safe' | 'warning' | 'unsafe';

export type WarningType =
  | 'inappropriate-behavior'
  | 'harassment'
  | 'no-show'
  | 'sexual-content'
  | 'fake-profile'
  | 'unsafe-location';

/**
 * Informations complètes sur le niveau de confiance
 */
export type TrustLevelInfo = {
  level: TrustLevel;
  name: TrustLevelName;
  badge: string;
  color: string;

  // Restrictions et permissions
  canMatchOppositeGenderOneOnOne: boolean;
  canMatchOppositeGenderGroup: boolean;
  canMatchSameGender: boolean;

  // Progression
  currentSessions: number;
  requiredSessions: number;
  progressPercentage: number;

  // Requirements
  requirements: TrustRequirement[];

  // Avantages
  benefits: string[];

  // Next level
  nextLevel?: {
    level: TrustLevel;
    name: TrustLevelName;
    sessionsToGo: number;
    otherRequirements: string[];
  };
};

/**
 * Requis pour atteindre/maintenir un niveau
 */
export type TrustRequirement = {
  type: 'sessions' | 'rating' | 'warnings' | 'verified' | 'account-age';
  label: string;
  required: number | boolean;
  current: number | boolean;
  isMet: boolean;
};

/**
 * Statistiques de confiance d'un utilisateur
 */
export type TrustStats = {
  level: TrustLevel;
  sessionsCompleted: number;
  averageRating: number;
  warningsCount: number;
  isVerified: boolean;
  accountAgeInDays: number;

  // Sessions breakdown
  sameGenderSessions: number;
  oppositeGenderSessions: number;
  groupSessions: number;

  // Ratings breakdown
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;

  // Safety
  reportsReceived: number;
  reportsSent: number;
  lastWarningDate?: string;

  // Progression
  pointsEarned: number;
  badgesUnlocked: number;

  // Sponsorship (Niveau 5)
  canSponsor: boolean;
  sponsoredUsers: number;
};

/**
 * Avertissement/Warning
 */
export type Warning = {
  id: string;
  userId: string;
  type: WarningType;
  reason: string;
  sessionId?: string;
  reporterId?: string;

  status: 'pending' | 'reviewed' | 'confirmed' | 'dismissed';

  // Actions taken
  levelDegraded?: boolean;
  previousLevel?: TrustLevel;
  newLevel?: TrustLevel;

  // Review
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  createdAt: string;
  expiresAt?: string; // Warnings can expire after good behavior
};

/**
 * Vérification des permissions de matching
 */
export type MatchPermission = {
  allowed: boolean;
  reason?: string;
  restrictions?: string[];
  suggestions?: string[];
};

/**
 * Configuration des niveaux
 */
export type TrustLevelConfig = {
  level: TrustLevel;
  name: TrustLevelName;
  badge: string;
  badgeColor: string;
  displayName: string;

  // Requirements to reach this level
  minSessions: number;
  minAverageRating: number;
  maxWarnings: number;
  requireVerified: boolean;
  minAccountAgeDays?: number;

  // Permissions
  permissions: {
    matchSameGender: boolean;
    matchOppositeGenderGroup: boolean;
    matchOppositeGenderOneOnOne: boolean;
    canSponsor: boolean;
    priorityMatching: boolean;
  };

  // Rewards
  pointsBonus: number; // % bonus on points
  shopDiscount: number; // % discount
  premiumAccess?: {
    coachingMonths: number;
    features: string[];
  };

  // Next level requirements
  nextLevel?: {
    sessionsNeeded: number;
    ratingNeeded: number;
    otherRequirements: string[];
  };
};

/**
 * Action de restriction
 */
export type RestrictionAction = {
  type: 'block' | 'warning' | 'allow';
  message: string;
  title?: string;
  alternatives?: {
    label: string;
    action: string;
  }[];
};

/**
 * Parrainage (Sponsorship) - Niveau 5 only
 */
export type Sponsorship = {
  id: string;
  sponsorId: string; // Must be Level 5
  sponsoredUserId: string; // Usually Level 1-2
  sessionId?: string;

  status: 'pending' | 'accepted' | 'completed' | 'rejected';

  // Rewards
  bonusSessionsForSponsored: number; // +2 sessions progress
  bonusPointsForSponsor: number; // +50 points

  createdAt: string;
  completedAt?: string;
};

/**
 * Analytics du système de confiance
 */
export type TrustAnalytics = {
  // Distribution
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level4Count: number;
  level5Count: number;

  // Progression
  averageDaysToLevel2: number;
  averageDaysToLevel3: number;
  averageDaysToLevel4: number;
  averageDaysToLevel5: number;

  // Safety
  totalWarnings: number;
  totalBans: number;
  reportRate: number; // % of sessions with report

  // Sessions
  totalSessions: number;
  sameGenderSessionsPercent: number;
  oppositeGenderSessionsPercent: number;
  groupSessionsPercent: number;
};
