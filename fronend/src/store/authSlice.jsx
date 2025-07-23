import { createSlice } from '@reduxjs/toolkit';


const safeParse = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing ${key}:`, error);
    localStorage.removeItem(key);
    return null;
  }
};

const initialState = {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: safeParse('user'),
  isAuthenticated: !!localStorage.getItem('token'),
  role: safeParse('user')?.role || null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, refreshToken, user } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.isLoading = false;
      state.error = null;
      ['token', 'refreshToken', 'user'].forEach(key => localStorage.removeItem(key));
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    updateToken: (state, action) => {
      state.token = action.payload.access;
      if (action.payload.refresh) {
        state.refreshToken = action.payload.refresh;
        localStorage.setItem('refreshToken', action.payload.refresh);
      }
      localStorage.setItem('token', action.payload.access);
    },

    updateUser: (state, action) => {

      state.user = {
        ...state.user,
        ...action.payload
      };


      localStorage.setItem('user', JSON.stringify(state.user));
    },

    updateProfileComplete: (state, action) => {

      state.user = {
        ...state.user,
        is_profile_complete: action.payload
      };


      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }
});

export const { login, logout, updateUser, updateProfileComplete, updateToken } = authSlice.actions;

export default authSlice.reducer;