import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';

function AuthLayout({ children, authentication = true }) {
  const authStatus = useSelector(state => state.auth.authStatus);
  const isAuthChecked = useSelector(state => state.auth.isAuthChecked); // 🚀

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthChecked) return; // Wait until auth check is done

    // Protected route
    if (authentication && !authStatus) {
      if (location.pathname !== '/') navigate('/');
    }

    // Public route, but already authenticated
    if (!authentication && authStatus) {
      if (location.pathname !== '/todayhabits') navigate('/todayhabits');
    }

  }, [authStatus, authentication, navigate, location.pathname, isAuthChecked]);

  if (!isAuthChecked) {
    return <h1>Loading...</h1>; // Wait until auth check is finished
  }

  return <>{children}</>;
}

export default AuthLayout;
