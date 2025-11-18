/**
 * MoovUp Now - Trust Level Utilities
 *
 * Fonctions pour gérer le système de confiance progressif
 */

import {
  TrustLevel,
  TrustLevelName,
  TrustLevelInfo,
  TrustStats,
  TrustRequirement,
  TrustLevelConfig,
  MatchPermission,
  RestrictionAction,
  SessionType,
  LocationType,
  LocationSafety,
} from '../types/trust';
import { UserGender } from '../types/user';

// ============================================================================
// CONFIGURATION DES NIVEAUX
// ============================================================================

export const TRUST_LEVEL_CONFIGS: Record<TrustLevel, TrustLevelConfig> = {
  1: {
    level: 1,
    name: 'beginner',
    badge: '🔰',
    badgeColor: '#9CA3AF',
    displayName: 'Débutant',

    minSessions: 0,
    minAverageRating: 0,
    maxWarnings: 999,
    requireVerified: false,

    permissions: {
      matchSameGender: true,
      matchOppositeGenderGroup: true,
      matchOppositeGenderOneOnOne: false,
      canSponsor: false,
      priorityMatching: false,
    },

    pointsBonus: 0,
    shopDiscount: 0,

    nextLevel: {
      sessionsNeeded: 5,
      ratingNeeded: 4.0,
      otherRequirements: ['0 avertissement'],
    },
  },

  2: {
    level: 2,
    name: 'confirmed',
    badge: '⚡',
    badgeColor: '#60A5FA',
    displayName: 'Confirmé',

    minSessions: 5,
    minAverageRating: 4.0,
    maxWarnings: 0,
    requireVerified: false,

    permissions: {
      matchSameGender: true,
      matchOppositeGenderGroup: true,
      matchOppositeGenderOneOnOne: false,
      canSponsor: false,
      priorityMatching: false,
    },

    pointsBonus: 5,
    shopDiscount: 0,

    nextLevel: {
      sessionsNeeded: 10,
      ratingNeeded: 4.5,
      otherRequirements: ['Compte vérifié (email + téléphone)'],
    },
  },

  3: {
    level: 3,
    name: 'verified',
    badge: '✅',
    badgeColor: '#10B981',
    displayName: 'Vérifié',

    minSessions: 10,
    minAverageRating: 4.5,
    maxWarnings: 0,
    requireVerified: true,

    permissions: {
      matchSameGender: true,
      matchOppositeGenderGroup: true,
      matchOppositeGenderOneOnOne: true,
      canSponsor: false,
      priorityMatching: false,
    },

    pointsBonus: 10,
    shopDiscount: 5,

    nextLevel: {
      sessionsNeeded: 20,
      ratingNeeded: 4.5,
      otherRequirements: ['Maximum 1 avertissement'],
    },
  },

  4: {
    level: 4,
    name: 'expert',
    badge: '🏆',
    badgeColor: '#F59E0B',
    displayName: 'Expert',

    minSessions: 20,
    minAverageRating: 4.5,
    maxWarnings: 1,
    requireVerified: true,

    permissions: {
      matchSameGender: true,
      matchOppositeGenderGroup: true,
      matchOppositeGenderOneOnOne: true,
      canSponsor: false,
      priorityMatching: true,
    },

    pointsBonus: 15,
    shopDiscount: 10,

    nextLevel: {
      sessionsNeeded: 50,
      ratingNeeded: 4.8,
      otherRequirements: ['0 avertissement', 'Compte actif 3+ mois'],
    },
  },

  5: {
    level: 5,
    name: 'legend',
    badge: '👑',
    badgeColor: '#FFD700',
    displayName: 'Legend',

    minSessions: 50,
    minAverageRating: 4.8,
    maxWarnings: 0,
    requireVerified: true,
    minAccountAgeDays: 90,

    permissions: {
      matchSameGender: true,
      matchOppositeGenderGroup: true,
      matchOppositeGenderOneOnOne: true,
      canSponsor: true,
      priorityMatching: true,
    },

    pointsBonus: 20,
    shopDiscount: 20,

    premiumAccess: {
      coachingMonths: 1,
      features: ['Statistiques avancées', 'Top utilisateurs', 'Parrainage'],
    },
  },
};

// ============================================================================
// CALCUL DU NIVEAU DE CONFIANCE
// ============================================================================

/**
 * Calcule le niveau de confiance basé sur les statistiques utilisateur
 */
