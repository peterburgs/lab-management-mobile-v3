import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import {Text, Icon, Thumbnail, H1, H2} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {SwipeablePanel} from 'rn-swipeable-panel';

// Navigation
import {NavigationStackScreenProps} from 'react-navigation-stack';
type Params = {};
type ScreenProps = {};

// Device spec
const {width, height, scale} = Dimensions.get('screen');

// Redux
import {resetState} from '../redux/reducers/authSlice';
import {useAppDispatch, useAppSelector} from '../redux/store';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {getUserById} from '../redux/reducers/userSlice';
import {unwrapResult} from '@reduxjs/toolkit';

// Component
const AccountScreen = (
  props: NavigationStackScreenProps<Params, ScreenProps>,
) => {
  const dispatch = useAppDispatch();
  // User data
  const avatarUrl = useAppSelector(state => state.auth.avatarUrl);
  const authUser = useAppSelector(state => state.auth.verifiedUser);
  const user = useAppSelector(state =>
    state.user.user ? state.user.user : null,
  );
  const userSchedule = useAppSelector(state =>
    state.schedule.users ? state.schedule.users : null,
  );

  // Events handling

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      await AsyncStorage.removeItem('expirationDate');
      setLoading(false);
      props.navigation.navigate('Login');
      dispatch(resetState());
      Toast.show({
        type: 'success',
        text1: 'Signed out',

        autoHide: true,
        topOffset: 80,
        bottomOffset: height / 4,
        position: 'bottom',
        visibilityTime: 1000,
      });
    } catch (error) {
      props.navigation.navigate('Login');
      setLoading(false);
      console.error(error);
    }
  };

  // Open Panel
  const openPanel = () => {
    setIsPanelActive(true);
  };

  // Close Panel
  const closePanel = () => {
    setIsPanelActive(false);
  };
  // Go to verification
  const goToVerification = () => {
    props.navigation.navigate('Verification');
    closePanel();
  };
  // useState
  const [loading, setLoading] = useState(false);
  const [isPanelActive, setIsPanelActive] = useState(false);
  const [panelProps, setPanelProps] = useState({
    fullWidth: true,
    closeOnTouchOutside: true,
    onlyLarge: true,
    showCloseButton: true,
    height: height,
    onClose: () => closePanel(),
    onPressCloseButton: () => closePanel(),
  });
  // useEffect
  useEffect(() => {
    // setIsPanelActive(false);
    if (authUser)
      (async () => {
        try {
          const userRes = await dispatch(getUserById({id: authUser!._id}));
          unwrapResult(userRes);
        } catch (error) {
          console.log(error.message);
        }
      })();
  }, [authUser]);

  // JSX
  return (
    <SafeAreaView forceInset={{top: 'always'}} style={styles.droidSafeArea}>
      {user === null ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            color={'#1768ac'}
            size={'large'}
            animating={true}
          />
          <Text>&nbsp;Loading data...</Text>
        </View>
      ) : (
        <View style={{flex: 1, width: width, height: height}}>
          {/*// Avatar */}
          {avatarUrl ? (
            <Thumbnail
              large
              source={{uri: avatarUrl!}}
              style={styles.thumbnail}
            />
          ) : (
            <Thumbnail
              large
              source={require('../assets/images/minion.png')}
              style={styles.thumbnail}
            />
          )}
          {/*// Full Name */}
          <Text style={styles.fullName}>
            {user ? user!.fullName : 'John Doe'}
          </Text>
          {/*// Email */}
          <Text style={styles.email}>{user ? user!.email : ''}</Text>

          {/* // Face ID Collapsible */}

          {/*// FaceID status */}
          <View>
            <View
              style={{flexDirection: 'row', padding: 10, alignSelf: 'center'}}>
              <Text style={{fontWeight: 'bold'}}>Face ID:&nbsp;</Text>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: user
                    ? user!.isFaceIdVerified
                      ? 'green'
                      : 'red'
                    : '#fff',
                }}>
                {user
                  ? user!.isFaceIdVerified
                    ? 'Verified'
                    : 'Not Verified'
                  : null}
              </Text>
            </View>
          </View>
          {/*// Verify button  */}
          <Pressable
            android_ripple={{color: 'black', borderless: true, radius: 10}}
            style={{
              backgroundColor: '#0070F3',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
              paddingHorizontal: 15,
              paddingVertical: 10,
              alignSelf: 'center',
            }}
            onPress={async () => {
              setIsPanelActive(true);
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
              {user ? (
                user!.isFaceIdVerified ? (
                  <Icon
                    type={'MaterialIcons'}
                    style={{color: '#fff', marginRight: 10}}
                    name={'add-circle-outline'}
                  />
                ) : (
                  <Icon
                    type={'MaterialCommunityIcons'}
                    style={{color: '#fff', marginRight: 10}}
                    name={'face-recognition'}
                  />
                )
              ) : null}
              <Text style={{color: '#fff'}}>
                {user
                  ? user!.isFaceIdVerified
                    ? 'Add More Faces'
                    : 'Verify Face ID'
                  : null}
              </Text>
            </View>
          </Pressable>
          {user ? (
            user!.isFaceIdVerified ? (
              <Text style={styles.note}>
                Add more faces to increase the accuracy of Face ID
              </Text>
            ) : (
              <Text style={styles.note}>You must verify first</Text>
            )
          ) : null}
          {/* Swipeable Panel */}
          <SwipeablePanel
            isActive={isPanelActive}
            {...panelProps}
            style={styles.panel}>
            <H1
              style={{
                alignSelf: 'center',
                fontWeight: 'bold',
                color: '#72147e',
              }}>
              Before we start
            </H1>
            <Image
              source={require('../assets/images/start.png')}
              style={{
                height: 'auto',
                width: '100%',
                aspectRatio: scale * 0.8,
              }}
              resizeMode={'contain'}
            />
            <View style={styles.section}>
              <H2 style={styles.h2}>1.&nbsp;</H2>
              <Text style={{color: '#150e56'}}>
                We respect your privacy.We only use your photos to train our
                Deep Learning model.
              </Text>
            </View>
            <View style={styles.section}>
              <H2 style={styles.h2}>2.&nbsp;</H2>
              <Text style={{color: '#150e56'}}>
                You must provide at least 7 photo of yours when verify Face ID.
                You can add more photos later on.
              </Text>
            </View>
            <View style={styles.section}>
              <H2 style={styles.h2}>3.&nbsp;</H2>
              <Text style={{color: '#150e56'}}>
                Make sure your photos are qualified: Not blurry; Include nobody
                but you; Not wearing glasses, facial mask, or anything that
                might cover your face.
              </Text>
            </View>

            {/*// Continue button */}
            <Pressable
              android_ripple={{color: 'black', borderless: true, radius: 10}}
              style={styles.continueButton}
              onPress={() => goToVerification()}>
              <View style={[styles.signingOut, {justifyContent: 'center'}]}>
                <Icon
                  type={'FontAwesome5'}
                  name={'arrow-circle-right'}
                  style={{fontSize: 22, color: '#fff', marginRight: 5}}
                />
                <Text style={{color: '#fff'}}>Understood and Continue</Text>
              </View>
            </Pressable>
          </SwipeablePanel>
          {/*// SignOut button */}
          <Pressable
            android_ripple={{color: 'black', borderless: true, radius: 10}}
            style={{
              backgroundColor: '#fb3640',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
              paddingHorizontal: 15,
              paddingVertical: 10,
              marginTop: 50,
              marginBottom: 50,
              alignSelf: 'center',
            }}
            onPress={async () => {
              await signOut();
            }}
            disabled={loading}>
            {loading ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator color="#fff" />
                <Text style={{color: '#fff'}}>&nbsp;Signing Out</Text>
              </View>
            ) : (
              <View style={[styles.signingOut, {justifyContent: 'center'}]}>
                <Icon
                  type={'MaterialIcons'}
                  name={'logout'}
                  fontSize={22}
                  style={{fontSize: 22, color: '#fff', marginRight: 5}}
                />
                <Text style={{color: '#fff'}}>Sign out</Text>
              </View>
            )}
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    alignContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 1,
    alignSelf: 'center',
    minWidth: width * 0.5,
    maxWidth: width * 0.5,
    minHeight: height * 0.05 + 5,
    maxHeight: height * 0.05 + 5,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'red',
  },

  signingOut: {
    flexDirection: 'row',
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
  thumbnail: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#bf1363',
    alignSelf: 'center',
  },
  email: {
    fontSize: 14,
    marginBottom: 20,
    padding: 5,
    alignSelf: 'center',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#0c4271',
    alignSelf: 'center',
  },
  verifyButton: {
    backgroundColor: '#0070F3',
  },
  panel: {
    // position: 'absolute',
    flexDirection: 'column',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  h2: {
    color: '#542e71',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#28b5b5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 50,
    marginBottom: 50,
  },
});
