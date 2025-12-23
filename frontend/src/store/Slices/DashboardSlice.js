import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../helpers/refreshToken.js';



// import { fetchHabits } from './habitSlice.js';

// export const initDashboard = createAsyncThunk(
//   'dashboard/initDashboard',
//   async (_, { dispatch, getState }) => {
//     // Step 1: Load habits into habit slice
//     await dispatch(fetchHabits('active')).unwrap();

//     // Step 2: Now get the habits from that slice
//     const state = getState();
//     const habits = state.habit.currentHabits;
//     // console.log("Habits after fetch:", habits);
//     return habits;
//   }
// );

export const initDashboard = createAsyncThunk(
  'dashboard/initDashboard',
  async (timePeriod, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `${import.meta.env.VITE_API_BASE_URL_HABITS}/countbytime/${timePeriod}`
      );
      // console.log(response.data);
      return response.data || []; // Resolved payload
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || 'Failed to fetch habits');
    }
  }
);


const initialState = {
  // todayhabitCount: 0,
  // thisWeekhabitCount: 0,
  // thisMonthhabitCount: 0,
  timePeriod: "thisWeek",
  habitsCount: 0,
  completionRate: 0,
  lastPeriodCompletionRate: 0,
  habits: [],
  loading: false,
  error: null
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setHabitCount: (state, action) => {
      state.habitsCount = action.payload.count;
      state.timePeriod = action.payload.timePeriod;
      state.completionRate = action.payload.completionRate;
      state.lastPeriodCompletionRate = action.payload.lastPeriodCompletionRate;
      // set the habits:
      state.habits = action.payload.habits;
    }
  },
  extraReducers: (builder) => {
    // load the data into this slice (dashboardSlice)
    builder
      .addCase(initDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload;
      })
      .addCase(initDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
})


export const { setHabitCount } = dashboardSlice.actions;
export default dashboardSlice.reducer;