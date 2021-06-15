import AsyncStorage from '@react-native-async-storage/async-storage';
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {AppDispatch} from '../store';
import {api, auth} from '../../api';
import {ROLES, User} from '../../models/';

export interface UserState {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  user: User | null;
}

export const initialState: UserState = {
  status: 'idle',
  user: null,
};
export interface GETResponse {
  users: User[];
}

export interface PUTResponse {
  user: User;
}
export const getUserById = createAsyncThunk<
  GETResponse,
  {
    id: string;
  },
  {rejectValue: GETResponse; dispatch: AppDispatch}
>(`user/get`, async ({id}, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.get('/users', {
      params: {
        _id: id,
      },
      headers: {Authorization: token.Authorization},
    });
    return res.data as GETResponse;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as GETResponse);
  }
});

export const updateUserById = createAsyncThunk<
  PUTResponse,
  User,
  {rejectValue: PUTResponse; dispatch: AppDispatch}
>(`user/update`, async (user, thunkApi) => {
  try {
    const token = await auth();
    const res = await api.put(`/users/${user._id}`, user, {
      headers: {Authorization: token.Authorization},
    });
    if (res) {
      return res.data as PUTResponse;
    }
    console.log(res);
    return res;
  } catch (error) {
    console.log(error.message);
    return thunkApi.rejectWithValue(error.response.data as PUTResponse);
  }
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getUserById.pending, (state, action) => {
      state.status = 'pending';
    });
    builder.addCase(getUserById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.users[0];
    });
    builder.addCase(getUserById.rejected, (state, action) => {
      state.status = 'failed';
      state.user = null;
    });
    builder.addCase(updateUserById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
    });
  },
});
export default userSlice.reducer;
