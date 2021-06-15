import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

// Import components
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();
const LoginNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default LoginNavigator;

const styles = StyleSheet.create({});
