import React, {useEffect} from 'react';
import {StyleSheet, Text, View, Platform, Dimensions} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

// Create Tabs
const Tab = createBottomTabNavigator();

// Import Navigators
import ScheduleNavigator from './ScheduleNav';
import AccountNavigator from './AccountNav';

// Device specs
const {height, width} = Dimensions.get('screen');
// Redux
import {store, useAppSelector, useAppDispatch} from '../../src/redux/store';
import {Provider} from 'react-redux';
import {resetState} from '../../src/redux/reducers/authSlice';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MainScreenNavigationProp, MainScreenRouteProp} from '../types';

// Props
type Props = {
  route: MainScreenRouteProp;
  navigation: MainScreenNavigationProp;
};
// JSX
const Main = (props: Props) => {
  const dispatch = useAppDispatch();
  const isSessionTimeOut = useAppSelector(state => state.auth.isSessionTimeOut);
  const isAuthenticated = useAppSelector(
    state => state.auth.verifiedToken !== null,
  );
  // useEffect
  useEffect(() => {
    if (isSessionTimeOut && isAuthenticated) {
      (async () => {
        try {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
          dispatch(resetState());
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('role');
          await AsyncStorage.removeItem('expirationDate');
          props.navigation.navigate('Login');
          Toast.show({
            type: 'error',
            text1: 'Session Time out',
            text2: 'Please sign in again',
            autoHide: true,
            topOffset: 80,
            bottomOffset: height / 4,
            position: 'bottom',
            visibilityTime: 1000,
          });
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [isSessionTimeOut, isAuthenticated]);

  return (
    <Tab.Navigator
      initialRouteName="Schedule"
      tabBarOptions={{
        keyboardHidesTabBar: true,
        showLabel: true,
        activeTintColor: '#2978b5',
        inactiveTintColor: '#bbbbbb',
        style: {
          backgroundColor: '#f6f5f5',
          paddingVertical: 5,
          height: height * 0.055,
          maxHeight: height * 0.07,
        },
      }}>
      <Tab.Screen
        name="Schedule"
        component={ScheduleNavigator}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Main;

const styles = StyleSheet.create({});
