/**
 * MoovUp Now - Auth Context
 *
 * Contexte global pour gérer l'authentification
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import * as authService from '../services/auth';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOnboardingComplete: boolean;
  signUp: (data: authService.SignUpData) => Promise<void>;
  signIn: (data: authService.SignInData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    // Récupérer la session initiale
    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkOnboarding();
      }

      setLoading(false);
    });

    // Écouter les changements d'auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          await checkOnboarding();
        }

        if (event === 'SIGNED_OUT') {
          setIsOnboardingComplete(false);
        }

        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkOnboarding = async () => {
    const complete = await authService.isOnboardingComplete();
    setIsOnboardingComplete(complete);
  };

  const signUp = async (data: authService.SignUpData) => {
    try {
      setLoading(true);
      await authService.signUp(data);
      // L'onAuthStateChange se déclenchera automatiquement
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: authService.SignInData) => {
    try {
      setLoading(true);
      await authService.signIn(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      await authService.signInWithApple();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setIsOnboardingComplete(false);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await authService.completeOnboarding();
      setIsOnboardingComplete(true);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isOnboardingComplete,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