export function calculateTrustLevel(stats: TrustStats): TrustLevel {
  const {
    sessionsCompleted,
    averageRating,
    warningsCount,
    isVerified,
    accountAgeInDays,
  } = stats;

  // Niveau 1 : Débutant
  if (sessionsCompleted < 5) return 1;

  // Niveau 2 : Confirmé
  if (sessionsCompleted < 10 || averageRating < 4.0 || warningsCount > 0) {
    return 2;
  }

  // Niveau 3 : Vérifié
  if (sessionsCompleted < 20 || averageRating < 4.5 || !isVerified) {
    return 3;
  }

  // Niveau 4 : Expert
  if (sessionsCompleted < 50 || warningsCount > 1) {
    return 4;
  }

  // Niveau 5 : Legend
  if (
    sessionsCompleted >= 50 &&
    averageRating >= 4.8 &&
    warningsCount === 0 &&
    accountAgeInDays >= 90
  ) {
    return 5;
  }

  return 3; // Défaut
}

/**
 * Obtient les informations complètes sur un niveau de confiance
 */
export function getTrustLevelInfo(
  level: TrustLevel,
  stats: TrustStats
): TrustLevelInfo {
  const config = TRUST_LEVEL_CONFIGS[level];
  const requirements = getTrustRequirements(level, stats);

  const progressPercentage =
    (stats.sessionsCompleted / config.minSessions) * 100;

  const nextLevelConfig = level < 5 ? TRUST_LEVEL_CONFIGS[(level + 1) as TrustLevel] : undefined;

  return {
    level,
    name: config.name,
    badge: config.badge,
    color: config.badgeColor,

    canMatchOppositeGenderOneOnOne: config.permissions.matchOppositeGenderOneOnOne,
    canMatchOppositeGenderGroup: config.permissions.matchOppositeGenderGroup,
    canMatchSameGender: config.permissions.matchSameGender,

    currentSessions: stats.sessionsCompleted,
    requiredSessions: config.minSessions,
    progressPercentage: Math.min(progressPercentage, 100),

    requirements,

    benefits: getBenefits(level, config),

    nextLevel: nextLevelConfig
      ? {
          level: (level + 1) as TrustLevel,
          name: nextLevelConfig.name,
          sessionsToGo: Math.max(
            0,
            nextLevelConfig.minSessions - stats.sessionsCompleted
          ),
          otherRequirements: nextLevelConfig.nextLevel?.otherRequirements || [],
        }
      : undefined,
  };
}

/**
 * Obtient les requis pour un niveau donné
 */
function getTrustRequirements(
  level: TrustLevel,
  stats: TrustStats
): TrustRequirement[] {
  const config = TRUST_LEVEL_CONFIGS[level];
  const requirements: TrustRequirement[] = [];

  // Sessions requirement
  if (config.minSessions > 0) {
    requirements.push({
      type: 'sessions',
      label: `${config.minSessions} sessions complétées`,
      required: config.minSessions,
      current: stats.sessionsCompleted,
      isMet: stats.sessionsCompleted >= config.minSessions,
    });
  }

  // Rating requirement
  if (config.minAverageRating > 0) {
    requirements.push({
      type: 'rating',
      label: `Note moyenne ≥ ${config.minAverageRating}/5`,
      required: config.minAverageRating,
      current: stats.averageRating,
      isMet: stats.averageRating >= config.minAverageRating,
    });
  }

  // Warnings requirement
  requirements.push({
    type: 'warnings',
    label: `Maximum ${config.maxWarnings} avertissement${
      config.maxWarnings > 1 ? 's' : ''
    }`,
    required: config.maxWarnings,
    current: stats.warningsCount,
    isMet: stats.warningsCount <= config.maxWarnings,
  });

  // Verification requirement
  if (config.requireVerified) {
    requirements.push({
      type: 'verified',
      label: 'Compte vérifié (email + téléphone)',
      required: true,
      current: stats.isVerified,
      isMet: stats.isVerified,
    });
  }

  // Account age requirement
  if (config.minAccountAgeDays) {
    requirements.push({
      type: 'account-age',
      label: `Compte actif depuis ${Math.floor(config.minAccountAgeDays / 30)} mois`,
      required: config.minAccountAgeDays,
      current: stats.accountAgeInDays,
      isMet: stats.accountAgeInDays >= config.minAccountAgeDays,
    });
  }

  return requirements;
}

/**
 * Obtient les avantages d'un niveau
 */
function getBenefits(level: TrustLevel, config: TrustLevelConfig): string[] {
  const benefits: string[] = [];

  if (config.permissions.matchOppositeGenderOneOnOne) {
    benefits.push('Matching sexe opposé en binôme');
  }

  if (config.permissions.priorityMatching) {
    benefits.push('Priorité dans les suggestions');
  }

  if (config.pointsBonus > 0) {
    benefits.push(`+${config.pointsBonus}% de points par session`);
  }

  if (config.shopDiscount > 0) {
    benefits.push(`${config.shopDiscount}% de réduction boutique`);
  }

  if (config.permissions.canSponsor) {
    benefits.push('Peut parrainer des débutants');
  }

  if (config.premiumAccess) {
    benefits.push(
      `${config.premiumAccess.coachingMonths} mois coaching premium offert`
    );
    benefits.push(...config.premiumAccess.features);
  }

  return benefits;
}

