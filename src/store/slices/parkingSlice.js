import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import parkingService from '../../services/parkingService';

// Async thunks
export const searchParking = createAsyncThunk(
  'parking/search',
  async ({ latitude, longitude, radius, limit }, { rejectWithValue }) => {
    try {
      const data = await parkingService.searchByCoordinates(latitude, longitude, radius, limit);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchByAddress = createAsyncThunk(
  'parking/searchByAddress',
  async ({ address, limit }, { rejectWithValue }) => {
    try {
      const data = await parkingService.searchByAddress(address, limit);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const filterParking = createAsyncThunk(
  'parking/filter',
  async ({ results, filters }, { rejectWithValue }) => {
    try {
      const data = await parkingService.filterParking(results, filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  parkingSpots: [],
  filteredSpots: [],
  selectedParking: null,
  loading: false,
  error: null,
  searchLocation: null,
  filters: {
    priceMax: null,
    features: [],
    minAvailability: 0,
    access: null,
    sortBy: 'distance',
  },
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    setSelectedParking: (state, action) => {
      state.selectedParking = action.payload;
    },
    clearSelectedParking: (state) => {
      state.selectedParking = null;
    },
    setSearchLocation: (state, action) => {
      state.searchLocation = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredSpots = state.parkingSpots;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search parking
      .addCase(searchParking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchParking.fulfilled, (state, action) => {
        state.loading = false;
        state.parkingSpots = action.payload;
        state.filteredSpots = action.payload;
      })
      .addCase(searchParking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search by address
      .addCase(searchByAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchByAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.parkingSpots = action.payload;
        state.filteredSpots = action.payload;
      })
      .addCase(searchByAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Filter parking
      .addCase(filterParking.pending, (state) => {
        state.loading = true;
      })
      .addCase(filterParking.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredSpots = action.payload;
      })
      .addCase(filterParking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedParking,
  clearSelectedParking,
  setSearchLocation,
  setFilters,
  clearFilters,
  clearError,
} = parkingSlice.actions;

export default parkingSlice.reducer;
