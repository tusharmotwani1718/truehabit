import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthStatus, logout } from './store/Slices/authSlice.js';

function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const storedAuthStatus = useSelector(state => state.auth.authStatus);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const checkAuth = () => {
      const accessToken = getCookie('accessToken');
      const refreshToken = getCookie('refreshToken');

      if (accessToken && refreshToken) {
        if (!storedAuthStatus) {
          console.log('Access token found, setting authStatus = true');
          dispatch(setAuthStatus(true));
        }
      } else {
        if (storedAuthStatus) {
          console.log('No tokens, logging out');
          dispatch(logout());
        }
      }
    };

    checkAuth();
  }, [dispatch, storedAuthStatus]);

  return <>{children}</>;
}

export default AuthProvider;
