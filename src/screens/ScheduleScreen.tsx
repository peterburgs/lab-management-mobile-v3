import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
  ScrollView,
  Image,
  Pressable,
  PermissionsAndroid,
  Alert,
  BackHandler,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {SafeAreaView} from 'react-navigation';
import {Text, Icon, H1, H2} from 'native-base';
import {Table, Row, Cell, TableWrapper} from 'react-native-table-component';
import {SwipeablePanel} from 'rn-swipeable-panel';
import moment from 'moment';
import ToastMessage from 'react-native-toast-message';
import {useFocusEffect} from '@react-navigation/native';
import {NavigationStackScreenProps} from 'react-navigation-stack';

// Import components
import CellItem from '../../src/components/CellItem';
import EmptySchedule from '../components/EmptySchedule';
import Loading from '../components/Loading';
// Redux
import {useAppDispatch, useAppSelector} from '../redux/store';
import {
  getCourses,
  getLabs,
  getLabUsageBySemesterId,
  getOpeningAcademicYear,
  getOpeningSemester,
  getTeachings,
  getUsers,
  setIsCheckingIn,
  setLoadingSchedule,
  setSelectedWeek,
} from '../redux/reducers/scheduleSlice';
import {unwrapResult} from '@reduxjs/toolkit';
import {LabUsage} from '../models';
import Usage from '../components/Usage';
const {width, height, fontScale, scale} = Dimensions.get('screen');
type Params = {};
type ScreenProps = {};

// Attributes for table
const borderColor = '#838383';
const ROW_HEIGHT = height * 0.03;
const USAGE_HEIGHT = height * 0.15;
const HEADER_HEIGHT = height * 0.04;

// Import Model

