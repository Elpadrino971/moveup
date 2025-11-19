/**
 * MoovUp Now - Profile Service
 */

import { supabase } from './supabase';
import { UserProfile, Sport, Badge, UserGoal } from '../types';

/**
 * Get current user's complete profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        `
        *,
        user_sports (
          sport_id,
          skill_level,
          is_favorite,
          sports (*)
        ),
        user_badges (
          badge_id,
          earned_at,
          badges (*)
        )
      `
      )
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return profile as unknown as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Get user profile by ID (public info only)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        avatar_url,
        bio,
        gender,
        trust_level,
        same_gender_sessions,
        opposite_gender_sessions,
        group_sessions,
        average_rating,
        total_sessions,
        qr_code,
        user_sports (
          sport_id,
          skill_level,
          is_favorite,
          sports (*)
        ),
        user_badges (
          badge_id,
          earned_at,
          badges (*)
        )
      `
      )
      .eq('id', userId)
      .single();

    if (error) throw error;

    return profile as unknown as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data as UserProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(
  fileUri: string,
  userId: string
): Promise<string> {
  try {
    // Convert file URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const fileExt = fileUri.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Update profile with new avatar URL
    await updateProfile({ avatar_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

/**
 * Get user's sports
 */
export async function getUserSports(): Promise<Sport[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('user_sports')
      .select('sports (*)')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false });

    if (error) throw error;

    return (data?.map((item: any) => item.sports) || []) as Sport[];
  } catch (error) {
    console.error('Error fetching user sports:', error);
    return [];
  }
}

/**
 * Get user's active goals
 */
export async function getUserGoals(): Promise<UserGoal[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) throw error;

    return (data || []) as UserGoal[];
  } catch (error) {
    console.error('Error fetching user goals:', error);
    return [];
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(): Promise<Badge[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('user_badges')
      .select('badges (*), earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return (data?.map((item: any) => item.badges) || []) as Badge[];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Get user's trust stats for level calculation
 */
export async function getTrustStats(userId?: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('No user ID provided');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        `
        trust_level,
        same_gender_sessions,
        opposite_gender_sessions,
        group_sessions,
        average_rating,
        total_sessions,
        charter_accepted,
        charter_accepted_at
      `
      )
      .eq('id', targetUserId)
      .single();

    if (error) throw error;

    // Calculate account age in days
    const accountAgeMs =
      Date.now() - new Date(profile.charter_accepted_at || Date.now()).getTime();
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));

    return {
      trustLevel: profile.trust_level || 1,
      sameGenderSessions: profile.same_gender_sessions || 0,
      oppositeGenderSessions: profile.opposite_gender_sessions || 0,
      groupSessions: profile.group_sessions || 0,
      averageRating: profile.average_rating || 0,
      totalSessions: profile.total_sessions || 0,
      accountAgeDays,
      charterAccepted: profile.charter_accepted || false,
    };
  } catch (error) {
    console.error('Error fetching trust stats:', error);
    throw error;
  }
}
