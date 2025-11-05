import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const API_URL = `${BACKEND_URL}/api/ai`;

class AIService {
  /**
   * Process natural language query
   */
  async processQuery(query) {
    try {
      const response = await axios.post(`${API_URL}/query`, { query });
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
