// usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  users: [],
  status: 'idle',
  error: null,
  isAdminLoggedIn: false, // New state to track admin login
};

// Fetch users from the server
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await axios.get('http://localhost:8000/users');
  return response.data;
});

// Check user credentials and update authentication state
export const loginUser = createAsyncThunk('users/loginUser', async ({ username, password }, thunkAPI) => {
  try {
    const response = await axios.get('http://localhost:8000/users');
    const users = response.data.users;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
      // If user is admin, set isAdminLoggedIn to true
      if (user.is_admin) {
        thunkAPI.dispatch(usersSlice.actions.setAdminLoggedIn(true));
      }
      
    } else {
      // If user credentials don't match, show an alert or handle the error as needed
      alert('Invalid username or password.');
    }
  } catch (error) {
    console.error('Error while logging in:', error);
  }
});

export const registerUser = createAsyncThunk('users/registerUser', async ({ username, password }) => {
  try {
    const newUser = {
      username: username,
      password: password,
    };

    const response = await axios.post('http://localhost:8000/users', newUser);
    return response.data;
  } catch (error) {
    console.error('Error while registering user:', error);
    throw error;
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setAdminLoggedIn: (state, action) => {
      state.isAdminLoggedIn = action.payload;
    },
    // Optionally, add more reducers to handle other authentication states if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.users.push(action.payload); // Add the new user to the state after registration
      });
  },
});

export const { setAdminLoggedIn } = usersSlice.actions;

export default usersSlice.reducer;

