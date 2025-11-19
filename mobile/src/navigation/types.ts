/**
 * MoovUp Now - Navigation Types
 */

import { SCREEN_NAMES } from '../constants';

// Root Stack
export type RootStackParamList = {
  [SCREEN_NAMES.AUTH_LANDING]: undefined;
  [SCREEN_NAMES.AUTH_SIGN_IN]: undefined;
  [SCREEN_NAMES.AUTH_SIGN_UP]: undefined;
  [SCREEN_NAMES.AUTH_ONBOARDING]: undefined;
  MainTabs: undefined;
  [SCREEN_NAMES.SESSION_CREATE]: undefined;
  [SCREEN_NAMES.SESSION_DETAIL]: { sessionId: string };
  [SCREEN_NAMES.SESSION_QR_SCAN]: { sessionId: string };
  [SCREEN_NAMES.SESSION_RATING]: { sessionId: string };
  [SCREEN_NAMES.USER_PROFILE]: { userId: string };
  [SCREEN_NAMES.WORKOUT_DETAIL]: { workoutId: string };
  [SCREEN_NAMES.EXERCISE_PLAYER]: { workoutId: string };
  [SCREEN_NAMES.PRODUCT_DETAIL]: { productId: string };
  [SCREEN_NAMES.CART]: undefined;
  [SCREEN_NAMES.CHECKOUT]: undefined;
  [SCREEN_NAMES.SETTINGS]: undefined;
  [SCREEN_NAMES.EDIT_PROFILE]: undefined;
  [SCREEN_NAMES.NOTIFICATIONS]: undefined;
  [SCREEN_NAMES.REFERRAL]: undefined;
  [SCREEN_NAMES.SENTINEL_SETUP]: undefined;
};

// Bottom Tabs
export type MainTabsParamList = {
  [SCREEN_NAMES.HOME]: undefined;
  [SCREEN_NAMES.FIND]: undefined;
  [SCREEN_NAMES.COACH]: undefined;
  [SCREEN_NAMES.SHOP]: undefined;
  [SCREEN_NAMES.PROFILE]: undefined;
};
