/**
 * MoovUp Now - Coaching Types
 */

import { Sport, UserGoal } from './user';

export type WorkoutDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type Exercise = {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  sets?: number;
  reps?: number;
  restTime?: number; // in seconds
  difficulty: WorkoutDifficulty;
  targetMuscles: string[];
  equipment: string[];
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  sport: Sport;
  difficulty: WorkoutDifficulty;
  duration: number; // in minutes
  exercises: Exercise[];
  calories?: number;
  goals: UserGoal[];
  thumbnailUrl?: string;
  isPopular: boolean;
  createdAt: string;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  goal: UserGoal;
  duration: number; // in weeks
  workoutsPerWeek: number;
  workouts: Workout[];
  isActive: boolean;
  createdAt: string;
};

export type PersonalGoal = {
  id: string;
  userId: string;
  type: UserGoal;
  target: number;
  current: number;
  unit: string; // 'kg', 'km', 'sessions', 'minutes', etc.
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
};

export type ProgressEntry = {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  photos?: string[];
  notes?: string;
  createdAt: string;
};

export type Coach = {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  specialties: Sport[];
  rating: number;
  reviewsCount: number;
  pricePerSession: number;
  isVerified: boolean;
  certifications: string[];
};

export type CoachingSession = {
  id: string;
  userId: string;
  coachId: string;
  coach: Coach;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
  createdAt: string;
};
