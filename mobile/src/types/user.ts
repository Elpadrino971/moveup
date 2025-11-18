/**
 * MoovUp Now - User Types
 */

import { TrustLevel, TrustStats } from './trust';

export type UserGender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export type SportLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type Sport = {
  id: string;
  name: string;
  icon: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'team' | 'outdoor' | 'indoor';
};

export type UserGoal =
  | 'weight-loss'
  | 'muscle-gain'
  | 'cardio'
  | 'flexibility'
  | 'wellness'
  | 'social'
  | 'competition';

export type Availability = 'morning' | 'noon' | 'afternoon' | 'evening' | 'weekend';

export type IntegrityStatus = {
  warnings: number;
  sessionsCompleted: number;
  isVerified: boolean;
  verificationDate?: string;
  lastWarningDate?: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
};

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  city?: string;
  zipCode?: string;

  // Sports & fitness
  favoriteSports: Sport[];
  goals: UserGoal[];
  level: SportLevel;
  availabilities: Availability[];

  // Preferences
  preferredPartnerGender?: UserGender;
  maxDistance: number; // in km
  preferVerifiedOnly: boolean;

  // Gamification
  level: number;
  points: number;
  badges: Badge[];

  // Trust System (Système de confiance progressif)
  trustLevel: TrustLevel;
  trustStats: TrustStats;

  // Integrity
  integrity: IntegrityStatus;

  // QR Code
  qrCode: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
};

export type PublicUserProfile = Pick<
  UserProfile,
  | 'id'
  | 'username'
  | 'avatarUrl'
  | 'bio'
  | 'city'
  | 'favoriteSports'
  | 'level'
  | 'badges'
  | 'trustLevel'
  | 'trustStats'
  | 'integrity'
  | 'qrCode'
>;
