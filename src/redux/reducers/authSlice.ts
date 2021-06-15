import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AppDispatch} from '../store';
import {api, auth} from '../../api';
import {ROLES, User} from '../../models/';

export interface AuthState {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  verifiedUser: User | null;
  verifiedRole: ROLES | null;
  avatarUrl: string | null;
  verifiedToken: string | null;
  expirationDate: number | null;
  isSessionTimeOut: boolean;
}

const initialState: AuthState = {
  status: 'idle',
  verifiedUser: null,
  verifiedRole: null,
  avatarUrl: '',
  verifiedToken: null,
  expirationDate: null,
  isSessionTimeOut: false,
};

export interface GETResponse {
  verifiedUser: User;
  avatarUrl: string;
  verifiedRole: ROLES;
  verifiedToken: string;
}

export const verify = createAsyncThunk<
  GETResponse,
  {token: string; role: ROLES; expirationDate: number},
  {rejectValue: GETResponse; dispatch: AppDispatch}
>('auth/verify', async ({token, role, expirationDate}, thunkApi) => {
  try {
    const res = await api.get('/auth', {
      params: {
        role: role,
      },
      headers: {Authorization: `Bearer ${token}`},
    });
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('role', role.toString());
    await AsyncStorage.setItem('expirationDate', expirationDate.toString());
    setTimeout(() => {
      thunkApi.dispatch(setIsSessionTimeout(true));
    }, new Date(expirationDate).getTime() - new Date().getTime());
    return res.data! as GETResponse;
  } catch (error) {
    return thunkApi.rejectWithValue(error.response.data as GETResponse);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsSessionTimeout: (state, action: PayloadAction<boolean>) => {
      state.isSessionTimeOut = action.payload;
    },
    resetState: state => {
      state.verifiedUser = null;
      state.verifiedToken = null;
      state.verifiedRole = null;
      state.avatarUrl = null;
      state.isSessionTimeOut = false;
    },
  },
  extraReducers: builder => {
    builder.addCase(verify.pending, state => {
      state.status = 'pending';
    });
    builder.addCase(verify.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.verifiedUser = action.payload.verifiedUser;
      state.verifiedToken = action.payload.verifiedToken;
      state.verifiedRole = action.payload.verifiedRole;
      state.avatarUrl = action.payload.avatarUrl;
    });
    builder.addCase(verify.rejected, state => {
      state.status = 'failed';
      state.verifiedUser = null;
      state.verifiedToken = null;
      state.verifiedRole = null;
      state.avatarUrl = null;
    });
  },
});

export const {setIsSessionTimeout, resetState} = authSlice.actions;

export default authSlice.reducer;
