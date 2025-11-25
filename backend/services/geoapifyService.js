const axios = require('axios');
const config = require('../config/config');
const mockParkingData = require('../utils/mockData');

class GeoapifyService {
  constructor() {
    this.apiKey = config.geoapifyApiKey;
    this.baseUrl = 'https://api.geoapify.com/v2/places';
  }

  /**
   * Search for parking near coordinates using bounding box
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} radius - Search radius in meters (default: 5000)
   * @param {number} limit - Max results (default: 20)
   */
  async searchParking(lat, lon, radius = 5000, limit = 20) {
    try {
      // Calculate bounding box from center point and radius
      // 1 degree ≈ 111,320 meters at equator
      const radiusInDegrees = radius / 111320;
      
      // Create bounding box: lon1,lat1,lon2,lat2
      const bbox = [
        lon - radiusInDegrees, // lon1 (west)
        lat - radiusInDegrees, // lat1 (south)  
        lon + radiusInDegrees, // lon2 (east)
        lat + radiusInDegrees  // lat2 (north)
      ];

      return await this.searchParkingByBbox(bbox, limit);
    } catch (error) {
      console.warn('⚠️  Geoapify API error, using mock data:', error.message);
      return this.formatParkingData(mockParkingData);
    }
  }

  /**
   * Search parking using bounding box (Geoapify format)
   * @param {Array} bbox - [lon1, lat1, lon2, lat2]
   * @param {number} limit - Max results
   */
  async searchParkingByBbox(bbox, limit = 20) {
    try {
      const [lon1, lat1, lon2, lat2] = bbox;
      const rectFilter = `rect:${lon1},${lat1},${lon2},${lat2}`;

      console.log('🔍 Searching parking with filter:', rectFilter);

      const response = await axios.get(this.baseUrl, {
        params: {
          categories: 'parking.cars',
          filter: rectFilter,
          limit: limit,
          apiKey: this.apiKey,
        },
        timeout: 10000,
      });

      console.log('✅ Geoapify response:', response.data.features?.length, 'results');
      return this.formatParkingData(response.data.features || []);
    } catch (error) {
      console.warn('⚠️  Geoapify API error, using mock data:', error.message);
      const centerLat = (bbox[1] + bbox[3]) / 2;
      const centerLon = (bbox[0] + bbox[2]) / 2;
      return this.formatParkingData(mockParkingData);
    }
  }

  /**
   * Search parking by address or place name
   */
  async searchByAddress(address, limit = 20) {
    try {
      // First geocode the address
      const geocodeUrl = 'https://api.geoapify.com/v1/geocode/search';
      const geocodeResponse = await axios.get(geocodeUrl, {
        params: {
          text: address,
          apiKey: this.apiKey,
        },
      });

      if (geocodeResponse.data.features.length === 0) {
        throw new Error('Address not found');
      }

      const { lat, lon } = geocodeResponse.data.features[0].properties;
      const parkingResults = await this.searchParking(lat, lon, 5000, limit);
      
      // Return both the coordinates and parking results
      return {
        coordinates: { latitude: lat, longitude: lon },
        results: parkingResults
      };
    } catch (error) {
      console.warn('⚠️  Address search error, using mock data:', error.message);
      return {
        coordinates: null,
        results: this.formatParkingData(mockParkingData)
      };
    }
  }

  /**
   * Format and enrich parking data
   */
  formatParkingData(features) {
    return features.map((feature, index) => {
      const props = feature.properties;
      const parking = props.parking || {};
      
      // Generate mock pricing if not available
      const price = this.generateMockPrice(parking);
      
      // Generate safety rating (mock)
      const safetyRating = this.generateSafetyRating();
      
      // Calculate availability (mock real-time data)
      const availability = this.generateAvailability(parking.capacity);

      return {
        id: props.place_id || `parking_${index}`,
        name: props.name || 'Parking Area',
        address: props.formatted || props.address_line1 || 'Address not available',
        coordinates: {
          latitude: props.lat || feature.geometry.coordinates[1],
          longitude: props.lon || feature.geometry.coordinates[0],
        },
        type: parking.type || 'surface',
        capacity: parking.capacity || 50,
        availableSpots: availability.available,
        availability: availability.percentage,
        pricing: price,
        features: {
          covered: parking.type === 'multi-storey' || parking.type === 'underground',
          security: parking.type === 'multi-storey',
          ev_charging: Math.random() > 0.7,
          disabled_access: parking.capacity_details?.disabled > 0 || Math.random() > 0.5,
          bike_parking: parking.capacity_details?.bike_rack > 0 || Math.random() > 0.6,
        },
        access: parking.access || props.restrictions?.access || 'public',
        fee: parking.fee !== false,
        safetyRating: safetyRating,
        distance: null, // Will be calculated on frontend
      };
    });
  }

  generateMockPrice(parking) {
    if (parking.fee === false) {
      return { hourly: 0, daily: 0, monthly: 0, currency: 'USD' };
    }

    const basePrice = parking.type === 'multi-storey' ? 3 : parking.type === 'underground' ? 4 : 2;
    
    return {
      hourly: basePrice + Math.random() * 2,
      daily: (basePrice + Math.random() * 2) * 8,
      monthly: (basePrice + Math.random() * 2) * 160,
      currency: 'USD',
    };
  }

  generateSafetyRating() {
    return {
      score: 3.5 + Math.random() * 1.5, // 3.5 to 5.0
      lighting: Math.random() > 0.3,
      security_cameras: Math.random() > 0.4,
      security_patrol: Math.random() > 0.6,
    };
  }

  generateAvailability(capacity = 50) {
    const occupied = Math.floor(Math.random() * capacity);
    const available = capacity - occupied;
    
    return {
      available: available,
      occupied: occupied,
      percentage: Math.round((available / capacity) * 100),
    };
  }
}

module.exports = new GeoapifyService();
