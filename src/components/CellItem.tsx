import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import Usage from './Usage';
// Navigation
type Params = {};
type ScreenProps = {};

export interface CellItemProps {
  setIsPanelActive: (isPanelActive: boolean) => void;
  children: JSX.Element[] | JSX.Element;
}
// Device spec

// Define
const CellItem = (props: CellItemProps) => {
  // JSX
  return <View style={styles.container}>{props.children}</View>;
};

export default CellItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5,
  },
});
