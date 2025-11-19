/**
 * MoovUp Now - Root Navigator
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREEN_NAMES } from '../constants';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../theme';
import MainTabs from './MainTabs';

// Auth screens
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Onboarding screens
import {
  OnboardingSportsScreen,
  OnboardingGoalsScreen,
  OnboardingAvailabilityScreen,
  OnboardingCharterScreen,
} from '../screens/onboarding';

// Game-Changing Feature screens
import ReferralScreen from '../screens/main/ReferralScreen';
import SentinelSetupScreen from '../screens/main/SentinelSetupScreen';

// Session screens
import {
  CreateSessionScreen,
  SessionDetailScreen,
  SessionQRScreen,
  SessionRatingScreen,
} from '../screens/session';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, loading, isOnboardingComplete } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // Auth Stack - User not authenticated
          <>
            <Stack.Screen
              name={SCREEN_NAMES.AUTH_LANDING}
              component={AuthLandingScreen}
            />
            <Stack.Screen
              name={SCREEN_NAMES.AUTH_SIGN_IN}
              component={SignInScreen}
            />
            <Stack.Screen
              name={SCREEN_NAMES.AUTH_SIGN_UP}
              component={SignUpScreen}
            />
          </>
        ) : !isOnboardingComplete ? (
          // Onboarding Stack - User authenticated but onboarding not complete
          <>
            <Stack.Screen
              name={SCREEN_NAMES.ONBOARDING_SPORTS}
              component={OnboardingSportsScreen}
            />
            <Stack.Screen
              name={SCREEN_NAMES.ONBOARDING_GOALS}
              component={OnboardingGoalsScreen}
            />
            <Stack.Screen
              name={SCREEN_NAMES.ONBOARDING_AVAILABILITY}
              component={OnboardingAvailabilityScreen}
            />
            <Stack.Screen
              name={SCREEN_NAMES.ONBOARDING_CHARTER}
              component={OnboardingCharterScreen}
            />
          </>
        ) : (
          // Main App Stack - User authenticated and onboarding complete
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name={SCREEN_NAMES.REFERRAL}
              component={ReferralScreen}
              options={{
                headerShown: true,
                title: 'Parrainage',
              }}
            />
            <Stack.Screen
              name={SCREEN_NAMES.SENTINEL_SETUP}
              component={SentinelSetupScreen}
              options={{
                headerShown: true,
                title: 'Mode Sentinel',
              }}
            />
            <Stack.Screen
              name={SCREEN_NAMES.SESSION_CREATE}
              component={CreateSessionScreen}
              options={{
                headerShown: true,
                title: 'Créer une session',
              }}
            />
            <Stack.Screen
              name={SCREEN_NAMES.SESSION_DETAIL}
              component={SessionDetailScreen}
              options={{
                headerShown: true,
                title: 'Détails de la session',
              }}
            />
            <Stack.Screen
              name={SCREEN_NAMES.SESSION_QR_SCAN}
              component={SessionQRScreen}
              options={{
                headerShown: true,
                title: 'Check-in QR Code',
              }}
            />
            <Stack.Screen
              name={SCREEN_NAMES.SESSION_RATING}
              component={SessionRatingScreen}
              options={{
                headerShown: true,
                title: 'Noter la session',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
