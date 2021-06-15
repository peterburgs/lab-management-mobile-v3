import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AppDispatch} from '../store';
import {api, auth} from '../../api';
import {
  AcademicYear,
  Semester,
  LabUsage,
  Lab,
  Course,
  Teaching,
  User,
  SEMESTER_STATUSES,
} from '../../models/';
import _ from 'lodash';

export interface ScheduleState {
  academicYearStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  semesterStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  labUsagesStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  labsStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  coursesStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  teachingsStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  usersStatus: 'idle' | 'pending' | 'succeeded' | 'failed';
  academicYear: AcademicYear | null;
  semester: Semester | null;
  labUsages: LabUsage[];
  labs: Lab[];
  courses: Course[];
  teachings: Teaching[];
  users: User[];
  loadingSchedule: boolean;
  selectedWeek: number;
  labUsageToCheckIn: string | null;
  labUsageToCheckOut: string | null;
  isCheckingIn: boolean;
}

export const initialState: ScheduleState = {
  academicYearStatus: 'idle',
  semesterStatus: 'idle',
  labUsagesStatus: 'idle',
  labsStatus: 'idle',
  coursesStatus: 'idle',
  teachingsStatus: 'idle',
  usersStatus: 'idle',
  academicYear: null,
  semester: null,
  labUsages: [],
  labs: [],
  courses: [],
  teachings: [],
  users: [],
  loadingSchedule: false,
  selectedWeek: 0,
  labUsageToCheckIn: null,
  labUsageToCheckOut: null,
  isCheckingIn: true,
};
export interface GETAcademicYearResponse {
  academicYears: AcademicYear[];
}
export interface GETSemesterResponse {
  semesters: Semester[];
}
export interface GETLabUsageResponse {
  labUsages: LabUsage[];
}
export interface GETLabResponse {
  labs: Lab[];
}
export interface GETCourseResponse {
  courses: Course[];
}
export interface GETTeachingResponse {
  teachings: Teaching[];
}
export interface GETUserResponse {
  users: User[];
}
export interface PUTLabUsageResponse {
  labUsage: LabUsage;
}

export const getOpeningAcademicYear = createAsyncThunk<
  GETAcademicYearResponse,
  {},
  {rejectValue: GETAcademicYearResponse; dispatch: AppDispatch}
>(`academic-year/get`, async (_, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/academic-years', {
      params: {
        isOpening: true,
      },
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETAcademicYearResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(
      error.response.data as GETAcademicYearResponse,
    );
  }
});

export const getLabUsageBySemesterId = createAsyncThunk<
  GETLabUsageResponse,
  {semester: string},
  {rejectValue: GETLabUsageResponse; dispatch: AppDispatch}
>(`labusage/get`, async ({semester}, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/schedules', {
      params: {
        semester: semester,
      },
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETLabUsageResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETLabUsageResponse);
  }
});

export const getOpeningSemester = createAsyncThunk<
  GETSemesterResponse,
  {},
  {rejectValue: GETSemesterResponse; dispatch: AppDispatch}
>(`semester/get`, async (_, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/semesters', {
      params: {
        status: SEMESTER_STATUSES.OPENING,
      },
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETSemesterResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETSemesterResponse);
  }
});

export const getLabs = createAsyncThunk<
  GETLabResponse,
  {},
  {rejectValue: GETLabResponse; dispatch: AppDispatch}
>(`lab/get`, async (_, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/labs', {
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETLabResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETLabResponse);
  }
});

export const getCourses = createAsyncThunk<
  GETCourseResponse,
  {},
  {rejectValue: GETCourseResponse; dispatch: AppDispatch}
>(`course/get`, async (_, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/courses', {
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETCourseResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETCourseResponse);
  }
});

export const getTeachings = createAsyncThunk<
  GETTeachingResponse,
  {},
  {rejectValue: GETTeachingResponse; dispatch: AppDispatch}
>(`teaching/get`, async (_, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/teachings', {
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETTeachingResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETTeachingResponse);
  }
});
export const getUsers = createAsyncThunk<
  GETUserResponse,
  {},
  {rejectValue: GETUserResponse; dispatch: AppDispatch}
>(`users/get`, async (_, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/users', {
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETUserResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETUserResponse);
  }
});

export const updateLabUsageById = createAsyncThunk<
  PUTLabUsageResponse,
  LabUsage,
  {rejectValue: PUTLabUsageResponse; dispatch: AppDispatch}
