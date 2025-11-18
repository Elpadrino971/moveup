/**
 * MoovUp Now - Session Types
 */

import { Sport, SportLevel, PublicUserProfile } from './user';

export type SessionStatus =
  | 'pending' // Créée, en attente de match
  | 'matched' // Match trouvé, confirmé
  | 'confirmed' // Les deux parties ont confirmé
  | 'in-progress' // Session en cours (QR scanné)
  | 'completed' // Session terminée
  | 'cancelled' // Annulée
  | 'no-show'; // L'autre n'est pas venu

export type Location = {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string; // Nom du lieu (ex: "Parc de la Tête d'Or")
  isPublic: boolean;
};

export type Session = {
  id: string;
  creatorId: string;
  creator: PublicUserProfile;

  // Details
  sport: Sport;
  level: SportLevel;
  location: Location;
  scheduledAt: string;
  duration: number; // in minutes
  maxParticipants: number;

  // Participants
  participants: SessionParticipant[];

  // Status
  status: SessionStatus;

  // QR validation
  qrCode: string;
  validatedAt?: string;

  // Optional
  description?: string;
  isPrivate: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
};

export type SessionParticipant = {
  userId: string;
  user: PublicUserProfile;
  joinedAt: string;
  status: 'pending' | 'confirmed' | 'validated' | 'cancelled';
  qrScannedAt?: string;
  rating?: SessionRating;
};

export type SessionRating = {
  id: string;
  sessionId: string;
  raterId: string;
  ratedUserId: string;
  score: 1 | 2 | 3 | 4 | 5; // Stars
  comment?: string;
  badges?: ('punctual' | 'motivating' | 'friendly' | 'skilled' | 'safe')[];
  createdAt: string;
};

export type SessionReport = {
  id: string;
  sessionId: string;
  reporterId: string;
  reportedUserId: string;
  reason:
    | 'inappropriate-behavior'
    | 'harassment'
    | 'repeated-cancellation'
    | 'fake-profile'
    | 'unsafe-location'
    | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
};
