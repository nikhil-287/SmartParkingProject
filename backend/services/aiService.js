const OpenAI = require('openai');
const config = require('../config/config');

class AIService {
  constructor() {
    this.openai = config.openaiApiKey ? new OpenAI({
      apiKey: config.openaiApiKey,
    }) : null;
  }

  /**
   * Parse natural language query into structured search parameters
   * @param {string} query - User's natural language query
   */
  async parseQuery(query) {
    if (!this.openai) {
      console.warn('⚠️  OpenAI not configured, using fallback parser');
      return this.fallbackParser(query);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a parking search assistant. Parse user queries into structured JSON.
            Extract: location (address/place), price preference (cheap/moderate/expensive), 
            features (overnight, safe/secure, covered, EV charging, disabled access),
            distance preference, and any other constraints.
            
            Return ONLY valid JSON in this format:
            {
              "location": "string or null",
              "pricePreference": "cheap|moderate|expensive|any",
              "features": ["feature1", "feature2"],
              "maxDistance": number in meters or null,
              "sortBy": "price|distance|availability|safety",
              "limit": number (default 20)
            }`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const parsed = JSON.parse(completion.choices[0].message.content);
      return this.validateParsedQuery(parsed);
    } catch (error) {
      console.error('AI parsing error:', error.message);
      return this.fallbackParser(query);
    }
  }

  /**
   * Fallback parser when OpenAI is not available
   */
  fallbackParser(query) {
    const lowerQuery = query.toLowerCase();
    
    const parsed = {
      location: null,
      pricePreference: 'any',
      features: [],
      maxDistance: 5000,
      sortBy: 'distance',
      limit: 20,
    };

    // Extract location
    const locationPatterns = [
      /near\s+(.+?)(?:\s|$)/i,
      /around\s+(.+?)(?:\s|$)/i,
      /at\s+(.+?)(?:\s|$)/i,
      /in\s+(.+?)(?:\s|$)/i,
    ];
    
    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match) {
        parsed.location = match[1].trim();
        break;
      }
    }

    // Price preferences
    if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable')) {
      parsed.pricePreference = 'cheap';
      parsed.sortBy = 'price';
    } else if (lowerQuery.includes('expensive') || lowerQuery.includes('premium')) {
      parsed.pricePreference = 'expensive';
    }

    // Features
    if (lowerQuery.includes('overnight') || lowerQuery.includes('24 hour')) {
      parsed.features.push('overnight');
    }
    if (lowerQuery.includes('safe') || lowerQuery.includes('secure')) {
      parsed.features.push('safe');
      parsed.sortBy = 'safety';
    }
    if (lowerQuery.includes('covered') || lowerQuery.includes('garage')) {
      parsed.features.push('covered');
    }
    if (lowerQuery.includes('ev') || lowerQuery.includes('electric')) {
      parsed.features.push('ev_charging');
    }
    if (lowerQuery.includes('disabled') || lowerQuery.includes('accessible')) {
      parsed.features.push('disabled_access');
    }

    // Limit/count
    const limitMatch = query.match(/top\s+(\d+)/i);
    if (limitMatch) {
      parsed.limit = parseInt(limitMatch[1]);
    }

    return parsed;
  }

  /**
   * Validate and normalize parsed query
   */
  validateParsedQuery(parsed) {
    return {
      location: parsed.location || null,
      pricePreference: ['cheap', 'moderate', 'expensive', 'any'].includes(parsed.pricePreference) 
        ? parsed.pricePreference : 'any',
      features: Array.isArray(parsed.features) ? parsed.features : [],
      maxDistance: typeof parsed.maxDistance === 'number' ? parsed.maxDistance : 5000,
      sortBy: ['price', 'distance', 'availability', 'safety'].includes(parsed.sortBy) 
        ? parsed.sortBy : 'distance',
      limit: typeof parsed.limit === 'number' && parsed.limit > 0 ? Math.min(parsed.limit, 50) : 20,
    };
  }

  /**
   * Generate AI response message
   */
  async generateResponse(query, results) {
    if (!this.openai || results.length === 0) {
      return this.fallbackResponse(results);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful parking assistant. Provide brief, friendly summaries of parking search results.',
          },
          {
            role: 'user',
            content: `User asked: "${query}"\nFound ${results.length} parking spots. Summarize the top options briefly.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      return this.fallbackResponse(results);
    }
  }

  fallbackResponse(results) {
    if (results.length === 0) {
      return "I couldn't find any parking spots matching your criteria. Try adjusting your search.";
    }
    
    return `I found ${results.length} parking spot${results.length > 1 ? 's' : ''} for you. Check the map to see locations and details.`;
  }
}

module.exports = new AIService();
