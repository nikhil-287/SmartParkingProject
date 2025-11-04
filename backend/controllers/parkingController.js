const geoapifyService = require('../services/geoapifyService');

class ParkingController {
  /**
   * Search parking by coordinates
   * GET /api/parking/search?lat=37.3352&lon=-121.8811&radius=5000&limit=20
   */
  async searchByCoordinates(req, res) {
    try {
      const { lat, lon, radius, limit } = req.query;

      if (!lat || !lon) {
        return res.status(400).json({
          error: 'Missing required parameters: lat and lon',
        });
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const searchRadius = radius ? parseInt(radius) : 5000;
      const resultLimit = limit ? parseInt(limit) : 20;

      const results = await geoapifyService.searchParking(
        latitude,
        longitude,
        searchRadius,
        resultLimit
      );

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
