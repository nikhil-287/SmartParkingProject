const aiService = require('../services/aiService');
const geoapifyService = require('../services/geoapifyService');

class AIController {
  /**
   * Parse natural language query
   * POST /api/ai/query
   * Body: { query: "Find me the cheapest parking near SJSU" }
   */
  async processQuery(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({
          error: 'Missing required parameter: query',
        });
      }

      // Parse the query using AI
      const parsed = await aiService.parseQuery(query);

      // Search for parking based on parsed parameters
      let results = [];
      
      if (parsed.location) {
        results = await geoapifyService.searchByAddress(parsed.location, parsed.limit);
      } else {
        // Default to San Jose area
        results = await geoapifyService.searchParking(37.3352, -121.8811, parsed.maxDistance, parsed.limit);
      }

      // Apply filters based on AI parsed preferences
      results = this.applyFilters(results, parsed);

      // Sort results
      results = this.sortResults(results, parsed.sortBy);

      // Generate AI response
      const aiResponse = await aiService.generateResponse(query, results);

      res.json({
        success: true,
        query: query,
        parsed: parsed,
        aiResponse: aiResponse,
        count: results.length,
        data: results,
      });
    } catch (error) {
      console.error('AI query error:', error);
      res.status(500).json({
        error: 'Failed to process AI query',
        message: error.message,
      });
    }
  }

  /**
   * Apply filters based on parsed query
   */
  applyFilters(results, parsed) {
    let filtered = [...results];

    // Price preference filter
    if (parsed.pricePreference !== 'any') {
      filtered = filtered.filter(p => {
        const hourlyRate = p.pricing.hourly;
        if (parsed.pricePreference === 'cheap') return hourlyRate <= 3;
        if (parsed.pricePreference === 'moderate') return hourlyRate > 3 && hourlyRate <= 6;
        if (parsed.pricePreference === 'expensive') return hourlyRate > 6;
        return true;
      });
    }

    // Features filter
    if (parsed.features && parsed.features.length > 0) {
      filtered = filtered.filter(p => {
        return parsed.features.every(feature => {
          if (feature === 'safe' || feature === 'secure') {
            return p.safetyRating.score >= 4.0;
          }
          if (feature === 'overnight') {
            return p.access === 'public' || p.access === 'permissive';
          }
          return p.features[feature];
        });
      });
    }

    return filtered;
  }

  /**
   * Sort results
   */
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

  /**
   * Get AI suggestions
   * GET /api/ai/suggestions
   */
  async getSuggestions(req, res) {
    try {
      const suggestions = [
        "Find me the cheapest parking near SJSU",
        "Where can I park overnight near the library?",
        "Find the safest parking near me",
        "Show me covered parking with EV charging",
        "Find parking with disabled access near downtown",
        "Give me the top 5 parking spots around San Jose",
      ];

      res.json({
        success: true,
        suggestions: suggestions,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get suggestions',
        message: error.message,
      });
    }
  }
}

module.exports = new AIController();
