/**
 * MoovUp Now - Authentication Service
 *
 * Gestion complète de l'authentification avec Supabase
 */

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

export type SignUpData = {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
};

export type SignInData = {
  email: string;
  password: string;
};

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signUp(data: SignUpData) {
  try {
    // 1. Créer le compte auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // 2. Créer le profil dans la table profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username: data.username,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      trust_level: 1, // Commence au niveau 1 (Débutant)
      charter_accepted: false, // Devra accepter la charte pendant l'onboarding
    });

    if (profileError) throw profileError;

    return {
      user: authData.user,
      session: authData.session,
    };
  } catch (error: any) {
    console.error('SignUp error:', error);
    throw new Error(error.message || 'Erreur lors de l\'inscription');
  }
}

/**
 * Connexion utilisateur
 */
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return {
      user: authData.user,
      session: authData.session,
    };
  } catch (error: any) {
    console.error('SignIn error:', error);
    throw new Error(error.message || 'Erreur lors de la connexion');
  }
}

/**
 * Connexion avec Google
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Google SignIn error:', error);
    throw new Error(error.message || 'Erreur lors de la connexion Google');
  }
}

/**
 * Connexion avec Apple
 */
export async function signInWithApple() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Apple SignIn error:', error);
    throw new Error(error.message || 'Erreur lors de la connexion Apple');
  }
}

/**
 * Déconnexion
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Nettoyer le storage local
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.onboardingComplete,
      STORAGE_KEYS.lastLocation,
    ]);
  } catch (error: any) {
    console.error('SignOut error:', error);
    throw new Error(error.message || 'Erreur lors de la déconnexion');
  }
}

/**
 * Récupérer la session courante
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error: any) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Récupérer l'utilisateur courant
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error: any) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Réinitialisation de mot de passe
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'moovupnow://reset-password',
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Reset password error:', error);
    throw new Error(
      error.message || 'Erreur lors de la réinitialisation du mot de passe'
    );
  }
}

/**
 * Mettre à jour le mot de passe
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (error: any) {
    console.error('Update password error:', error);
    throw new Error(error.message || 'Erreur lors de la mise à jour du mot de passe');
  }
}

/**
 * Vérifier si le username est disponible
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;
    return !data; // Disponible si aucun résultat
  } catch (error) {
    console.error('Check username error:', error);
    return false;
  }
}

/**
 * Vérifier si l'onboarding est complété
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete);
    if (stored === 'true') return true;

    // Vérifier dans Supabase si la charte est acceptée
    const user = await getCurrentUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('charter_accepted')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data?.charter_accepted || false;
  } catch (error) {
    console.error('Check onboarding error:', error);
    return false;
  }
}

/**
 * Marquer l'onboarding comme complété
 */
export async function completeOnboarding() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('No user found');

    // Mettre à jour la BDD
    const { error } = await supabase
      .from('profiles')
      .update({
        charter_accepted: true,
        charter_accepted_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) throw error;

    // Stocker localement
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
  } catch (error: any) {
    console.error('Complete onboarding error:', error);
    throw new Error(error.message || 'Erreur lors de la complétion de l\'onboarding');
  }
}
