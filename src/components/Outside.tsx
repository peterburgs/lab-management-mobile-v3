import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Image, Dimensions, Button} from 'react-native';
import {SwipeablePanel} from 'rn-swipeable-panel';
import {Icon, H1, H2, Spinner} from 'native-base';
import {store, useAppDispatch, useAppSelector} from '../redux/store';
import {NavigationStackScreenProps} from 'react-navigation-stack';
import {showLocation} from 'react-native-map-link';

// Device specs
const {width, height, scale} = Dimensions.get('screen');
export interface OutsideProps {
  lat: number;
  long: number;
  latDelta: number;
  longDelta: number;
  setIsOutside: (isOutside: boolean) => void;
}
// Component
const Outside = (props: OutsideProps) => {
  const dispatch = useAppDispatch();
  const isCheckingIn = useAppSelector(state => state.schedule.isCheckingIn);
  // Event handling
  const location = () =>
    showLocation({
      latitude: props.lat,
      longitude: props.long,
      googleForceLatLon: false,
      alwaysIncludeGoogle: true,
      appsWhiteList: ['google-maps'],
      naverCallerName: 'com.labmanagementmobilev2_1',
    });
  // useState
  const [panelProps, setPanelProps] = useState({
    fullWidth: true,
    allowTouchOutside: false,
    closeOnTouchOutside: true,
    showCloseButton: true,
    onlyLarge: true,
    onClose: () => {
      props.setIsOutside(false);
    },
    onPressCloseButton: () => {
      props.setIsOutside(false);
    },
  });

  return (
    <>
      <SwipeablePanel isActive={true} {...panelProps} style={styles.panel}>
        <H1 style={{alignSelf: 'center', fontWeight: 'bold', color: '#72147e'}}>
          {isCheckingIn ? 'Check In Fail' : 'Check Out Fail'}
        </H1>
        <Image
          source={require('../assets/images/long-distance.png')}
          style={{
            height: 'auto',
            width: '100%',
            aspectRatio: scale * 0.5,
          }}
          resizeMode={'contain'}
        />
        <View style={styles.section}>
          <Text
            style={{
              color: '#BB371A',
              textAlign: 'center',
              alignSelf: 'center',
              marginVertical: 10,
              fontSize: 15,
            }}>
            We detect your position is outside of the UTE campus
          </Text>
        </View>
        <View style={styles.button}>
          <Button title={'Open map'} onPress={location} />
        </View>
      </SwipeablePanel>
    </>
  );
};

export default Outside;

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
  button: {
    borderRadius: 15,
    marginHorizontal: 20,
  },
});
