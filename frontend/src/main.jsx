import { StrictMode } from 'react';
import './index.css';
import App from './App.jsx';
import { createRoot } from 'react-dom/client';
import { Provider, useSelector } from 'react-redux';
import { persistor, store } from './store/store.js';
import { PersistGate } from 'redux-persist/integration/react';
import { ErrorBoundary } from './components/index.js';

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  </StrictMode>
);