import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const API_URL = `${BACKEND_URL}/api/parking`;

class ParkingService {
  /**
   * Search parking by coordinates
   */
  async searchByCoordinates(latitude, longitude, radius = 5000, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { lat: latitude, lon: longitude, radius, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Parking search error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search parking');
    }
  }

  /**
   * Search parking by address
   */
  async searchByAddress(address, limit = 20) {
    try {
      const response = await axios.get(`${API_URL}/search-by-address`, {
        params: { address, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Address search error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search by address');
    }
  }

  /**
   * Get parking details
   */
  async getParkingById(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Get parking error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get parking details');
    }
  }

  /**
   * Filter parking results
   */
  async filterParking(results, filters) {
    try {
      const response = await axios.post(`${API_URL}/filter`, {
        results,
        filters,
      });
      return response.data.data;
    } catch (error) {
      console.error('Filter error:', error);
      throw new Error(error.response?.data?.message || 'Failed to filter parking');
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Add distance to parking results
   */
  addDistanceToResults(results, userLat, userLon) {
    return results.map((parking) => ({
      ...parking,
      distance: this.calculateDistance(
        userLat,
        userLon,
        parking.coordinates.latitude,
        parking.coordinates.longitude
      ),
    }));
  }
}

export default new ParkingService();
