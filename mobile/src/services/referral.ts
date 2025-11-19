/**
 * Service: Programme de Parrainage
 * Gestion des parrainages, récompenses, commissions
 */

import { supabase } from './supabase';

// Types
export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'rewarded' | 'fraud';
  completed_at?: string;
  rewarded_at?: string;
  created_at: string;
}

export interface ReferralReward {
  id: string;
  referral_id: string;
  user_id: string;
  reward_type: 'moovcoins' | 'premium_days' | 'commission';
  amount: number;
  description: string;
  claimed: boolean;
  claimed_at?: string;
  created_at: string;
}

export interface ReferralTier {
  user_id: string;
  tier: 'none' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'elite';
  total_referrals: number;
  active_referrals: number;
  premium_referrals: number;
  tier_reached_at?: string;
}

export interface ReferralStats {
  user_id: string;
  total_clicks: number;
  total_signups: number;
  total_active: number;
  conversion_rate: number;
  activation_rate: number;
  total_moovcoins_earned: number;
  total_premium_days_earned: number;
  total_commission_cents: number;
  last_referral_at?: string;
}

// Configuration des paliers
export const TIER_CONFIG = {
  bronze: { min_referrals: 3, rewards: { moovcoins: 2000 } },
  silver: { min_referrals: 10, rewards: { moovcoins: 5000, premium_days: 90 } },
  gold: { min_referrals: 25, rewards: { moovcoins: 15000, premium_days: 180 } },
  diamond: { min_referrals: 50, rewards: { moovcoins: 50000, premium_lifetime: true } },
  elite: { min_referrals: 100, rewards: { moovcoins: 150000, premium_lifetime: true, revenue_share: 0.005 } },
};

// Configuration des récompenses
export const REFERRAL_REWARDS_CONFIG = {
  referrer: {
    moovcoins: 500,
    premium_days: 30,
  },
  referred: {
    moovcoins: 300,
    trust_level_boost: 1,
  },
  commission_percent: 0.30, // 30% du prix Premium
};

/**
 * Obtenir le code de parrainage de l'utilisateur
 */
export async function getMyReferralCode(): Promise<ReferralCode | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching referral code:', error);
    return null;
  }

  return data;
}

/**
 * Enregistrer un clic sur le lien de parrainage
 */
export async function trackReferralClick(code: string): Promise<void> {
  // Incrémenter compteur de clics
  const { data: referralCode } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', code)
    .single();

  if (!referralCode) return;

  await supabase.rpc('increment_referral_clicks', {
    p_user_id: referralCode.user_id,
  });
}

/**
 * Enregistrer un parrainage (inscription via lien)
 */
export async function registerReferral(
  referralCode: string,
  newUserId: string
): Promise<Referral | null> {
  // Récupérer le parrain
  const { data: codeData } = await supabase
    .from('referral_codes')
    .select('user_id')
    .eq('code', referralCode)
    .single();

  if (!codeData) {
    console.error('Invalid referral code');
    return null;
  }

  // Vérifier anti-fraude basique
  const fraudFlags = await checkFraudFlags(codeData.user_id, newUserId);

  // Créer le parrainage
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: codeData.user_id,
      referred_id: newUserId,
      referral_code: referralCode,
      status: fraudFlags.length > 0 ? 'pending' : 'pending',
      fraud_flags: fraudFlags,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating referral:', error);
    return null;
  }

  // Donner bonus au filleul immédiatement
  await grantReferredBonus(newUserId);

  return data;
}

/**
 * Vérification anti-fraude basique
 */
async function checkFraudFlags(referrerId: string, referredId: string): Promise<string[]> {
  const flags: string[] = [];

  // TODO: Implémenter checks
  // - Même IP
  // - Même device fingerprint
  // - Email jetable
  // - Pattern suspect

  return flags;
}

/**
 * Donner le bonus au filleul
 */
async function grantReferredBonus(userId: string): Promise<void> {
  // 1. MoovCoins
  await supabase.rpc('add_moovcoins', {
    p_user_id: userId,
    p_amount: REFERRAL_REWARDS_CONFIG.referred.moovcoins,
    p_reason: 'Bonus parrainage - Bienvenue ! 🎁',
  });

  // 2. Trust Level boost (skip niveau 0 → direct niveau 1)
  await supabase
    .from('profiles')
    .update({ trust_level: REFERRAL_REWARDS_CONFIG.referred.trust_level_boost })
    .eq('id', userId)
    .eq('trust_level', 0); // Seulement si actuellement niveau 0
}

/**
 * Compléter un parrainage (filleul a fait sa 1ère session)
 */
