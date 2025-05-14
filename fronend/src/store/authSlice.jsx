import { createSlice } from '@reduxjs/toolkit';


// Get token and user from local storage if they exist
const getInitialState = () => {
  const token = localStorage.getItem('token');
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
    user,
    isAuthenticated: !!token
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;
      
      // Update state
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      // Clear state
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      
      // Remove from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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

export const { login, logout, updateUser, updateProfileComplete } = authSlice.actions;

export default authSlice.reducer;