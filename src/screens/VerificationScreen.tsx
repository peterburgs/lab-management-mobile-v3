import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
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
import VerificationComplete from '../components/VerificationComplete';
import {FACE_ID_SERVER} from '../utils/env';
import axios from 'axios';
import ToastMessage from 'react-native-toast-message';
import {useAppDispatch, useAppSelector} from '../redux/store';
import _ from 'lodash';
import {updateUserById} from '../redux/reducers/userSlice';
import {User} from '../models';
import {unwrapResult} from '@reduxjs/toolkit';
// Props
type Params = {};
type ScreenProps = {};

// Device specs
const {width, height, scale} = Dimensions.get('screen');

// Component
const VerificationScreen = (
  props: NavigationStackScreenProps<Params, ScreenProps>,
) => {
  const user = useAppSelector(state => state.user.user);
  const userStatus = useAppSelector(state => state.user.status);
  const dispatch = useAppDispatch();
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
  // Show success
  const showSuccess = () => {
    ToastMessage.show({
      type: 'success',
      text1: 'Verify successfully',
      autoHide: true,
      topOffset: 80,
      bottomOffset: height / 4,
      position: 'bottom',
      visibilityTime: 1000,
    });
  };

  // Next
  const next = () => {
    setIsCompletePanelActive(true);
    setTimeout(() => {
      setIsCompletePanelActive(false);
      props.navigation.navigate('Account');
    }, 1500);
  };

  // Take photo and save
  const takePicture = async function (camera: RNCamera) {
    try {
      const options = {quality: 1, base64: true};
      const data = await camera.takePictureAsync(options);
      setLoading(true);
      setIsPanelActive(true);
      const token = await auth();
      await RNFetchBlob.config({
        timeout: 30000,
      })
        .fetch(
          'POST',
          `${FACE_ID_SERVER}/face`,
          {
            Authorization: token.Authorization,
            'Content-Type': 'multipart/form-data',
          },
          [
            {name: 'image1', filename: 'image1.png', data: data.base64},
            {name: 'image2', filename: 'image2.png', data: data.base64},
          ],
        )
        .then(res => {
          return res.json();
        })
        .then(async resolvedRes => {
          setIsPanelActive(false);
          setLoading(false);
          if (resolvedRes.status === 201) {
            showSuccess();
            setFaceNum(resolvedRes.faceNum);
            if (resolvedRes.faceNum >= 7) {
              setIsNextVisible(true);
              let _user = _.cloneDeep(user);
              if (_user) {
                _user!.isFaceIdVerified = true;
                try {
                  const updateUserRes = await dispatch(updateUserById(_user!));
                  unwrapResult(updateUserRes);
                  ToastMessage.show({
                    type: 'success',
                    text1: 'Complete',
                    text2: 'You can use the feature Face ID now',
                    autoHide: true,
                    topOffset: 80,
                    bottomOffset: height / 4,
                    position: 'bottom',
                    visibilityTime: 1000,
                  });
                } catch (error) {
                  console.log(error.message);
                }
              }
            } else {
              setIsNextVisible(false);
            }
          } else if (resolvedRes.status === 400) {
            showError(resolvedRes.message);
          } else if (resolvedRes.status === 500) {
            showError(resolvedRes.message);
          } else {
            showError(resolvedRes.message);
          }
        })
        .catch(err => {
          console.log(err.message);
          setIsPanelActive(false);
          setLoading(false);
        });
    } catch (error) {
      console.log(error.message);
      showError(error.message);
      setIsPanelActive(false);
      setLoading(false);
    }
  };

  // useState
  const [isPanelActive, setIsPanelActive] = useState(false);
  const [isCompletePanelActive, setIsCompletePanelActive] = useState(false);
  const [isNextVisible, setIsNextVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [faceNum, setFaceNum] = useState(0);

  // useEffect
  useEffect(() => {
    (async () => {
      try {
        setIsNextVisible(false);
        setDataLoading(true);
        setLoading(false);
        const token = await auth();
        const res = await axios.get(`${FACE_ID_SERVER}/user`, {
          headers: {
            Authorization: token.Authorization,
          },
        });
        if (res.data.faceNum !== undefined) {
          setFaceNum(res.data.faceNum);
          setDataLoading(false);
        }
      } catch (error) {
        console.log(error.message);
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
            onPress={() => props.navigation.navigate('Account')}>
            <Icon
              type="MaterialIcons"
              name="arrow-back-ios"
              style={{color: '#325288'}}
            />
          </Button>
        </Left>
        <Body>
          <Title style={{color: '#325288', fontWeight: 'bold'}}>
            Verify Face ID
          </Title>
          <Subtitle>
            {dataLoading === true ? (
              <View style={{flexDirection: 'row'}}>
                <ActivityIndicator color={'#3c8dad'} size={'small'} />
                <Text>&nbsp;Loading data</Text>
              </View>
            ) : (
              <Text style={{color: '#325288'}}>
                {faceNum <= 7
                  ? `${faceNum}/7 faces verified`
                  : `${faceNum} faces verified`}
              </Text>
            )}
          </Subtitle>
        </Body>
        {isNextVisible ? (
          <Right>
            <Button
              hasText
              onPress={() => {
                next();
              }}
              style={styles.completeButton}>
              <Text style={{color: '#fff', paddingHorizontal: 5}}>
                Continue
              </Text>
            </Button>
          </Right>
        ) : null}
      </Header>
      <Body>
        {/*// Camera */}
        <RNCamera
          pictureSize={'300x300'}
          style={styles.preview}
          type={RNCamera.Constants.Type.front}
          flashMode={RNCamera.Constants.FlashMode.on}
          autoFocus={'on'}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'Allow Lab Management to use your camera',
            buttonPositive: 'Yes',
            buttonNegative: 'No',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'Allow Lab Management to use your mic?',
            buttonPositive: 'Yes',
            buttonNegative: 'No',
          }}>
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
                    disabled={dataLoading}
                    onPress={() => {
                      takePicture(camera);
                    }}
                    style={styles.capture}>
                    <View style={styles.cameraButton}>
                      {dataLoading ? <Spinner color="#1768ac" /> : null}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        </RNCamera>
        {isPanelActive ? <VerificationStatus /> : null}
        {isCompletePanelActive ? <VerificationComplete /> : null}
      </Body>
    </Container>
  );
};

export default VerificationScreen;

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
