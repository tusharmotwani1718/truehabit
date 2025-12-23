import { StrictMode, useState, useEffect } from 'react';
import './index.css';
import App from './App.jsx';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { persistor, store } from './store/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { ErrorBoundary } from './components/index.js';
import api from './helpers/refreshToken.js';
import { logout as logoutSlice, login as loginSlice } from './store/Slices/authSlice.js';
import {Spinner} from './components/index.js';

// verify user on each load:
const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  // const { displayMessage } = useMessage();

  useEffect(() => {
    const verifyUser = async () => {
      // console.log("Verifying user...");
      try {
        const { data } = await api.get(`/getuserdetails`, { withCredentials: true });
        // console.log("getMyInfo response:", data);
        

        dispatch(loginSlice({ user: data.data }));
      } catch (error) {
        // console.error("User verification failed:", error);
        // displayMessage('error', "Network Error");
        dispatch(logoutSlice());
      } finally {
        setLoading(false);
      }
    };

    verifyUser();

  }, [dispatch]);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* <Loader /> */}
        <Spinner size='lg'/>
      </div>
    );
  }

  return children;
};

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <AppInitializer>
            <App />
          </AppInitializer>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  </StrictMode>
);