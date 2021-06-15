import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Image, Dimensions} from 'react-native';
import {SwipeablePanel} from 'rn-swipeable-panel';
import {Icon, H1, H2, Spinner} from 'native-base';
import {store, useAppDispatch, useAppSelector} from '../redux/store';
import {NavigationStackScreenProps} from 'react-navigation-stack';
// Device specs
const {width, height, scale} = Dimensions.get('screen');

// Component
const AttendanceComplete = () => {
  const dispatch = useAppDispatch();
  const isCheckingIn = useAppSelector(state => state.schedule.isCheckingIn);
  // Event handling

  // useState
  const [panelProps, setPanelProps] = useState({
    fullWidth: true,
    closeOnTouchOutside: false,
    onlyLarge: true,
    onClose: () => {},
    onPressCloseButton: () => {},
  });

  return (
    <>
      <SwipeablePanel isActive={true} {...panelProps} style={styles.panel}>
        <H1 style={{alignSelf: 'center', fontWeight: 'bold', color: '#72147e'}}>
          {isCheckingIn ? 'Check In successfully' : 'Check Out successfully'}
        </H1>
        <Image
          source={require('../assets/images/tick.gif')}
          style={{
            height: 'auto',
            width: '100%',
            aspectRatio: scale * 0.9,
          }}
          resizeMode={'contain'}
        />
        <View style={styles.section}>
          <Spinner color="#0a81ab" />
          <Text
            style={{
              color: '#150e56',
              textAlign: 'center',
              alignSelf: 'center',
              marginLeft: 10,
            }}>
            Navigating back to schedule
          </Text>
        </View>
      </SwipeablePanel>
    </>
  );
};

export default AttendanceComplete;

const styles = StyleSheet.create({
  h2: {
    color: '#542e71',
    fontWeight: 'bold',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignSelf: 'center',
    alignContent: 'space-between',
  },
  panel: {
    position: 'absolute',
    flexDirection: 'column',
  },
});
