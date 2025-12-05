import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/api';

export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (userId, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/api/bookings/user/${userId}`;
      console.log('🔄 Fetching bookings from:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Bookings fetched:', data);
      return data.bookings || data;
    } catch (err) {
      console.error('🚨 Fetch bookings error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/api/bookings/create`;
      console.log('🔄 Creating booking at:', url);
      console.log('📦 Booking data:', bookingData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to create booking: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Booking created:', data);
      return data.booking;
    } catch (err) {
      console.error('🚨 Create booking error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/api/bookings/${bookingId}/cancel`;
      console.log('🔄 Canceling booking at:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to cancel booking: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Booking cancelled:', data);
      return data.booking;
    } catch (err) {
      console.error('🚨 Cancel booking error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const completeBooking = createAsyncThunk(
  'booking/completeBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/api/bookings/${bookingId}/complete`;
      console.log('🔄 Completing booking at:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to complete booking: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Booking completed:', data);
      return data.booking;
    } catch (err) {
      console.error('🚨 Complete booking error:', err.message);
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  bookings: [],
  upcoming: [],
  history: [],
  loading: false,
  error: null,
  currentBooking: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchUserBookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.all || action.payload;
        state.upcoming = action.payload.upcoming || [];
        state.history = action.payload.history || [];
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createBooking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
        state.upcoming.push(action.payload);
        state.currentBooking = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // cancelBooking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
          const upcomingIndex = state.upcoming.findIndex(
            (b) => b.id === action.payload.id
          );
          if (upcomingIndex !== -1) {
            state.upcoming.splice(upcomingIndex, 1);
          }
          state.history.push(action.payload);
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // completeBooking
    builder
      .addCase(completeBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
          const upcomingIndex = state.upcoming.findIndex(
            (b) => b.id === action.payload.id
          );
          if (upcomingIndex !== -1) {
            state.upcoming.splice(upcomingIndex, 1);
          }
          state.history.push(action.payload);
        }
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingError, setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
