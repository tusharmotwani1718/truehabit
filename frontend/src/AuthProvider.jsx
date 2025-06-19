import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthStatus, logout, setAuthChecked } from './store/Slices/authSlice.js';
import axios from 'axios';

function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const storedAuthStatus = useSelector(state => state.auth.authStatus);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL_USERS}/auth/check-session`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = res.data;

        if (data.isAuthenticated) {
          console.log('✅ Session valid, setting authStatus = true');
          if (!storedAuthStatus) {
            dispatch(setAuthStatus(true));
          }
        } else {
          console.log('❌ No valid session, logging out');
          if (storedAuthStatus) {
            dispatch(logout());
          } else {
            dispatch(setAuthStatus(false));
          }
        }
      } catch (err) {
        console.log('⚠️ Auth check failed', err);
        dispatch(logout());
      } finally {
        dispatch(setAuthChecked(true));  // 🚀 Always set isAuthChecked
      }
    };

    checkAuth();
  }, [dispatch, storedAuthStatus]);

  return <>{children}</>;
}

export default AuthProvider;
