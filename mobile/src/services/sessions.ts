/**
 * MoovUp Now - Sessions Service
 */

import { supabase } from './supabase';
import { Session, SessionParticipant, SessionStatus } from '../types';
import { canMatch } from '../utils/trustLevel';

/**
 * Create a new session
 */
export async function createSession(sessionData: {
  sport_id: string;
  title: string;
  description?: string;
  location_lat: number;
  location_lng: number;
  location_name: string;
  session_type: 'one-on-one' | 'group';
  max_participants: number;
  scheduled_at: string;
  duration_minutes: number;
  gender_preference?: 'male' | 'female' | 'any';
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Get user's profile to check gender
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, trust_level')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        creator_id: user.id,
        sport_id: sessionData.sport_id,
        title: sessionData.title,
        description: sessionData.description,
        location_lat: sessionData.location_lat,
        location_lng: sessionData.location_lng,
        location_name: sessionData.location_name,
        session_type: sessionData.session_type,
        max_participants: sessionData.max_participants,
        scheduled_at: sessionData.scheduled_at,
        duration_minutes: sessionData.duration_minutes,
        gender_preference: sessionData.gender_preference,
        status: 'pending',
      })
      .select(
        `
        *,
        creator:profiles!creator_id (
          id,
          username,
          avatar_url,
          gender,
          trust_level,
          average_rating
        ),
        sport:sports (*)
      `
      )
      .single();

    if (error) throw error;

    // Auto-add creator as participant
    await supabase.from('session_participants').insert({
      session_id: data.id,
      user_id: user.id,
      status: 'confirmed',
    });

    return data as Session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

/**
 * Get nearby sessions
 */
export async function getNearbySessions(
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  filters?: {
    sport_id?: string;
    session_type?: 'one-on-one' | 'group';
    date_from?: string;
    date_to?: string;
  }
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, trust_level')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    let query = supabase
      .from('sessions')
      .select(
        `
        *,
        creator:profiles!creator_id (
          id,
          username,
          avatar_url,
          gender,
          trust_level,
          average_rating
        ),
        sport:sports (*),
        session_participants (
          user_id,
          status
        )
      `
      )
      .eq('status', 'pending')
      .gte('scheduled_at', new Date().toISOString())
      .neq('creator_id', user.id); // Don't show own sessions

    // Apply filters
    if (filters?.sport_id) {
      query = query.eq('sport_id', filters.sport_id);
    }

    if (filters?.session_type) {
      query = query.eq('session_type', filters.session_type);
    }

    if (filters?.date_from) {
      query = query.gte('scheduled_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('scheduled_at', filters.date_to);
    }

    const { data: sessions, error } = await query;

    if (error) throw error;

    // Filter by distance and matching permissions
    const filteredSessions = (sessions || []).filter((session: any) => {
      // Calculate distance (simple approximation)
      const distance = calculateDistance(
        latitude,
        longitude,
        session.location_lat,
        session.location_lng
      );

      if (distance > radiusKm) return false;

      // Check if user can match with creator based on trust level
      const matchPermission = canMatch(
        profile.trust_level,
        profile.gender,
        session.creator.gender,
        session.session_type
      );

      return matchPermission.allowed;
    });

    return filteredSessions as Session[];
  } catch (error) {
    console.error('Error fetching nearby sessions:', error);
    throw error;
  }
}

/**
 * Get user's created sessions
 */
export async function getMySessions() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('sessions')
      .select(
        `
        *,
        creator:profiles!creator_id (
          id,
          username,
          avatar_url,
          gender,
          trust_level,
          average_rating
        ),
        sport:sports (*),
        session_participants (
          user_id,
          status,
          user:profiles (
            id,
            username,
            avatar_url,
            gender,
            trust_level
          )
        )
      `
      )
      .eq('creator_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return (data || []) as Session[];
  } catch (error) {
    console.error('Error fetching my sessions:', error);
    throw error;
  }
}

/**
 * Get sessions user has joined
 */
export async function getJoinedSessions() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('session_participants')
      .select(
        `
        *,
        session:sessions (
          *,
          creator:profiles!creator_id (
            id,
            username,
            avatar_url,
            gender,
            trust_level,
            average_rating
          ),
          sport:sports (*)
        )
      `
      )
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data?.map((p: any) => p.session) || []) as Session[];
  } catch (error) {
    console.error('Error fetching joined sessions:', error);
    throw error;
  }
}

/**
 * Join a session
 */
export async function joinSession(sessionId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(
        `
        *,
        creator:profiles!creator_id (gender),
        session_participants (user_id)
      `
      )
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;
    if (!session) throw new Error('Session not found');

    // Check if session is full
    const currentParticipants = session.session_participants?.length || 0;
    if (currentParticipants >= session.max_participants) {
      throw new Error('Session is full');
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, trust_level')
      .eq('id', user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    // Check matching permission
    const matchPermission = canMatch(
      profile.trust_level,
      profile.gender,
      session.creator.gender,
      session.session_type
    );

    if (!matchPermission.allowed) {
      throw new Error(matchPermission.reason || 'Cannot join this session');
    }

    // Add user as participant
    const { data, error } = await supabase
      .from('session_participants')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('You have already joined this session');
      }
      throw error;
    }

    // Update session status if it's now matched
    if (currentParticipants + 1 >= session.max_participants) {
      await supabase
        .from('sessions')
        .update({ status: 'matched' })
        .eq('id', sessionId);
    }

    return data as SessionParticipant;
  } catch (error) {
    console.error('Error joining session:', error);
    throw error;
  }
}

/**
 * Leave a session
 */
export async function leaveSession(sessionId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('session_participants')
      .update({ status: 'cancelled' })
      .eq('session_id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;

    // Update session status back to pending if needed
    await supabase
      .from('sessions')
      .update({ status: 'pending' })
      .eq('id', sessionId)
      .eq('status', 'matched');

    return true;
  } catch (error) {
    console.error('Error leaving session:', error);
    throw error;
  }
}

/**
 * Cancel a session (creator only)
 */
export async function cancelSession(sessionId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId)
      .eq('creator_id', user.id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error cancelling session:', error);
    throw error;
  }
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(
        `
        *,
        creator:profiles!creator_id (
          id,
          username,
          avatar_url,
          gender,
          trust_level,
          average_rating,
          bio
        ),
        sport:sports (*),
        session_participants (
          *,
          user:profiles (
            id,
            username,
            avatar_url,
            gender,
            trust_level
          )
        )
      `
      )
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    return data as Session;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if user can create a session with specific gender preference
 */
export async function canCreateSession(
  sessionType: 'one-on-one' | 'group',
  genderPreference?: 'male' | 'female' | 'any'
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { allowed: false, reason: 'Not authenticated' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, trust_level')
      .eq('id', user.id)
      .single();

    if (!profile) return { allowed: false, reason: 'Profile not found' };

    // Groups are always allowed
    if (sessionType === 'group') {
      return { allowed: true };
    }

    // One-on-one with same gender is always allowed
    if (
      genderPreference === profile.gender ||
      genderPreference === 'any' ||
      !genderPreference
    ) {
      return { allowed: true };
    }

    // Check trust level for opposite gender
    if (profile.trust_level >= 3) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Niveau 3 requis pour sessions sexe opposé (actuellement niveau ${profile.trust_level})`,
    };
  } catch (error) {
    console.error('Error checking session creation permission:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
}
