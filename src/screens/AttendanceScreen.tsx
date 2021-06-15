import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Title,
  Icon,
  Button,
  Subtitle,
  Spinner,
} from 'native-base';
import {NavigationStackScreenProps} from 'react-navigation-stack';
import {RNCamera} from 'react-native-camera';
import RNFetchBlob from 'rn-fetch-blob';
import {auth} from '../api';
import VerificationStatus from '../components/VerificationStatus';
import AttendanceComplete from '../components/AttendanceComplete';
import {FACE_ID_SERVER, LAT1, LONG1, LAT2, LONG2, R1, R2} from '../utils/env';
import axios from 'axios';
import ToastMessage from 'react-native-toast-message';
import {useAppDispatch, useAppSelector} from '../redux/store';
import _ from 'lodash';
import {User} from '../models';
import {unwrapResult} from '@reduxjs/toolkit';
import {updateLabUsageById} from '../redux/reducers/scheduleSlice';
import {getDistance} from 'geolib';
import Geolocation from 'react-native-geolocation-service';
import {SwipeablePanel} from 'rn-swipeable-panel';
import Outside from '../components/Outside';
// Props
type Params = {};
type ScreenProps = {};

// Device specs
const {width, height, scale} = Dimensions.get('screen');

// Screen
const AttendanceScreen = (
  props: NavigationStackScreenProps<Params, ScreenProps>,
) => {
  const isCheckingIn = useAppSelector(state => state.schedule.isCheckingIn);
  const user = useAppSelector(state => state.user.user);
  const labUsages = useAppSelector(state => state.schedule.labUsages);
  const labUsageToCheckIn = useAppSelector(
    state => state.schedule.labUsageToCheckIn,
  );
  const labUsageToCheckOut = useAppSelector(
    state => state.schedule.labUsageToCheckOut,
  );
  const userStatus = useAppSelector(state => state.user.status);
  const dispatch = useAppDispatch();

  // useState
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAttendanceCompleteActive, setIsAttendanceCompleteActive] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [isOutside, setIsOutside] = useState(false);
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);
  const [latDelta, setLatDelta] = useState(0);
  const [longDelta, setLongDelta] = useState(0);

  // Event handling

  // Show error
  const showError = (error: string) => {
    ToastMessage.show({
      type: 'error',
      text1: error,
      autoHide: true,
      topOffset: 80,
      bottomOffset: height / 4,
      position: 'bottom',
      visibilityTime: 1000,
    });
  };
  const showErrorSlow = (error: string) => {
    ToastMessage.show({
      type: 'error',
      text1: error,
      autoHide: true,
      topOffset: 80,
      bottomOffset: height / 4,
      position: 'bottom',
      visibilityTime: 2000,
    });
  };
  // Take picture and save
  const takePicture = async function (camera: RNCamera) {
    try {
      const options = {quality: 1, base64: true};
      const data = await camera.takePictureAsync(options);
      const token = await auth();
      setLoading(true);
      setIsProcessing(true);
      Geolocation.getCurrentPosition(
        async position => {
          const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
          const latDelta =
            position.coords.accuracy / oneDegreeOfLatitudeInMeters;
          const longDelta =
            position.coords.accuracy /
            (oneDegreeOfLatitudeInMeters * Math.cos(lat * (Math.PI / 180)));
          setLatDelta(latDelta);
          setLongDelta(longDelta);
          setLat(position.coords.latitude);
          setLong(position.coords.longitude);

          // Get distance from user's current position to P1
          const d1 = getDistance(position.coords, {
            latitude: LAT1,
            longitude: LONG1,
          });
          // Get distance from user's current position to P2
          const d2 = getDistance(position.coords, {
            latitude: LAT2,
            longitude: LONG2,
          });
          // Origin condition
          // if (d1 <= R1 || d2 <= R2) {
          // TODO: restore to origin after test
          // Supposing considion
          if (d1 > R1 || d2 > R2) {
            // Config Fetch Blob
            await RNFetchBlob.config({
              timeout: 30000,
            })
              .fetch(
                'POST',
                `${FACE_ID_SERVER}/verify`,
                {
                  Authorization: token.Authorization,
                  'Content-Type': 'multipart/form-data',
                },
                [{name: 'image', filename: 'image.png', data: data.base64}],
              )
              .then(res => {
                return res.json();
              })
              .then(async resolvedRes => {
                // Check In/Out successfully
                if (resolvedRes.status === 200) {
                  // If Check In successfully
                  if (isCheckingIn) {
                    let labUsage = _.cloneDeep(
                      labUsages.filter(
                        item => item._id === labUsageToCheckIn,
                      )[0],
                    );
                    labUsage.checkInAt = new Date();
                    try {
                      const res = await dispatch(updateLabUsageById(labUsage));
                      unwrapResult(res);
                      setIsProcessing(false);
                      setLoading(false);
                      setIsAttendanceCompleteActive(true);
                      setTimeout(() => {
                        props.navigation.navigate('Schedule');
                      }, 1500);
                    } catch (error) {
                      console.log(error.message);
                      setIsProcessing(false);
                      setLoading(false);
                    }
                  }
                  // If Check Out successfully
                  else {
                    let labUsage = _.cloneDeep(
                      labUsages.filter(
                        item => item._id === labUsageToCheckOut,
                      )[0],
                    );
                    labUsage.checkOutAt = new Date();
                    try {
                      const res = await dispatch(updateLabUsageById(labUsage));
                      unwrapResult(res);
                      setIsAttendanceCompleteActive(true);
                      setLoading(false);
                      setIsProcessing(false);
                      setTimeout(() => {
                        props.navigation.navigate('Schedule');
                      }, 1500);
                    } catch (error) {
                      console.log(error.message);
                    }
                  }
                } else if (resolvedRes.status === 400) {
                  setIsProcessing(false);
                  setLoading(false);
                  showError('Cannot detect your face');
                } else if (resolvedRes.status === 500) {
                  setIsProcessing(false);
                  setLoading(false);
                  showError(resolvedRes.message);
                } else if (resolvedRes.status === 401) {
                  setIsProcessing(false);
                  setLoading(false);
                  showError('Wrong Face ID');
                } else {
                  setIsProcessing(false);
                  setLoading(false);
                  showError('Server error. Please try again');
                }
              })
              .catch(err => {
                console.log(err.message);
                showError('Server error. Please try again');
                setIsProcessing(false);
                setLoading(false);
              });
          } else {
            setIsOutside(true);
            setLoading(false);
            setIsProcessing(false);
          }
        },
        error => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (error) {
      console.log(error.message);
      showError(error.message);
      setIsProcessing(false);
      setLoading(false);
    }
  };
  // useEffect
  useEffect(() => {
    (async () => {
      const check = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (!check) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Lab Management needs access to your location',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          props.navigation.navigate('Schedule');
        }
      }
    })();
  }, []);

  // JSX
  return (
    <Container>
      <Header style={styles.header}>
        <Left>
          <Button
            transparent
            onPress={() => props.navigation.navigate('Schedule')}>
            <Icon
              type="MaterialIcons"
              name="arrow-back-ios"
              style={{color: '#325288'}}
            />
          </Button>
        </Left>
        <Body>
          <Title style={{color: '#325288', fontWeight: 'bold'}}>
            {isCheckingIn ? 'Check In' : 'Check Out'}
          </Title>
        </Body>
      </Header>
      <Body>
        {/*// Camera */}
        <RNCamera
          pictureSize={'300x300'}
          style={styles.preview}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.on}
          androidCameraPermissionOptions={{
            title: 'Camera Permission',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Audio Permission',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          autoFocus={'on'}>
          {({camera}) => {
            return (
              <View>
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: width,
                  }}>
                  <TouchableOpacity
                    disabled={loading}
                    onPress={() => {
                      takePicture(camera);
                    }}
                    style={styles.capture}>
                    <View style={styles.cameraButton}>
                      {loading ? <Spinner color="#1768ac" /> : null}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        </RNCamera>
        {isProcessing ? <VerificationStatus /> : null}
        {isAttendanceCompleteActive ? <AttendanceComplete /> : null}
        {isOutside ? (
          <Outside
            lat={lat}
            long={long}
            latDelta={latDelta}
            longDelta={longDelta}
            setIsOutside={setIsOutside}
          />
        ) : null}
      </Body>
    </Container>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  header: {backgroundColor: '#fff'},
  signingOut: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    position: 'absolute',
    flexDirection: 'column',
    paddingHorizontal: 10,
    height: height,
  },
  h2: {
    color: '#542e71',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#ce1212',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 30,
    marginBottom: 50,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    width: width * 0.185,
    height: width * 0.185,
    borderRadius: width,
    borderColor: '#dddddd',
    borderWidth: 3,
    alignSelf: 'center',
    justifyContent: 'center',
    opacity: 1,
    marginBottom: 10,
  },
  cameraButton: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: width,
    alignSelf: 'center',
    opacity: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
  },
  imageContainer: {
    width: 70,
    height: 100,
    borderWidth: 1,
    borderColor: '#eee',
    marginLeft: 10,
    bottom: 10,
    position: 'absolute',
  },
  completeButton: {
    backgroundColor: '#f48b29',
    borderRadius: 10,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
