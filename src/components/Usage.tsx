import React, {useState} from 'react';
import {StyleSheet, Text, View, Pressable, Dimensions} from 'react-native';
import {Icon} from 'native-base';
import {useAppSelector, useAppDispatch} from '../redux/store';
import moment from 'moment';
import {
  setLabUsageToCheckIn,
  setLabUsageToCheckOut,
} from '../redux/reducers/scheduleSlice';

// Device spec
const {width, height, scale, fontScale} = Dimensions.get('screen');

export const BORDER_COLOR = {
  shift1: '#fe3f71',
  shift2: '#4a89a2',
  shift3: '#6537c0',
};
export const BACKGROUND_COLOR = {
  shift1: '#ffe5ec',
  shift2: '#D7F2FF',
  shift3: '#EEEAF7',
};
export interface UsageProps {
  startPeriod?: number;
  endPeriod?: number;
  courseName?: string;
  lecturerName?: string;
  id?: string;
  lecturerId?: string;
  isEmpty: boolean;
  checkInAt?: Date;
  checkOutAt?: Date;
  weekNo?: number;
  dayOfWeek?: number;
  setLabUsageToCheckIn?: (labUsageId: string) => void;
  setLabUsageToCheckOut?: (labUsageId: string) => void;
  setIsPanelActive?: (isPanelActive: boolean) => void;
}
// Screen
const Usage = (props: UsageProps) => {
  const dispatch = useAppDispatch();
  // useState
  const [isPress, setIsPress] = useState(false);

  // useAppSelector
  const user = useAppSelector(state => state.auth.verifiedUser);
  const semester = useAppSelector(state => state.schedule.semester);
  // Event Handling
  const getCurrentWeekNo = () => {
    return moment(new Date(semester!.startDate!)).week;
  };
  const convertPeriodToShift = (startPeriod: number, endPeriod: number) => {
    if (startPeriod >= 1 && endPeriod <= 5) {
      return 1;
    } else if (startPeriod >= 6 && endPeriod <= 12) {
      return 2;
    } else {
      return 3;
    }
  };
  // onLongPress
  const onLongPress = {
    style: isPress
      ? styles.pressedButton
      : [
          styles.normalButton,
          {
            backgroundColor:
              convertPeriodToShift(props.startPeriod!, props.endPeriod!) === 1
                ? BACKGROUND_COLOR.shift1
                : convertPeriodToShift(props.startPeriod!, props.endPeriod!) ===
                  2
                ? BACKGROUND_COLOR.shift2
                : BACKGROUND_COLOR.shift3,
            borderLeftColor:
              convertPeriodToShift(props.startPeriod!, props.endPeriod!) === 1
                ? BORDER_COLOR.shift1
                : convertPeriodToShift(props.startPeriod!, props.endPeriod!) ===
                  2
                ? BORDER_COLOR.shift2
                : BORDER_COLOR.shift3,
          },
        ],
    onPressOut: () => setIsPress(false),
    onPressIn: () => setIsPress(true),
    onLongPress: () => {
      props.setIsPanelActive!(true);
      dispatch(setLabUsageToCheckIn(props.id!));
      dispatch(setLabUsageToCheckOut(props.id!));
    },
  };

  // JSX
  return (
    <View style={styles.container}>
      {props.isEmpty ? (
        <View style={styles.empty}></View>
      ) : user?._id === props.lecturerId ? (
        <Pressable {...onLongPress}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>
            {props.courseName}
          </Text>
          <Text style={{fontWeight: 'bold', color: '#343a40'}}>
            {props.lecturerName}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', color: '#343a40'}}>
              Period:&nbsp;
            </Text>
            <Text>{props.startPeriod}</Text>
            <Icon
              type={'MaterialIcons'}
              name={'arrow-right'}
              style={{fontSize: fontScale * 20, color: 'red'}}
            />
            <Text>&nbsp;{props.endPeriod}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', color: '#343a40'}}>
              Check in:&nbsp;
            </Text>
            <Text>
              {props.checkInAt
                ? moment(new Date(props.checkInAt)).format(
                    'HH:mm:ss DD/MM/YYYY',
                  )
                : 'Pending'}
            </Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', color: '#343a40'}}>
              Check out:&nbsp;
            </Text>
            <Text>
              {props.checkInAt
                ? props.checkOutAt
                  ? moment(new Date(props.checkOutAt)).format(
                      'HH:mm:ss DD/MM/YYYY',
                    )
                  : 'Pending'
                : 'Check In required'}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View
          style={[
            styles.occupied,
            {
              backgroundColor:
                convertPeriodToShift(props.startPeriod!, props.endPeriod!) === 1
                  ? BACKGROUND_COLOR.shift1
                  : convertPeriodToShift(
                      props.startPeriod!,
                      props.endPeriod!,
                    ) === 2
                  ? BACKGROUND_COLOR.shift2
                  : BACKGROUND_COLOR.shift3,
              borderLeftColor:
                convertPeriodToShift(props.startPeriod!, props.endPeriod!) === 1
                  ? BORDER_COLOR.shift1
                  : convertPeriodToShift(
                      props.startPeriod!,
                      props.endPeriod!,
                    ) === 2
                  ? BORDER_COLOR.shift2
                  : BORDER_COLOR.shift3,
            },
          ]}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>Occupied</Text>
        </View>
      )}
    </View>
  );
};

export default Usage;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 3,
    height: height * 0.12,
  },
  normalButton: {
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 10,
    transform: [{scale: 1}],
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  pressedButton: {
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 10,
    backgroundColor: '#51c4d3',
    borderLeftColor: '#132c33',
    transform: [{scale: 0.9}],
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  empty: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  occupied: {
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderRadius: 10,
    paddingVertical: 5,
    transform: [{scale: 1}],
    paddingHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