// Screen
const ScheduleScreen = (
  props: NavigationStackScreenProps<Params, ScreenProps>,
) => {
  // useState
  const [filteredLabUsages, setFilteredLabUsages] = useState<LabUsage[]>([]);
  const [tableHead, setTableHead] = useState<string[]>([]);
  const [widthArr, setWidthArr] = useState<number[]>([]);
  const [tableData, setTableData] = useState<LabUsage[][][]>([]);
  const [tableTitle, setTableTitle] = useState<string[][]>([]);
  const [isPanelActive, setIsPanelActive] = useState(false);
  const exitApp = useRef(0);
  const [panelProps, setPanelProps] = useState({
    fullWidth: true,
    closeOnTouchOutside: true,
    showCloseButton: true,
    onClose: () => closePanel(),
    onPressCloseButton: () => closePanel(),
  });
  const dispatch = useAppDispatch();
  const selectedWeek = useAppSelector(state => state.schedule.selectedWeek);
  const academicYear = useAppSelector(state => state.schedule.academicYear);
  const semester = useAppSelector(state => state.schedule.semester);
  const labUsages = useAppSelector(state => state.schedule.labUsages);
  const users = useAppSelector(state => state.schedule.users);
  const teachings = useAppSelector(state => state.schedule.teachings);
  const labs = useAppSelector(state => state.schedule.labs);
  const courses = useAppSelector(state => state.schedule.courses);
  const user = useAppSelector(state => state.user.user);
  const labUsageToCheckIn = useAppSelector(
    state => state.schedule.labUsageToCheckIn,
  );
  const labUsageToCheckOut = useAppSelector(
    state => state.schedule.labUsageToCheckOut,
  );
  // Status
  const academicYearStatus = useAppSelector(
    state => state.schedule.academicYearStatus,
  );
  const semesterStatus = useAppSelector(state => state.schedule.semesterStatus);
  const labUsagesStatus = useAppSelector(
    state => state.schedule.labUsagesStatus,
  );
  const usersStatus = useAppSelector(state => state.schedule.usersStatus);
  const teachingsStatus = useAppSelector(
    state => state.schedule.teachingsStatus,
  );
  const labsStatus = useAppSelector(state => state.schedule.labsStatus);
  const coursesStatus = useAppSelector(state => state.schedule.coursesStatus);

  // Table Magic Ref
  const leftRef = useRef<ScrollView>(null);
  const rightRef = useRef<ScrollView>(null);
  // DO not delete
  const _tableHead = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const _widthArr = [250, 250, 250, 250, 250, 250, 250];
  // Width of title
  const leftColumnWidth = 100;

  // Event handling

  // Back action
  const backAction = () => {
    setTimeout(() => {
      exitApp.current = 0;
    }, 2000);
    if (exitApp.current === 0) {
      exitApp.current = 1;
      ToastMessage.show({
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
    return true;
  };
  const handleWeekChange = (week: number) => {
    dispatch(setSelectedWeek(week));
    dispatch(setLoadingSchedule(true));
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
  const getMaxShiftNum = (week: LabUsage[][]) => {
    let max = 0;
    for (let i = 0; i < week.length; i++) {
      if (week[i].length > max) max = week[i].length;
    }
    return max;
  };
  // Open Panel
  const openPanel = () => {
    setIsPanelActive(true);
  };

  // Close Panel
  const closePanel = () => {
    setIsPanelActive(false);
  };

  // Check in handler
  const checkInHandler = async () => {
    const check = await requestLocationPermission();
    if (check) {
      dispatch(setIsCheckingIn(true));
      setIsPanelActive(false);
      props.navigation.navigate('Attendance');
    } else {
      Alert.alert('Please allow Lab Management to access your location');
      setIsPanelActive(false);
    }
  };
  // Check out handler
  const checkOutHandler = async () => {
    const check = await requestLocationPermission();
    if (check) {
      dispatch(setIsCheckingIn(false));
      setIsPanelActive(false);
      props.navigation.navigate('Attendance');
    } else {
      Alert.alert('Please allow Lab Management to access your location');
      setIsPanelActive(false);
    }
  };

  // Get lecturer name by lab usage
  const getLecturerNameByLabUsage = (labUsage: LabUsage) => {
    const teaching = teachings.filter(item => {
      return item._id === labUsage.teaching;
    })[0];
    if (teaching) {
      const user = users.filter(u => {
        return u._id === teaching.user;
      })[0];
      if (user) {
        return user.fullName;
      }
    }
    return 'Lecturer';
  };

  // Get lecturer id by lab usage
  const getLecturerIdByLabUsage = (labUsage: LabUsage) => {
    const teaching = teachings.filter(item => {
      return item._id === labUsage.teaching;
    })[0];
    if (teaching) {
      const user = users.filter(u => {
        return u._id === teaching.user;
      })[0];
      if (user) {
        return user._id;
      }
    }
    return 'ID';
  };

  const requestLocationPermission = async () => {
    const check = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (!check) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Please allow Lab Management to access your location',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
      console.log(granted);
    }
    return true;
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

  useEffect(() => {
    const _tableTitle: string[][] = [];
    for (let i = 0; i < labs.length; i += 1) {
      const rowData: string[] = [];
      rowData.push(labs[i].labName);
      _tableTitle.push(rowData);
    }
    // Width of title
    const _tableData: LabUsage[][][] = [];
    for (let i = 0; i < labs.length; i += 1) {
      const rowData: LabUsage[][] = [];
      for (let j = 0; j < 7; j += 1) {
        const labUsageByLab = filteredLabUsages.filter(
          item => item.lab === labs[i]._id,
        );
        const labUsageByDayOfWeek = labUsageByLab.filter(
          item => item.dayOfWeek === j,
        );
        if (labUsageByDayOfWeek.length > 0) {
          labUsageByDayOfWeek.sort(
            (a, b) =>
              convertPeriodToShift(a.startPeriod, a.endPeriod) -
              convertPeriodToShift(b.startPeriod, b.endPeriod),
          );
          rowData.push(labUsageByDayOfWeek);
        } else {
          rowData.push([]);
        }
      }
      _tableData.push(rowData);
    }
    setTableHead(_tableHead);
    setWidthArr(_widthArr);
    setTableData(_tableData);
    setTableTitle(_tableTitle);
  }, [filteredLabUsages, labs]);
  // Get opening year
  useEffect(() => {
    if (academicYearStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(getOpeningAcademicYear({}));
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [academicYearStatus]);
  // Get semester
  useEffect(() => {
    if (academicYear && semesterStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(getOpeningSemester({}));
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [academicYear, semesterStatus]);
  // Get labUsages
  useEffect(() => {
    if (semester && labUsagesStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(
            getLabUsageBySemesterId({semester: semester._id!}),
          );
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [semester, labUsagesStatus]);
  // Get teachings
  useEffect(() => {
    if (semester && teachingsStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(getTeachings({}));
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [semester, teachingsStatus]);
  // Get labs
  useEffect(() => {
    if (labsStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(getLabs({}));
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [labsStatus]);
  // Get courses
  useEffect(() => {
    if (coursesStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(getCourses({}));
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [coursesStatus]);
  // Get users
  useEffect(() => {
    if (usersStatus === 'idle') {
      (async () => {
        try {
          const res = await dispatch(getUsers({}));
          unwrapResult(res);
        } catch (error) {
          console.log(error.message);
        }
      })();
    }
  }, [usersStatus]);

  // Filter labusage
  useEffect(() => {
    if (semester) {
      if (labUsages.length > 0) {
        setFilteredLabUsages(
          labUsages.filter(
            labUsage =>
              labUsage.semester === semester._id &&
              labUsage.weekNo === selectedWeek,
          ),
        );
      }
    }
  }, [selectedWeek, labUsages, semester]);

  // Conditional Rendering
  const conditionalRenderer = () => {
    if (
      academicYearStatus === 'pending' ||
      semesterStatus === 'pending' ||
      labUsagesStatus === 'pending' ||
      labsStatus === 'pending' ||
      coursesStatus === 'pending' ||
      usersStatus === 'pending' ||
      teachingsStatus === 'pending'
    ) {
      return <Loading />;
    } else if (labUsages.length) {
      return (
        <>
          {/* //  Academic year information*/}
          <View style={styles.topContainer}>
            <Text style={[styles.textWrapper, {height: 30}]}>
              {academicYear!.name}
            </Text>

            <Text style={[styles.textWrapper, {height: 30}]}>
              {semester!.semesterName}
            </Text>
            {/* // Week Picker */}
            <View style={styles.picker}>
              <Picker
                style={{borderRadius: 20}}
                mode="dropdown"
                selectedValue={selectedWeek}
                onValueChange={week => handleWeekChange(week)}>
                {[...Array(semester?.numberOfWeeks)].map((_, index) => (
                  <Picker.Item
                    label={`Week ${index}`}
                    value={index}
                    key={index}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <Text style={styles.note}>
            From{' '}
            {moment(new Date(semester!.startDate!))
              .add(selectedWeek, 'weeks')
              .format('dddd DD/MM/yyyy')}{' '}
            to{' '}
            {moment(new Date(semester!.startDate!))
              .add(selectedWeek, 'weeks')
              .add(6, 'days')
              .format('dddd DD/MM/yyyy')}
          </Text>

          {/*// Table */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}>
            {/* Left Column */}
            <View style={{width: leftColumnWidth}}>
              {/* Blank Cell */}
              <View style={{height: HEADER_HEIGHT}} />
              {/* Left Container : scroll synced */}
              <ScrollView
                ref={leftRef}
                style={{flex: 1, backgroundColor: '#fff'}}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}>
                <Table borderStyle={{borderColor: '#fff', borderWidth: 1}}>
                  {tableTitle.map((rowData, index) => (
                    <Row
                      key={index}
                      data={rowData}
                      widthArr={[leftColumnWidth]}
                      style={styles.tableTitle}
                      textStyle={styles.titleText}
                      height={
                        ROW_HEIGHT +
                        getMaxShiftNum(tableData[index]) * USAGE_HEIGHT
                      }
                    />
                  ))}
                </Table>
              </ScrollView>
            </View>
            {/* Right Column */}
            <View style={{flex: 1}}>
              <ScrollView horizontal={true} bounces={false}>
                <View>
                  <Table>
                    <Row
                      data={tableHead}
                      widthArr={widthArr}
                      style={styles.head}
                      textStyle={styles.headText}
                    />
                  </Table>
                  <ScrollView
                    ref={rightRef}
                    style={styles.dataWrapper}
                    scrollEventThrottle={16}
                    bounces={false}
                    onScroll={e => {
                      // Magic code
                      const {y} = e.nativeEvent.contentOffset;
                      leftRef.current?.scrollTo({y, animated: false});
                    }}>
                    <Table borderStyle={{borderWidth: 1, borderColor}}>
                      {tableData.map((rowData, index) => (
                        <TableWrapper
                          key={index}
                          style={{
                            ...styles.tableRow,
                            height:
                              ROW_HEIGHT +
                              getMaxShiftNum(tableData[index]) * USAGE_HEIGHT,
                          }}>
                          {rowData.map((cellData, cellIndex) => (
                            <Cell
                              key={cellIndex}
                              data={
                                <CellItem setIsPanelActive={setIsPanelActive}>
                                  {cellData.length == 0 ? (
                                    <Usage isEmpty={true} />
                                  ) : (
                                    cellData.map((item, index) => {
                                      return (
                                        <Usage
                                          setIsPanelActive={setIsPanelActive}
                                          id={item._id!}
                                          key={item._id}
                                          startPeriod={item.startPeriod}
                                          endPeriod={item.endPeriod}
                                          isEmpty={false}
                                          checkInAt={item.checkInAt}
                                          checkOutAt={item.checkOutAt}
                                          weekNo={item.weekNo}
                                          dayOfWeek={item.dayOfWeek}
                                          courseName={
                                            courses.length > 0 &&
                                            teachings.find(
                                              teaching =>
                                                teaching._id === item.teaching,
                                            )
                                              ? courses.find(
                                                  course =>
                                                    course._id ===
                                                    teachings.find(
                                                      teaching =>
                                                        teaching._id ===
                                                        item.teaching,
                                                    )!.course,
                                                )!.courseName
                                              : ''
                                          }
                                          lecturerId={getLecturerIdByLabUsage(
                                            item,
                                          )}
                                          lecturerName={getLecturerNameByLabUsage(
                                            item,
                                          )}
                                        />
                                      );
                                    })
                                  )}
                                </CellItem>
                              }
                              textStyle={styles.tableText}
                              style={styles.cellData}
                            />
                          ))}
                        </TableWrapper>
                      ))}
                    </Table>
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          </View>
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
              Roll up
            </H1>
            <Image
              source={require('../assets/images/camera.gif')}
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
                We will take a photo of you to verify your Face ID.
              </Text>
            </View>
            <View style={styles.section}>
              <H2 style={styles.h2}>2.&nbsp;</H2>
              <Text style={{color: '#150e56'}}>
                Your location service is required.
              </Text>
            </View>

            {/*// Checkin button */}
            <Pressable
              android_ripple={{color: 'black', borderless: true, radius: 10}}
              style={[
                styles.checkinButton,
                {
                  backgroundColor: labUsageToCheckIn
                    ? labUsages.filter(
                        item => item._id === labUsageToCheckIn,
                      )[0].checkInAt
                      ? '#bdc7c9'
                      : '#0061a8'
                    : '#0061a8',
                },
              ]}
              disabled={
                user?.isFaceIdVerified
                  ? labUsageToCheckIn
                    ? labUsages.filter(
                        item => item._id === labUsageToCheckIn,
                      )[0].checkInAt
                      ? true
                      : false
                    : true
                  : true
              }
              onPress={() => checkInHandler()}>
              <View
                style={[
                  styles.button,
                  {justifyContent: 'center', alignItems: 'center'},
                ]}>
                <Icon
                  type={'Ionicons'}
                  name={'ios-enter-outline'}
                  style={{fontSize: 25, color: '#fff', marginRight: 5}}
                />
                <Text style={{color: '#fff'}}>
                  {user?.isFaceIdVerified
                    ? labUsageToCheckIn
                      ? labUsages.filter(
                          item => item._id === labUsageToCheckIn,
                        )[0].checkInAt
                        ? `Checked in at ${moment(
                            new Date(
                              labUsages.filter(
                                item => item._id === labUsageToCheckIn,
                              )[0].checkInAt!,
                            ),
                          ).format('HH:mm:ss DD/MM/YYYY')}`
                        : 'Check in now'
                      : 'Check in now'
                    : 'Face ID is not verified'}
                </Text>
              </View>
            </Pressable>
            {/*// Checkout button */}
            <Pressable
              android_ripple={{color: 'black', borderless: true, radius: 10}}
              disabled={
                user?.isFaceIdVerified
                  ? labUsageToCheckOut
                    ? labUsages.filter(
                        item => item._id === labUsageToCheckOut,
                      )[0].checkOutAt
                      ? true
                      : false
                    : true
                  : true
              }
              style={[
                styles.checkoutButton,
                {
                  backgroundColor: labUsageToCheckOut
                    ? labUsages.filter(
                        item => item._id === labUsageToCheckOut,
                      )[0].checkOutAt
                      ? '#bdc7c9'
                      : '#0061a8'
                    : '#0061a8',
                },
              ]}
              onPress={() => checkOutHandler()}>
              <View
                style={[
                  styles.button,
                  {justifyContent: 'center', alignItems: 'center'},
                ]}>
                <Icon
                  type={'Ionicons'}
                  name={'ios-exit-outline'}
                  style={{fontSize: 25, color: '#fff', marginRight: 5}}
                />
                <Text style={{color: '#fff'}}>
                  {user?.isFaceIdVerified
                    ? labUsageToCheckOut
                      ? labUsages.filter(
                          item => item._id === labUsageToCheckOut,
                        )[0].checkOutAt
                        ? `Checked out at ${moment(
                            new Date(
                              labUsages.filter(
                                item => item._id === labUsageToCheckOut,
                              )[0].checkOutAt!,
                            ),
                          ).format('HH:mm:ss DD/MM/YYYY')}`
                        : 'Check out now'
                      : 'Check out now'
                    : 'Face ID is not verified'}
                </Text>
              </View>
            </Pressable>
          </SwipeablePanel>
        </>
      );
    } else if (
      academicYearStatus === 'failed' ||
      semesterStatus === 'failed' ||
      labUsagesStatus === 'failed' ||
      labsStatus === 'failed' ||
      coursesStatus === 'failed' ||
      usersStatus === 'failed' ||
      teachingsStatus === 'failed'
    ) {
      return <EmptySchedule />;
    } else {
      return <Loading />;
    }
  };

  // JSX
  return (
    <SafeAreaView forceInset={{top: 'always'}} style={styles.droidSafeArea}>
      {conditionalRenderer()}
    </SafeAreaView>
  );
};
export default ScheduleScreen;

const styles = StyleSheet.create({
  droidSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
    backgroundColor: '#fff',
  },
  head: {
    height: HEADER_HEIGHT,
  },
  wrapper: {flexDirection: 'row'},
  title: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    width: width / 5,
  },
  row: {
    height: 28,
  },
  text: {
    textAlign: 'center',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: height * 0.05,
  },
  textWrapper: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#e0dede',
    borderWidth: 2,
  },
  picker: {
    minWidth: width * 0.4,
    maxWidth: width * 0.5,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    justifyContent: 'center',
    borderColor: '#e0dede',
    borderWidth: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dataWrapper: {},
  note: {
    marginBottom: 5,
    marginRight: 5,
    fontSize: 12,
    alignSelf: 'flex-end',
    color: '#687980',
  },
  tableTitle: {
    backgroundColor: '#1597bb',
  },
  titleText: {
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 14,
    textAlign: 'center',
  },
  headText: {
    color: '#e93b81',
    fontWeight: 'bold',
    fontSize: fontScale * 20,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableText: {
    color: '#407088',
    alignSelf: 'center',
    fontSize: 14,
    textAlign: 'center',
  },
  cellData: {
    flex: 1,
    width: 250,
  },
  panel: {
    // position: 'absolute',
    flexDirection: 'column',
    paddingHorizontal: 10,
    height: height,
  },
  checkinButton: {
    backgroundColor: '#2978b5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginVertical: 10,
  },
  checkoutButton: {
    backgroundColor: '#f58634',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  button: {
    flexDirection: 'row',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 15,
    alignItems: 'center',
  },
  h2: {
    color: '#542e71',
    fontWeight: 'bold',
  },
});
