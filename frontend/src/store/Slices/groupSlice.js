import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../helpers/refreshToken.js";



// async thunk:
export const fetchGrouphabits = createAsyncThunk(
    'groups/fetchGrouphabits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `${import.meta.env.VITE_API_BASE_URL_GROUPS}/gettodayhabits`,
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
            
            return response.data.data || []; // Resolved payload
        } catch (error) {
            rejectWithValue(error.response.data.message || "Network Error");
            return [];
        }
    }
);

// initialState:
const initialState = {
    groups: [],
    groupHabits: [],
    currentGroupHabit: null,
    groupLoading: false,  // Track groupLoading state
    groupError: null      // Track groupErrors
};


// reducers:
const groupSlice = createSlice({
    name: "group",
    initialState,
    reducers: {

        // groups reducers:
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
        addGroup: (state, action) => {
            state.groups.push(action.payload);
        },
        deleteGroup: (state, action) => {
            state.groups = state.groups.filter(group => group._id !== action.payload)
        },
        updateGroup: (state, action) => {
            const index = state.groups.findIndex(
                group => group._id === action.payload._id
            );
            if (index !== -1) {
                state.groups[index] = action.payload;
            }
        },

        // habits reducers:
        setGroupHabits: (state, action) => {
            state.groupHabits = action.payload;
        },
        addGroupHabit: (state, action) => {
            state.groupHabits.push(action.payload);
        },
        deleteGroupHabit: (state, action) => {
            state.groupHabits = state.groupHabits.filter(habit => habit._id !== action.payload);
        },
        updateGroupHabit: (state, action) => {
            const index = state.groupHabits.findIndex(
                habit => habit._id === action.payload._id
            );
            if (index !== -1) {
                state.groupHabits[index] = action.payload;
            }
        },
        updateHabitCompletion: (state, action) => {
            const index = state.groupHabits.findIndex(
                habit => habit._id === action.payload._id
            );
            if (index !== -1) {
                state.groupHabits[index].completedDays.push(action.payload.completionDate);
            }
        },
        setCurrentGroupHabit: (state, action) => {
            state.currentGroupHabit = action.payload;
        },
        resetHabits: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // API call started
            .addCase(fetchGrouphabits.pending, (state) => {
                state.groupLoading = true;
                state.groupError = null;
            })
            // API call succeeded
            .addCase(fetchGrouphabits.fulfilled, (state, action) => {
                state.groupLoading = false;
                state.groupHabits = action.payload; // Update habits
            })
            // API call failed
            .addCase(fetchGrouphabits.rejected, (state, action) => {
                state.groupLoading = false;
                state.groupError = action.payload; // Store groupError
            });
    },

});

// Export actions:
export const { setGroupHabits, addGroupHabit, deleteGroupHabit, updateGroupHabit, updateHabitCompletion, setCurrentGroupHabit, setGroups, addGroup, deleteGroup, updateGroup } = groupSlice.actions;
export default groupSlice.reducer;