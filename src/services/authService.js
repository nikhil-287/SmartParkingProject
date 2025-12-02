import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const API_URL = `${BACKEND_URL}/api/auth`;

class AuthService {
  async signInWithGoogle(idToken) {
    try {
      const response = await axios.post(`${API_URL}/google`, { idToken });
      return response.data;
    } catch (error) {
      console.error('Auth service error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to authenticate');
    }
  }

  async syncWithSupabase(accessToken) {
    try {
      const response = await axios.post(`${API_URL}/sync`, { accessToken });
      return response.data;
    } catch (error) {
      console.error('Sync error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to sync profile');
    }
  }
}

export default new AuthService();
