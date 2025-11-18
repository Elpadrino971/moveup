/**
 * MoovUp Now - Root Navigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREEN_NAMES } from '../constants';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';

// Auth screens (placeholders for now)
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
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
        ) : (
          // Main App Stack
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
