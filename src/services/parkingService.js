import axios from 'axios';
import { BACKEND_URL } from '../constants/config';

const API_URL = `${BACKEND_URL}/api/parking`;

class ParkingService {
  /**
   * Search parking by coordinates
   */
  async searchByCoordinates(latitude, longitude, radius = 5000, limit = 20) {
    try {
      const url = `${API_URL}/search`;
      const params = { lat: latitude, lon: longitude, radius, limit };
      console.log('Parking search request:', url, params);
      const response = await axios.get(url, { params });
      return this.mapBackendData(response.data.data);
    } catch (error) {
      console.error('Parking search error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search parking');
    }
  }

  /**
   * Search parking by bounding box (Geoapify format)
   * @param {Array} bbox - [lon1, lat1, lon2, lat2]
   * @param {number} limit - Maximum results
   */
  async searchByBbox(bbox, limit = 20) {
    try {
      const bboxString = bbox.join(',');
      const url = `${API_URL}/search`;
      const params = { bbox: bboxString, limit };
      console.log('Parking bbox search request:', url, params);
      const response = await axios.get(url, { params });
      return this.mapBackendData(response.data.data);
    } catch (error) {
      console.error('Bbox search error:', error);
      throw new Error(error.response?.data?.message || 'Failed to search by bounding box');
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
      return {
        results: this.mapBackendData(response.data.data),
        coordinates: response.data.coordinates // Include geocoded coordinates
      };
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
      return this.mapBackendData(response.data.data);
    } catch (error) {
      console.error('Filter error:', error);
      throw new Error(error.response?.data?.message || 'Failed to filter parking');
    }
  }

  /**
   * Search parking for a map region
   * @param {Object} region - Map region with latitude, longitude, latitudeDelta, longitudeDelta
   * @param {number} limit - Maximum results
   */
  async searchByRegion(region, limit = 20) {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    
    // Convert region to bounding box
    const bbox = [
      longitude - longitudeDelta / 2, // lon1 (west)
      latitude - latitudeDelta / 2,   // lat1 (south)
      longitude + longitudeDelta / 2, // lon2 (east)
      latitude + latitudeDelta / 2    // lat2 (north)
    ];
    
    return this.searchByBbox(bbox, limit);
  }

  /**
   * Map backend data structure to frontend expected format
   */
  mapBackendData(backendData) {
    if (!Array.isArray(backendData)) {
      return [];
    }

    return backendData.map((item) => ({
      id: item.id,
      name: item.name,
      address: item.address,
      coordinates: {
        latitude: item.coordinates.latitude,
        longitude: item.coordinates.longitude,
      },
      // Map availability field (backend uses different field names)
      availability: item.availability || (item.availableSpots && item.capacity ? Math.round((item.availableSpots / item.capacity) * 100) : 0),
      // Keep raw availableSpots so DetailsScreen can show the exact number
      availableSpots: item.availableSpots || item.available || 0,
      capacity: item.capacity || 0,
      // Ensure pricing structure is consistent
      pricing: {
        hourly: parseFloat(item.pricing?.hourly || 0),
        daily: parseFloat(item.pricing?.daily || 0), 
        monthly: parseFloat(item.pricing?.monthly || 0),
        currency: item.pricing?.currency || 'USD',
      },
      // Map features using the keys the UI expects (also preserve common variants)
      features: {
        covered: item.features?.covered || false,
        security: item.features?.security || false,
        ev_charging: item.features?.ev_charging || item.features?.evCharging || false,
        disabled_access: item.features?.disabled_access || item.features?.disabledAccess || false,
        '24hour': item.features?.['24hour'] || false,
        bike_parking: item.features?.bike_parking || item.features?.bikePark || false,
      },
      safetyRating: {
        score: parseFloat(item.safetyRating?.score || 3.5),
        reviews: item.safetyRating?.reviews || 0,
        lighting: item.safetyRating?.lighting || false,
        security_cameras: item.safetyRating?.security_cameras || item.safetyRating?.cameras || false,
        security_patrol: item.safetyRating?.security_patrol || item.safetyRating?.patrol || false,
      },
      type: item.type || 'surface',
      access: item.access || 'public',
      distance: parseFloat(item.distance || 0),
      fee: item.fee !== false,
    }));
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
