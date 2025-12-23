import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './Slices/authSlice';
import habitReducer from './Slices/habitSlice';
import dashboardReducer from './Slices/DashboardSlice';
import groupReducer from './Slices/groupSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [] // persist nothing for now
};

// ✅ First combine all your reducers
const rootReducer = combineReducers({
  auth: authReducer,
  habit: habitReducer,
  dashboard: dashboardReducer,
  group: groupReducer
});

// ✅ Then wrap the entire rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
