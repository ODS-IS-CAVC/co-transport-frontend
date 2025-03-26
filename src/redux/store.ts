// redux/store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import { PersistConfig } from 'redux-persist/es/types';

import { reducers } from '.';
import { createPersistStorage } from './createStore';

const config = combineReducers({
  app: reducers.appReducer,
  auth: reducers.authReducer,
  home: reducers.homeReducer,
});

// ... previous code remains the same

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: createPersistStorage(),
  whitelist: ['auth'],
  version: 1,
  // blacklist:[]
};
const persisReducerConfig = persistReducer(persistConfig, config);

export const store = configureStore({
  reducer: persisReducerConfig,
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof config>;
export type AppDispatch = typeof store.dispatch;
export const persister = persistStore(store);
