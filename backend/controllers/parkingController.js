const geoapifyService = require('../services/geoapifyService');

class ParkingController {
  /**
   * Search parking by coordinates (bounding box)
   * GET /api/parking/search?lat=37.3352&lon=-121.8811&radius=5000&limit=20
   * OR
   * GET /api/parking/search?bbox=-121.96,-121.87,37.39,37.45&limit=20
   */
  async searchByCoordinates(req, res) {
    try {
      const { lat, lon, radius, bbox, limit } = req.query;
      console.log('🔍 Parking search request:', { lat, lon, radius, bbox, limit });

      let boundingBox;
      const resultLimit = limit ? parseInt(limit) : 20;

      if (bbox) {
        // Direct bounding box: lon1,lat1,lon2,lat2
        boundingBox = bbox.split(',').map(coord => parseFloat(coord));
        console.log('📦 Received bbox:', bbox);
        if (boundingBox.length !== 4) {
          return res.status(400).json({
        error: 'Invalid bbox format. Expected: lon1,lat1,lon2,lat2',
          });
        }
      } else if (lat && lon) {
        // Convert center point + radius to bounding box
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const searchRadius = radius ? parseInt(radius) : 5000;
        
        // Convert radius (meters) to degrees (approximate)
        const radiusInDegrees = searchRadius / 111320; // 1 degree ≈ 111,320 meters
        boundingBox = [
          longitude - radiusInDegrees, // lon1
          latitude - radiusInDegrees,  // lat1
          longitude + radiusInDegrees, // lon2
          latitude + radiusInDegrees   // lat2
        ];
      } else {
        return res.status(400).json({
          error: 'Missing required parameters: (lat and lon) or bbox',
        });
      }

      console.log('📍 Using bounding box:', boundingBox);
      const results = await geoapifyService.searchParkingByBbox(
        boundingBox,
        resultLimit
      );
      console.log('✅ Found', results.length, 'parking spots');

      res.json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        error: 'Failed to search parking',
        message: error.message,
      });
    }
  }

  /**
   * Search parking by address
   * GET /api/parking/search-by-address?address=SJSU San Jose&limit=20
   */
  async searchByAddress(req, res) {
    try {
      const { address, limit } = req.query;

      if (!address) {
        return res.status(400).json({
          error: 'Missing required parameter: address',
        });
      }

      const resultLimit = limit ? parseInt(limit) : 20;
      const results = await geoapifyService.searchByAddress(address, resultLimit);

      res.json({
        success: true,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error('Address search error:', error);
      res.status(500).json({
        error: 'Failed to search parking by address',
        message: error.message,
      });
    }
  }

  /**
   * Get parking details by ID
   * GET /api/parking/:id
   */
  async getParkingById(req, res) {
    try {
      const { id } = req.params;
      
      // For now, return mock detailed data
      // In production, this would fetch from database
      res.json({
        success: true,
        data: {
          id: id,
          name: 'Parking Location',
          address: '123 Example St, San Jose, CA',
          // ... full parking details
        },
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get parking details',
        message: error.message,
      });
    }
  }

  /**
   * Filter parking results
   * POST /api/parking/filter
   */
  async filterParking(req, res) {
    try {
      const { results, filters } = req.body;

      if (!results || !Array.isArray(results)) {
        return res.status(400).json({
          error: 'Invalid results array',
        });
      }

      let filtered = [...results];

      // Apply filters
      if (filters.priceMax) {
        filtered = filtered.filter(p => p.pricing.hourly <= filters.priceMax);
      }

      if (filters.features && filters.features.length > 0) {
        filtered = filtered.filter(p => {
          return filters.features.every(feature => p.features[feature]);
        });
      }

      if (filters.minAvailability) {
        filtered = filtered.filter(p => p.availability >= filters.minAvailability);
      }

      if (filters.access) {
        filtered = filtered.filter(p => p.access === filters.access);
      }

      // Sort results
      if (filters.sortBy) {
        filtered = this.sortResults(filtered, filters.sortBy);
      }

      res.json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to filter parking',
        message: error.message,
      });
    }
  }

  sortResults(results, sortBy) {
    switch (sortBy) {
      case 'price':
        return results.sort((a, b) => a.pricing.hourly - b.pricing.hourly);
      case 'availability':
        return results.sort((a, b) => b.availability - a.availability);
      case 'safety':
        return results.sort((a, b) => b.safetyRating.score - a.safetyRating.score);
      case 'distance':
        return results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      default:
        return results;
    }
  }
}

module.exports = new ParkingController();
