import React, {useEffect} from 'react';
import {StyleSheet, Text, View, Image, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ROLES} from '../models';
import {LoginScreenNavigationProp, LoginScreenRouteProp} from '../types';
import {useAppDispatch} from '../redux/store';
import {verify} from '../redux/reducers/authSlice';
import {current, unwrapResult} from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import {Spinner} from 'native-base';

const {width, height, scale} = Dimensions.get('screen');

// Custom type
type Props = {
  route: LoginScreenRouteProp;
  navigation: LoginScreenNavigationProp;
};
const AuthCheck = (props: Props) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const role =
        (await AsyncStorage.getItem('role')) === '0'
          ? ROLES.ADMIN
          : ROLES.LECTURER;
      const expirationDate = await AsyncStorage.getItem('expirationDate');
      if (!token) {
        props.navigation.navigate('Login');
      } else {
        try {
          const res = await dispatch(
            verify({token, role, expirationDate: Number(expirationDate)}),
          );
          unwrapResult(res);
          props.navigation.navigate('Main');
        } catch (error) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('role');
          await AsyncStorage.removeItem('expirationDate');
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Something went wrong. Please sign in again. ⛔️',
            autoHide: true,
            topOffset: 30,
            bottomOffset: 40,
            position: 'top',
          });
          props.navigation.navigate('Login');
        }
      }
    })();
  }, []);
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/loading.gif')}
        style={styles.image}
        resizeMode={'contain'}
      />
    </View>
  );
};

export default AuthCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },
  image: {
    height: height / 4,
  },
});