>(`schedules/update`, async (labUsage, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.put(`/schedules/${labUsage._id}`, labUsage, {
      headers: {Authorization: token.Authorization},
    });

    return res.data as PUTLabUsageResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as PUTLabUsageResponse);
  }
});

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setLoadingSchedule: (state, action: PayloadAction<boolean>) => {
      state.loadingSchedule = action.payload;
    },
    setSelectedWeek: (state, action: PayloadAction<number>) => {
      state.selectedWeek = action.payload;
    },
    setLabUsageToCheckIn: (state, action: PayloadAction<string>) => {
      state.labUsageToCheckIn = action.payload;
    },
    setLabUsageToCheckOut: (state, action: PayloadAction<string>) => {
      state.labUsageToCheckOut = action.payload;
    },
    setIsCheckingIn: (state, action: PayloadAction<boolean>) => {
      state.isCheckingIn = action.payload;
    },
  },
  extraReducers: builder => {
    // getOpeningAcademicYear
    builder.addCase(getOpeningAcademicYear.fulfilled, (state, action) => {
      state.academicYear = action.payload.academicYears[0];
      state.academicYearStatus = 'succeeded';
    });
    builder.addCase(getOpeningAcademicYear.pending, (state, action) => {
      state.academicYearStatus = 'pending';
    });
    builder.addCase(getOpeningAcademicYear.rejected, (state, action) => {
      state.academicYearStatus = 'failed';
      state.academicYear = null;
    });

    // getOpeningSemester
    builder.addCase(getOpeningSemester.fulfilled, (state, action) => {
      state.semester = action.payload.semesters[0];
      state.semesterStatus = 'succeeded';
    });
    builder.addCase(getOpeningSemester.pending, (state, action) => {
      state.semesterStatus = 'pending';
    });
    builder.addCase(getOpeningSemester.rejected, (state, action) => {
      state.semesterStatus = 'failed';
      state.semester = null;
    });

    // getLabUsageBySemesterId
    builder.addCase(getLabUsageBySemesterId.fulfilled, (state, action) => {
      state.labUsages = action.payload.labUsages;
      state.labUsagesStatus = 'succeeded';
    });
    builder.addCase(getLabUsageBySemesterId.pending, (state, action) => {
      state.labUsagesStatus = 'pending';
    });
    builder.addCase(getLabUsageBySemesterId.rejected, (state, action) => {
      state.labUsagesStatus = 'failed';
      state.labUsages = [];
    });

    // getLabs
    builder.addCase(getLabs.fulfilled, (state, action) => {
      state.labs = action.payload.labs;
      state.labsStatus = 'succeeded';
    });
    builder.addCase(getLabs.pending, (state, action) => {
      state.labsStatus = 'pending';
    });
    builder.addCase(getLabs.rejected, (state, action) => {
      state.labsStatus = 'failed';
      state.labs = [];
    });

    // getCourses
    builder.addCase(getCourses.fulfilled, (state, action) => {
      state.courses = action.payload.courses;
      state.coursesStatus = 'succeeded';
    });
    builder.addCase(getCourses.pending, (state, action) => {
      state.coursesStatus = 'pending';
    });
    builder.addCase(getCourses.rejected, (state, action) => {
      state.coursesStatus = 'failed';
      state.courses = [];
    });

    // getTeachings
    builder.addCase(getTeachings.fulfilled, (state, action) => {
      state.teachings = action.payload.teachings;
      state.teachingsStatus = 'succeeded';
    });
    builder.addCase(getTeachings.pending, (state, action) => {
      state.teachingsStatus = 'pending';
    });
    builder.addCase(getTeachings.rejected, (state, action) => {
      state.teachingsStatus = 'failed';
      state.teachings = [];
    });

    // getUsers
    builder.addCase(getUsers.fulfilled, (state, action) => {
      state.users = action.payload.users;
      state.usersStatus = 'succeeded';
    });
    builder.addCase(getUsers.pending, (state, action) => {
      state.usersStatus = 'pending';
    });
    builder.addCase(getUsers.rejected, (state, action) => {
      state.usersStatus = 'failed';
      state.users = [];
    });

    // LabUsage
    builder.addCase(updateLabUsageById.fulfilled, (state, action) => {
      const currentIndex = state.labUsages.findIndex(
        item => item._id === action.payload.labUsage!._id,
      );
      state.labUsages[currentIndex] = _.cloneDeep(action.payload.labUsage!);
    });
  },
});
export const {
  setLoadingSchedule,
  setSelectedWeek,
  setLabUsageToCheckIn,
  setLabUsageToCheckOut,
  setIsCheckingIn,
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
