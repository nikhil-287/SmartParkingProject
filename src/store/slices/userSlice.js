import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  favorites: [],
  searchHistory: [],
  recentSearches: [],
  userLocation: null,
  preferences: {
    defaultRadius: 5000,
    defaultSortBy: 'distance',
    showNotifications: true,
    theme: 'light',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.favorites.find((f) => f.id === action.payload.id);
      if (!exists) {
        state.favorites.push(action.payload);
      }
    },
    removeFavorite: (state, action) => {
      state.favorites = state.favorites.filter((f) => f.id !== action.payload);
    },
    addSearchHistory: (state, action) => {
      const exists = state.searchHistory.find((s) => s.query === action.payload.query);
      if (!exists) {
        state.searchHistory.unshift(action.payload);
        if (state.searchHistory.length > 50) {
          state.searchHistory = state.searchHistory.slice(0, 50);
        }
      }
    },
    addRecentSearch: (state, action) => {
      const exists = state.recentSearches.find((s) => s === action.payload);
      if (!exists) {
        state.recentSearches.unshift(action.payload);
        if (state.recentSearches.length > 10) {
          state.recentSearches = state.recentSearches.slice(0, 10);
        }
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      state.recentSearches = [];
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    loadPersistedData: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  addFavorite,
  removeFavorite,
  addSearchHistory,
  addRecentSearch,
  clearSearchHistory,
  setUserLocation,
  updatePreferences,
  loadPersistedData,
} = userSlice.actions;

// Async actions for persistence
export const persistFavorites = () => async (dispatch, getState) => {
  try {
    const { favorites } = getState().user;
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to persist favorites:', error);
  }
};

export const persistSearchHistory = () => async (dispatch, getState) => {
  try {
    const { searchHistory, recentSearches } = getState().user;
    await AsyncStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    await AsyncStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  } catch (error) {
    console.error('Failed to persist search history:', error);
  }
};

export const loadPersistedDataAsync = () => async (dispatch) => {
  try {
    const [favorites, searchHistory, recentSearches, preferences] = await Promise.all([
      AsyncStorage.getItem('favorites'),
      AsyncStorage.getItem('searchHistory'),
      AsyncStorage.getItem('recentSearches'),
      AsyncStorage.getItem('preferences'),
    ]);

    const persistedData = {
      favorites: favorites ? JSON.parse(favorites) : [],
      searchHistory: searchHistory ? JSON.parse(searchHistory) : [],
      recentSearches: recentSearches ? JSON.parse(recentSearches) : [],
      preferences: preferences ? JSON.parse(preferences) : initialState.preferences,
    };

    dispatch(loadPersistedData(persistedData));
  } catch (error) {
    console.error('Failed to load persisted data:', error);
  }
};

export default userSlice.reducer;
