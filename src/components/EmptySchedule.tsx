import React from 'react';
import {StyleSheet, Text, View, Image, Dimensions} from 'react-native';
const {width, height, scale} = Dimensions.get('screen');
const EmptySchedule = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/nothing.gif')}
        resizeMode={'contain'}
        style={{
          height: 'auto',
          width: '100%',
          aspectRatio: scale * 0.5,
        }}
      />
      <Text style={styles.text}>Sorry, the schedule is not available now</Text>
    </View>
  );
};

export default EmptySchedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 6 * scale,
    color: '#47597e',
  },
});
