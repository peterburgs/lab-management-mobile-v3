import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {
  CompositeNavigationProp,
  NavigatorScreenParams,
  RouteProp,
} from '@react-navigation/core';
import {StackNavigationProp} from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type TabParamList = {
  Schedule: NavigatorScreenParams<RootStackParamList>;
  Account: NavigatorScreenParams<RootStackParamList>;
};
// Login
export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

// Main
export type MainScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;
export type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

// Schedule
export type ScheduleScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Schedule'>,
  StackNavigationProp<RootStackParamList>
>;
export type ScheduleScreenRouteProp = RouteProp<TabParamList, 'Schedule'>;

// Account
export type AccountScreenStackParamList = {
  Account: undefined;
  Verification: undefined;
};
export type AccountScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Account'>,
  StackNavigationProp<AccountScreenStackParamList>
>;
export type AccountScreenRouteProp = RouteProp<TabParamList, 'Account'>;
