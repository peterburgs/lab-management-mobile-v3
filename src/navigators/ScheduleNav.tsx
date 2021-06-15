import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
const Stack = createStackNavigator();
import ScheduleScreen from '../screens/ScheduleScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
// Component
const ScheduleNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default ScheduleNavigator;

const styles = StyleSheet.create({});
