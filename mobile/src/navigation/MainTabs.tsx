/**
 * MoovUp Now - Main Bottom Tabs Navigator
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SCREEN_NAMES } from '../constants';
import { Colors } from '../theme';
import { MainTabsParamList } from './types';

// Placeholder screens (will be replaced)
import HomeScreen from '../screens/main/HomeScreen';
import FindScreen from '../screens/main/FindScreen';
import GoalsScreen from '../screens/main/GoalsScreen';
import ShopScreen from '../screens/main/ShopScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray[500],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: Colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '700',
          color: Colors.text.primary,
        },
      }}
    >
      <Tab.Screen
        name={SCREEN_NAMES.HOME}
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.FIND}
        component={FindScreen}
        options={{
          title: 'Trouver',
          tabBarIcon: ({ color }) => <TabIcon name="search" color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.GOALS}
        component={GoalsScreen}
        options={{
          title: 'Objectifs',
          tabBarIcon: ({ color }) => <TabIcon name="target" color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.SHOP}
        component={ShopScreen}
        options={{
          title: 'Boutique',
          tabBarIcon: ({ color }) => <TabIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tab.Screen
        name={SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon component (will use actual icon library later)
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    search: '🔍',
    target: '🎯',
    'shopping-bag': '🎒',
    user: '👤',
  };

  return (
    <span style={{ fontSize: 24 }}>
      {icons[name]}
    </span>
  );
}
