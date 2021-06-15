import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';

const {width, height, scale} = Dimensions.get('screen');
const LoadingSchedule = () => {
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

export default LoadingSchedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'absolute',
    width: width,
    height: height,
  },
  text: {
    color: '#000',
    fontSize: 14,
  },
  image: {
    height: height / 4,
  },
});
