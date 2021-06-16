import React, {useState, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  LogBox,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import Video from 'react-native-video';
import Toast from 'react-native-toast-message';
import {ROLES} from '../models';
import {useFocusEffect} from '@react-navigation/native';

// Google SignIn services
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {CLIENT_ID} from '../utils/env';
// await GoogleSignin.hasPlayServices();
GoogleSignin.configure({
  webClientId: CLIENT_ID,
  offlineAccess: false,
  // hostedDomain: 'student.hcmute.edu.vn',
});
// Ignore timer warnings
LogBox.ignoreLogs(['Setting a timer']);
// Redux
import {useAppDispatch} from '../redux/store';

// Import components
import {LoginScreenNavigationProp, LoginScreenRouteProp} from '../types';
import {verify} from '../redux/reducers/authSlice';
import {unwrapResult} from '@reduxjs/toolkit';
const {width, height} = Dimensions.get('screen');

// Custom type
type Props = {
  route: LoginScreenRouteProp;
  navigation: LoginScreenNavigationProp;
};
// Component
const LoginScreen = (props: Props) => {
  const dispatch = useAppDispatch();

  // useState
  const [loading, setLoading] = useState(false);
  const exitApp = useRef(0);

  // Event Handling

  // Back action
  const backAction = () => {
    setTimeout(() => {
      exitApp.current = 0;
    }, 2000);
    if (exitApp.current === 0) {
      exitApp.current = 1;
      Toast.show({
        type: 'error',
        text1: 'Press back one more time to exit app',
        autoHide: true,
        topOffset: 80,
        bottomOffset: height / 4,
        position: 'bottom',
        visibilityTime: 1000,
      });
    } else if (exitApp.current === 1) {
      BackHandler.exitApp();
    }
    console.log(exitApp);
    return true;
  };
  const signIn = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const {idToken} = userInfo;
      const expirationDate = new Date(new Date().getTime() + 3599 * 1000);
      const result = await dispatch(
        verify({
          token: idToken!,
          role: ROLES.LECTURER,
          expirationDate: expirationDate.getTime(),
        }),
      );
      unwrapResult(result);
      setLoading(false);
      props.navigation.navigate('Main');
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Toast.show({
          type: 'error',
          text1: 'Sign in canceled ❌',
          autoHide: true,
          topOffset: 80,
          bottomOffset: height / 4,
          position: 'bottom',
          visibilityTime: 1000,
        });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Toast.show({
          type: 'info',
          text1: 'Authentication is in progress',

          autoHide: true,
          topOffset: 80,
          bottomOffset: height / 4,
          position: 'bottom',
          visibilityTime: 1000,
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          type: 'error',
          text1: 'Play Service is not available ❌',

          autoHide: true,
          topOffset: 80,
          bottomOffset: height / 4,
          position: 'bottom',
          visibilityTime: 1000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: `${error.message} ❌`,
          autoHide: true,
          topOffset: 80,
          bottomOffset: height / 4,
          position: 'bottom',
          visibilityTime: 1000,
        });
      }
    }
  };

  // useEffect

  // Back handler
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => {
        backHandler.remove();
      };
    }, []),
  );

  // JSX
  return (
    <View style={styles.container}>
      {/*// Video */}
      <View>
        <Animated.View>
          <Video
            source={require('../assets/videos/Computer-Lab.mp4')}
            style={styles.videos}
            repeat={true}
            rate={1}
            muted={true}
            fullscreen={true}
            resizeMode={'cover'}
          />
        </Animated.View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Lab Management</Text>
        </View>
        {/* // Button SignIn */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            signIn();
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
              <ActivityIndicator color="#000" />
              <Text style={{color: '#000'}}>&nbsp;Signing In</Text>
            </View>
          ) : (
            <>
              <Image
                style={styles.image}
                source={require('../assets/images/google-logo.png')}
              />
              <Text style={styles.text}>Log in with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    width: width,
    height: height,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderRadius: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  videos: {
    width: width,
    minHeight: height,
    height: height,
    zIndex: 0,
    position: 'absolute',
  },
  contentContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
  },
  image: {
    width: width / 17,
    height: width / 17,
    marginRight: 10,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    zIndex: 2,
    marginBottom: 30,
  },
});
