import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../helpers/refreshToken.js";


// Async Thunk
export const fetchHabits = createAsyncThunk(
    'habits/fetchHabits',
    async (habitType, { rejectWithValue }) => {
        try {
            const response = await api.get(
                `${import.meta.env.VITE_API_BASE_URL_HABITS}/gethabits/${habitType}`,
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
            // console.log(response.data.data)
            return response.data.data || []; // Resolved payload
        } catch (error) {
            console.log(error);
            return rejectWithValue(error.response?.data || 'Failed to fetch habits');
        }
    }
);

const initialState = {
    currentHabits: [],
    currentHabit: null,
    currentNotes: [],
    loading: false,  // Track loading state
    error: null      // Track errors
};

const habitSlice = createSlice({
    name: "habit",
    initialState,
    reducers: {
        setHabits: (state, action) => {
            state.currentHabits = action.payload;
        },
        addHabit: (state, action) => {
            state.currentHabits.push(action.payload);
        },
        deleteHabit: (state, action) => {
            state.currentHabits = state.currentHabits.filter(habit => habit._id !== action.payload);
        },
        updateHabit: (state, action) => {
            const index = state.currentHabits.findIndex(
                habit => habit._id === action.payload._id
            );
            if (index !== -1) {
                state.currentHabits[index] = action.payload;
            }
        },
        updateHabitCompletion: (state, action) => {
            const index = state.currentHabits.findIndex(
                habit => habit._id === action.payload._id
            );
            if (index !== -1) {
                state.currentHabits[index].completedDays.push(action.payload.completionDate);
            }



        },
        setCurrentHabit: (state, action) => {
            state.currentHabit = action.payload;
        },
        resetHabits: (state) => {
            return initialState;
        },
        setNotes: (state, action) => {
            const habitID = action.payload.habitId;
            const habitIndex = state.currentHabits.findIndex(habit => habit._id === habitID);
            if (habitIndex !== -1) {
                state.currentHabits[habitIndex].notes = action.payload.notes;
                state.currentNotes = action.payload.notes;
            }

            state.currentNotes = action.payload.notes;
        },
        addNote: (state, action) => {
            const habitID = action.payload.habitId;
            const habitIndex = state.currentHabits.findIndex(habit => habit._id === habitID);
            if (habitIndex !== -1) {
                state.currentHabits[habitIndex].notes.push(action.payload.note);
            }
            state.currentNotes.push(action.payload.note);
        },
        editNote: (state, action) => {
            const habitID = action.payload.habitId;
            const habitIndex = state.currentHabits.findIndex(habit => habit._id === habitID);
            if (habitIndex !== -1) {
                const noteIndex = state.currentHabits[habitIndex].notes.findIndex(note => note._id === action.payload.noteId);
                if (noteIndex !== -1) {
                    state.currentHabits[habitIndex].notes[noteIndex] = action.payload.note;
                    state.currentNotes[noteIndex] = action.payload.note;
                }
            }
            const noteIndex = state.currentHabits[habitIndex].notes.findIndex(note => note._id === action.payload.noteId);
            if (noteIndex !== -1) {
                state.currentHabits[habitIndex].notes[noteIndex] = action.payload.note;
                state.currentNotes[noteIndex] = action.payload.note;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // API call started
            .addCase(fetchHabits.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // API call succeeded
            .addCase(fetchHabits.fulfilled, (state, action) => {
                state.loading = false;
                state.currentHabits = action.payload; // Update habits
            })
            // API call failed
            .addCase(fetchHabits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store error
            });
    },
});

export const { setHabits, addHabit, deleteHabit, updateHabit, resetHabits, setCurrentHabit, updateHabitCompletion, setNotes, addNote, editNote } = habitSlice.actions;
export default habitSlice.reducer;