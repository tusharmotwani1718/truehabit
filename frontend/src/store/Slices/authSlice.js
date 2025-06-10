import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    authStatus: false,
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
            // Calculate expiration dates
            const accessTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString(); // 1 day
            const refreshTokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toUTCString(); // 10 days

            // Set cookies with expiration dates
            document.cookie = `refreshToken=${action.payload.refreshToken}; path=/; Secure; SameSite=None; expires=${refreshTokenExpiry}`;
            document.cookie = `accessToken=${action.payload.accessToken}; path=/; Secure; SameSite=None; expires=${accessTokenExpiry}`;
            // localStorage.setItem('authStatus', true); // Save to localStorage
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
        logout: (state, action) => {
            state.authStatus = false;
            state.userData = null;
            // Clear cookies properly
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
            document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';

            // localStorage.removeItem('authStatus'); // clear from localStorage
        },
        // manually set an authStatus:
        setAuthStatus: (state, action) => {
            state.authStatus = action.payload;
        },
    }
})


export const { login, logout, setAuthStatus, updateProfile, setProfilePicture, changeProfilePicture, removeProfilePicture, activateAccount } = authSlice.actions;

export default authSlice.reducer;
