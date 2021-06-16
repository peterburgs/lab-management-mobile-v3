import React from 'react';
import {StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import {LogBox} from 'react-native';
LogBox.ignoreAllLogs(true);
// Device specs

// Redux
import {store} from './src/redux/store';
import {Provider} from 'react-redux';

// Import Screens
import MainWrapperScreen from './src/screens/MainWrapperScreen';

// Define App
const App = () => {
  // JSX
  return (
    <Provider store={store}>
      <Toast ref={ref => Toast.setRef(ref)} />
      <MainWrapperScreen />
    </Provider>
  );
};

const styles = StyleSheet.create({});

export default App;
