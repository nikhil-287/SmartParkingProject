import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiService from '../../services/aiService';

// Async thunks
export const processAIQuery = createAsyncThunk(
  'ai/processQuery',
  async (query, { getState, rejectWithValue }) => {
    try {
      // Get current chat history from state to pass as context
      const state = getState();
      const chatHistory = state.ai.chatHistory;
      
      // Call service with both query and chat history
      const data = await aiService.processQuery(query, chatHistory);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'ai/getSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await aiService.getSuggestions();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  chatHistory: [],
  suggestions: [],
  loading: false,
  error: null,
  lastQuery: null,
  lastResponse: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    clearChat: (state) => {
      state.chatHistory = [];
      state.lastQuery = null;
      state.lastResponse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Process AI query
      .addCase(processAIQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processAIQuery.fulfilled, (state, action) => {
        state.loading = false;
        state.lastQuery = action.payload.query;
        state.lastResponse = action.payload.aiResponse;
        state.chatHistory.push({
          type: 'user',
          message: action.payload.query,
          timestamp: new Date().toISOString(),
        });
        state.chatHistory.push({
          type: 'ai',
          message: action.payload.aiResponse,
          timestamp: new Date().toISOString(),
          results: action.payload.data,
        });
      })
      .addCase(processAIQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get suggestions
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

export const { addMessage, clearChat, clearError } = aiSlice.actions;

export default aiSlice.reducer;
