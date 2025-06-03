import { createSlice} from '@reduxjs/toolkit';

const getInitialState = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const userString = localStorage.getItem('user');
  let user = null;
  
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    // If there's an error parsing, clear potentially corrupted data
    localStorage.removeItem('user');
  }
  
  return {
    token,
    refreshToken,
    user,
    isAuthenticated: !!token
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    login: (state, action) => {
      const { token, refreshToken, user } = action.payload;
      
      // Update state
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      // Clear state
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },

    updateToken: (state, action) => {
      const {access, refresh} = action.payload;
      state.token = access
      localStorage.setItem('token', access);

      if (refresh) {
        state.refreshToken = refresh;
        localStorage.setItem('refreshToken', refresh);
      }
    },

    updateUser: (state, action) => {
      // Update user profile details
      state.user = {
        ...state.user,
        ...action.payload
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    
    updateProfileComplete: (state, action) => {
      // Update is_profile_complete status
      state.user = {
        ...state.user,
        is_profile_complete: action.payload
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }
});

export const { login, logout, updateUser, updateProfileComplete, updateToken } = authSlice.actions;

export default authSlice.reducer;