export async function completeReferral(referredId: string): Promise<void> {
  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_id', referredId)
    .eq('status', 'pending')
    .single();

  if (!referral) return;

  // Marquer comme complété
  await supabase
    .from('referrals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  // Donner récompenses au parrain
  await grantReferrerRewards(referral.referrer_id, referral.id);

  // Mettre à jour stats et tier
  await updateReferralStats(referral.referrer_id);
  await updateReferralTier(referral.referrer_id);
}

/**
 * Donner les récompenses au parrain
 */
async function grantReferrerRewards(referrerId: string, referralId: string): Promise<void> {
  // 1. MoovCoins
  await supabase
    .from('referral_rewards')
    .insert({
      referral_id: referralId,
      user_id: referrerId,
      reward_type: 'moovcoins',
      amount: REFERRAL_REWARDS_CONFIG.referrer.moovcoins,
      description: 'Parrainage réussi ! 🎉',
    });

  await supabase.rpc('add_moovcoins', {
    p_user_id: referrerId,
    p_amount: REFERRAL_REWARDS_CONFIG.referrer.moovcoins,
    p_reason: 'Parrainage réussi ! 🎉',
  });

  // 2. Premium gratuit
  await supabase
    .from('referral_rewards')
    .insert({
      referral_id: referralId,
      user_id: referrerId,
      reward_type: 'premium_days',
      amount: REFERRAL_REWARDS_CONFIG.referrer.premium_days,
      description: '+30 jours Premium gratuit',
    });

  // TODO: Ajouter les jours Premium au compte
  // await addPremiumDays(referrerId, REFERRAL_REWARDS_CONFIG.referrer.premium_days);
}

/**
 * Mettre à jour les stats de parrainage
 */
async function updateReferralStats(userId: string): Promise<void> {
  await supabase.rpc('update_referral_stats', {
    p_user_id: userId,
  });
}

/**
 * Mettre à jour le palier (tier)
 */
async function updateReferralTier(userId: string): Promise<void> {
  await supabase.rpc('update_referral_tier', {
    p_user_id: userId,
  });
}

/**
 * Obtenir les stats de parrainage
 */
export async function getMyReferralStats(): Promise<ReferralStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('referral_stats')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching referral stats:', error);
    return null;
  }

  return data || {
    user_id: user.id,
    total_clicks: 0,
    total_signups: 0,
    total_active: 0,
    conversion_rate: 0,
    activation_rate: 0,
    total_moovcoins_earned: 0,
    total_premium_days_earned: 0,
    total_commission_cents: 0,
  };
}

/**
 * Obtenir le palier actuel
 */
export async function getMyReferralTier(): Promise<ReferralTier | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('referral_tiers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching referral tier:', error);
    return null;
  }

  return data || {
    user_id: user.id,
    tier: 'none',
    total_referrals: 0,
    active_referrals: 0,
    premium_referrals: 0,
  };
}

/**
 * Obtenir la liste des filleuls
 */
export async function getMyReferrals(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referred:profiles!referrals_referred_id_fkey (
        id,
        username,
        avatar_url,
        subscription_tier,
        created_at
      )
    `)
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtenir le leaderboard des parrains
 */
export async function getReferralLeaderboard(limit: number = 100): Promise<any[]> {
  const { data, error } = await supabase
    .from('referral_tiers')
    .select(`
      *,
      profile:profiles!referral_tiers_user_id_fkey (
        username,
        avatar_url
      )
    `)
    .order('total_referrals', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

/**
 * Générer URL de partage
 */
export function generateShareURL(code: string): string {
  return `https://moovup.app/invite/${code}`;
}

/**
 * Générer message de partage
 */
export function generateShareMessage(code: string, username: string): string {
  return `Hey ! 👋

Je teste MoovUp Now pour trouver des partenaires sport près de chez moi, c'est top ! 🏃‍♂️

Si tu veux essayer, utilise mon code pour avoir +300 MoovCoins gratuits :

${code}

Télécharge : ${generateShareURL(code)}

On pourrait faire une session ensemble ! 💪

– ${username}`;
}

/**
 * Incrémenter compteur de clics (appelé depuis deep link)
 */
export async function incrementReferralClicks(userId: string): Promise<void> {
  const { error } = await supabase
    .from('referral_stats')
    .upsert({
      user_id: userId,
      total_clicks: 1,
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false,
    });

  if (error) {
    // Utiliser RPC si upsert avec increment pas supporté
    await supabase.rpc('increment_referral_clicks', {
      p_user_id: userId,
    });
  }
}
