import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    authStatus: null,
    userData: null
}




const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // reducers to change state of the slice:
        login: (state, action) => {
            state.authStatus = true;
            state.userData = action.payload.user;

            // Only works at localhost:
            // Calculate expiration dates
            const accessTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 1 day
            const refreshTokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toUTCString(); // 10 days

            // Set cookies with expiration dates
            document.cookie = `refreshToken=${action.payload.refreshToken}; path=/; Secure; SameSite=None; expires=${refreshTokenExpiry}`;
            document.cookie = `accessToken=${action.payload.accessToken}; path=/; Secure; SameSite=None; expires=${accessTokenExpiry}`;
            localStorage.setItem('authStatus', true); // Save to localStorage
        },
        updateProfile: (state, action) => {
            state.userData = action.payload;
        },
        setProfilePicture: (state, action) => {
            if (state.userData) {
                // console.log("Setting profile picture:", action.payload);
                state.userData.profilePicture = action.payload.publicLink;
                state.userData.profilePicturePublicId = action.payload.publicId;
            }
        },
        changeProfilePicture: (state, action) => {
            if (state.userData) {
                state.userData.profilePicture = action.payload;
            }
        },
        removeProfilePicture: (state, action) => {
            if (state.userData) {
                state.userData.profilePicture = null;
            }
        },
        activateAccount: (state, action) => {
            if (state.userData) {
                state.userData.isEmailVerified = true;
            }
        },
        setAuthStatus: (state, action) => {
            state.authStatus = action.payload;
        },
        setAuthChecked: (state, action) => {
            state.isAuthChecked = action.payload;
        },
        logout: (state) => {
            state.authStatus = false;
            state.isAuthChecked = true; // logout still means check is done
        }
    }
})


export const { login, logout, setAuthStatus, updateProfile, setProfilePicture, changeProfilePicture, removeProfilePicture, activateAccount, setAuthChecked } = authSlice.actions;

export default authSlice.reducer;
