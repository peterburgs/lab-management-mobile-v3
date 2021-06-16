import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {createStackNavigator} from '@react-navigation/stack';
import 'react-native-gesture-handler';
import {LogBox} from 'react-native';
LogBox.ignoreAllLogs(true);
// Device specs

// Redux
import {useAppSelector, useAppDispatch} from '../../src/redux/store';

// Import Screens
import LoginScreen from '../../src/screens/LoginScreen';
import AuthCheck from '../../src/screens/AuthCheck';
import LoadingSchedule from '../../src/components/LoadingSchedule';

// Navigators
import MainNav from '../../src/navigators/MainNav';
import {setLoadingSchedule} from '../redux/reducers/scheduleSlice';
const Stack = createStackNavigator();

// Define App
const MainWrapperScreen = () => {
  const dispatch = useAppDispatch();

  const loadingSchedule = useAppSelector(
    state => state.schedule.loadingSchedule,
  );
  // useEffect
  useEffect(() => {
    if (loadingSchedule) {
      setTimeout(() => {
        dispatch(setLoadingSchedule(false));
      }, 0);
    }
  }, [loadingSchedule]);

  // JSX
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="AuthCheck"
          headerMode="float"
          mode="modal">
          <Stack.Screen
            name="AuthCheck"
            component={AuthCheck}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Main"
            component={loadingSchedule ? LoadingSchedule : MainNav}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({});

export default MainWrapperScreen;
