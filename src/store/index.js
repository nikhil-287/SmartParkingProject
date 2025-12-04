import { configureStore } from '@reduxjs/toolkit';
import parkingReducer from './slices/parkingSlice';
import aiReducer from './slices/aiSlice';
import userReducer from './slices/userSlice';
import bookingReducer from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    parking: parkingReducer,
    ai: aiReducer,
    user: userReducer,
    booking: bookingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/loadPersistedData'],
      },
    }),
});

export default store;
