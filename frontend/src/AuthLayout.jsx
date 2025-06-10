import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

function AuthLayout({ children, authentication = true }) {
  const [initialCheck, setInitialCheck] = useState(true);
  const authStatus = useSelector(state => state.auth.authStatus);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for authStatus to be defined
    if (authStatus === null || authStatus === undefined) return;

    // Access protected route, but not authenticated
    if (authentication && !authStatus) {
      if (location.pathname !== '/') navigate('/');
    }

    // Access public route, but already authenticated
    if (!authentication && authStatus) {
      if (location.pathname !== '/todayhabits') navigate('/todayhabits');
    }

    // Done checking
    setInitialCheck(false);
  }, [authStatus, authentication, navigate, location.pathname]);

  return initialCheck ? <h1>Loading...</h1> : <>{children}</>;
}

export default AuthLayout;