// ============================================================================
// PERMISSIONS DE MATCHING
// ============================================================================

/**
 * Vérifie si un utilisateur peut matcher avec un autre
 */
export function canMatch(
  userLevel: TrustLevel,
  userGender: UserGender,
  targetGender: UserGender,
  sessionType: SessionType
): MatchPermission {
  const config = TRUST_LEVEL_CONFIGS[userLevel];

  // Même sexe toujours autorisé
  if (userGender === targetGender) {
    return {
      allowed: true,
    };
  }

  // Groupes toujours autorisés
  if (sessionType === 'group') {
    return {
      allowed: true,
    };
  }

  // Sexe opposé en binôme
  if (sessionType === 'one-on-one') {
    if (config.permissions.matchOppositeGenderOneOnOne) {
      return {
        allowed: true,
      };
    } else {
      return {
        allowed: false,
        reason: 'Niveau de confiance insuffisant',
        restrictions: [
          `Tu dois atteindre le Niveau 3 (Vérifié) pour matcher avec le sexe opposé en binôme`,
          `Progression actuelle : Niveau ${userLevel}`,
        ],
        suggestions: [
          'Rejoindre des groupes mixtes (3+ personnes)',
          'Matcher avec le même sexe pour progresser',
        ],
      };
    }
  }

  return {
    allowed: false,
    reason: 'Type de session non reconnu',
  };
}

/**
 * Obtient l'action de restriction appropriée
 */
export function getRestrictionAction(
  userLevel: TrustLevel,
  userGender: UserGender,
  targetGender: UserGender,
  sessionType: SessionType
): RestrictionAction | null {
  const permission = canMatch(userLevel, userGender, targetGender, sessionType);

  if (permission.allowed) {
    return null;
  }

  return {
    type: 'block',
    title: '🔒 Fonctionnalité Non Débloquée',
    message:
      permission.reason ||
      'Tu dois progresser pour débloquer cette fonctionnalité',
    alternatives: permission.suggestions?.map((suggestion) => ({
      label: suggestion,
      action: 'navigate',
    })),
  };
}

// ============================================================================
// SÉCURITÉ DES LIEUX
// ============================================================================

/**
 * Évalue la sécurité d'un lieu
 */
export function evaluateLocationSafety(
  locationType: LocationType,
  userLevel: TrustLevel
): { safety: LocationSafety; message?: string } {
  // Lieux publics toujours safe
  if (
    locationType === 'public-park' ||
    locationType === 'gym' ||
    locationType === 'stadium'
  ) {
    return { safety: 'safe' };
  }

  // Rue publique - OK mais warning
  if (locationType === 'public-street') {
    return {
      safety: 'warning',
      message: '⚠️ Privilégie les lieux publics fermés (parc, salle, stade)',
    };
  }

  // Domicile privé - Warning fort pour Niveau 1-2
  if (locationType === 'private-home') {
    if (userLevel <= 2) {
      return {
        safety: 'unsafe',
        message:
          '🚫 Pour ta sécurité, nous recommandons fortement un lieu public pour les premières sessions.',
      };
    } else {
      return {
        safety: 'warning',
        message:
          '⚠️ Attention : lieu privé. Assure-toi de bien connaître la personne.',
      };
    }
  }

  // Lieu isolé - Warning pour tous
  if (locationType === 'isolated-area') {
    return {
      safety: 'unsafe',
      message:
        '🚫 Lieu isolé détecté. Choisis un endroit plus fréquenté pour ta sécurité.',
    };
  }

  return { safety: 'safe' };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtient le nom d'un niveau
 */
export function getTrustLevelName(level: TrustLevel): string {
  return TRUST_LEVEL_CONFIGS[level].displayName;
}

/**
 * Obtient le badge d'un niveau
 */
export function getTrustLevelBadge(level: TrustLevel): string {
  return TRUST_LEVEL_CONFIGS[level].badge;
}

/**
 * Obtient la couleur d'un niveau
 */
export function getTrustLevelColor(level: TrustLevel): string {
  return TRUST_LEVEL_CONFIGS[level].badgeColor;
}

/**
 * Vérifie si un utilisateur peut parrainer
 */
export function canSponsor(level: TrustLevel): boolean {
  return TRUST_LEVEL_CONFIGS[level].permissions.canSponsor;
}

/**
 * Calcule les points bonus basés sur le niveau
 */
export function calculatePointsBonus(
  basePoints: number,
  level: TrustLevel
): number {
  const bonus = TRUST_LEVEL_CONFIGS[level].pointsBonus;
  return Math.floor(basePoints * (1 + bonus / 100));
}

/**
 * Calcule la réduction boutique
 */
export function calculateShopDiscount(
  price: number,
  level: TrustLevel
): number {
  const discount = TRUST_LEVEL_CONFIGS[level].shopDiscount;
  return Math.floor(price * (discount / 100));
}
