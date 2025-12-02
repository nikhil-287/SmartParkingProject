import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const API_URL = `${BACKEND_URL}/api/ai`;

// Generate unique session ID for conversation context
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

class AIService {
  constructor() {
    // Store current session ID for conversation context
    this.sessionId = null;
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = generateSessionId();
    }
    return this.sessionId;
  }

  /**
   * Reset session (start new conversation)
   */
  resetSession() {
    this.sessionId = generateSessionId();
    console.log('🔄 New conversation started:', this.sessionId);
    return this.sessionId;
  }

  /**
   * Process natural language query with chat history for context
   * @param {string} query - The user's query
   * @param {Array} chatHistory - Full chat history for context
   */
  async processQuery(query, chatHistory = []) {
    try {
      const response = await axios.post(`${API_URL}/query`, { 
        query,
        sessionId: this.getSessionId(), // Include session ID for context
        chatHistory // Pass full conversation history for context awareness
      });
      
      // Log the response type for debugging
      console.log('📨 Response type:', response.data.type);
      
      return response.data;
    } catch (error) {
      console.error('AI query error:', error);
      throw new Error(error.response?.data?.message || 'Failed to process AI query');
    }
  }

  /**
   * Get query suggestions
   */
  async getSuggestions() {
    try {
      const response = await axios.get(`${API_URL}/suggestions`);
      return response.data.suggestions;
    } catch (error) {
      console.error('Suggestions error:', error);
      return [
        "Find me the cheapest parking near SJSU",
        "Where can I park overnight near the library?",
        "Find the safest parking near me",
      ];
    }
  }
}

export default new AIService();
