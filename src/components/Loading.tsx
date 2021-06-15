import React, {useEffect} from 'react';
import {StyleSheet, Text, View, Image, Dimensions} from 'react-native';

const {width, height, scale} = Dimensions.get('screen');

const Loading = () => {
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

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    width: width,
    height: height,
  },
  image: {
    height: height / 4,
  },
});
