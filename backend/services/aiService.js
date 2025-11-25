const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

class AIService {
  constructor() {
    this.genAI = config.geminiApiKey ? new GoogleGenerativeAI(config.geminiApiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;
    // Store conversation contexts per session
    this.conversationContexts = new Map();
  }

  /**
   * Determine if query is a follow-up question or new search
   * @param {string} query - User's query
   * @param {Object} context - Previous conversation context
   */
  async classifyQuery(query, context = null) {
    if (!this.model || !context || !context.lastResults) {
      return { type: 'new_search', query };
    }

    try {
      const prompt = `Classify this user query as either:
1. "new_search" - User wants to find parking in a different location or completely new search
2. "follow_up" - User is asking questions about previously shown parking results
3. "refine" - User wants to filter/sort the same results differently

Previous search was: "${context.lastQuery || 'N/A'}"
Previous results: ${context.lastResults.length} parking spots shown

Current query: "${query}"

Return ONLY a JSON object:
{
  "type": "new_search|follow_up|refine",
  "reason": "brief explanation"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { type: 'new_search', query };
      }
      
      const classification = JSON.parse(jsonMatch[0]);
      return { type: classification.type, reason: classification.reason };
    } catch (error) {
      console.error('Query classification error:', error.message);
      // Default to new search if classification fails
      return { type: 'new_search', query };
    }
  }

  /**
   * Answer follow-up questions about existing results
   * @param {string} query - User's question
   * @param {Array} results - Current parking results
   * @param {Object} context - Conversation context
   */
  async answerFollowUpQuestion(query, results, context) {
    if (!this.model || results.length === 0) {
      return {
        answer: "I don't have any parking information to answer that question. Please search for parking first.",
        results: [],
        needsNewSearch: true
      };
    }

    try {
      // Prepare detailed results summary for AI
      const resultsSummary = results.slice(0, 10).map((spot, i) => {
        const features = [];
        if (spot.features.covered) features.push('covered');
        if (spot.features.ev_charging) features.push('EV charging');
        if (spot.features.disabled_access) features.push('wheelchair accessible');
        if (spot.features.security) features.push('24/7 security');
        
        return `${i + 1}. ${spot.name}
   - Address: ${spot.address}
   - Price: $${spot.pricing.hourly.toFixed(2)}/hr, $${spot.pricing.daily.toFixed(2)}/day
   - Availability: ${spot.availability}% (${spot.totalSpots - spot.occupiedSpots} free spots)
   - Safety: ${spot.safetyRating.score.toFixed(1)}/5.0 (${spot.safetyRating.description})
   - Features: ${features.length > 0 ? features.join(', ') : 'basic parking'}${spot.distance ? `\n   - Distance: ${spot.distance.toFixed(2)} km` : ''}`;
      }).join('\n\n');

      const prompt = `You are a parking assistant. The user previously searched for parking and now has a follow-up question about the results.

Previous query: "${context.lastQuery || 'parking search'}"

Available parking spots (${results.length} total):
${resultsSummary}

User's follow-up question: "${query}"

Instructions:
- Answer their question naturally and conversationally
- Reference specific parking spots by name when relevant
- Include prices, availability, safety ratings, or features as needed
- If asking about "which one" or "best", recommend 1-2 specific spots with reasons
- Be helpful and specific, not generic

Answer:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      // Check if we need to filter results based on the question
      const filteredResults = this.filterResultsBasedOnQuestion(query, results);

      return {
        answer,
        results: filteredResults.length > 0 ? filteredResults : results,
        needsNewSearch: false
      };
    } catch (error) {
      console.error('Follow-up answer error:', error.message);
      return {
        answer: "I had trouble understanding that question. Could you rephrase it?",
        results,
        needsNewSearch: false
      };
    }
  }

  /**
   * Filter results based on follow-up question
   */
  filterResultsBasedOnQuestion(query, results) {
    const lowerQuery = query.toLowerCase();
    
    // Cheapest
    if (lowerQuery.includes('cheap') || lowerQuery.includes('lowest price') || lowerQuery.includes('most affordable')) {
      return [...results].sort((a, b) => a.pricing.hourly - b.pricing.hourly).slice(0, 5);
    }
    
    // Most available
    if (lowerQuery.includes('most available') || lowerQuery.includes('empty') || lowerQuery.includes('most space')) {
      return [...results].sort((a, b) => b.availability - a.availability).slice(0, 5);
    }
    
    // Safest
    if (lowerQuery.includes('safe') || lowerQuery.includes('secure')) {
      return [...results].sort((a, b) => b.safetyRating.score - a.safetyRating.score).slice(0, 5);
    }
    
    // Closest
    if (lowerQuery.includes('closest') || lowerQuery.includes('nearest')) {
      return [...results].sort((a, b) => (a.distance || 999) - (b.distance || 999)).slice(0, 5);
    }
    
    // Covered
    if (lowerQuery.includes('covered') || lowerQuery.includes('garage') || lowerQuery.includes('indoor')) {
      return results.filter(p => p.features.covered);
    }
    
    // EV charging
    if (lowerQuery.includes('ev') || lowerQuery.includes('electric') || lowerQuery.includes('charg')) {
      return results.filter(p => p.features.ev_charging);
    }
    
    // Free parking
    if (lowerQuery.includes('free') || lowerQuery.includes('no cost')) {
      return results.filter(p => p.pricing.hourly === 0);
    }
    
    return results; // Return all if no specific filter matches
  }

  /**
   * Store conversation context
   */
  setConversationContext(sessionId, context) {
    this.conversationContexts.set(sessionId, {
      ...context,
      timestamp: Date.now()
    });
    
    // Clean up old contexts (older than 1 hour)
    this.cleanupOldContexts();
  }

  /**
   * Get conversation context
   */
  getConversationContext(sessionId) {
    return this.conversationContexts.get(sessionId) || null;
  }

  /**
   * Clean up old conversation contexts
   */
  cleanupOldContexts() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [sessionId, context] of this.conversationContexts.entries()) {
      if (context.timestamp < oneHourAgo) {
        this.conversationContexts.delete(sessionId);
      }
    }
  }

  /**
   * Parse natural language query into structured search parameters
   * @param {string} query - User's natural language query
   */
  async parseQuery(query) {
    if (!this.model) {
      console.warn('⚠️  Gemini not configured, using fallback parser');
      return this.fallbackParser(query);
    }

    try {
      const prompt = `You are a parking search assistant. Parse user queries into structured JSON.
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
}

User query: "${query}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response (Gemini sometimes adds markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
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
    if (!this.model || results.length === 0) {
      return this.fallbackResponse(results);
    }

    try {
      // Prepare detailed parking data for the AI
      const parkingSummary = results.slice(0, 10).map((spot, index) => {
        const features = [];
        if (spot.features.covered) features.push('covered');
        if (spot.features.ev_charging) features.push('EV charging');
        if (spot.features.disabled_access) features.push('wheelchair accessible');
        if (spot.features.security) features.push('24/7 security');
        
        return `${index + 1}. ${spot.name}
   - Location: ${spot.address}
   - Price: $${spot.pricing.hourly.toFixed(2)}/hr, $${spot.pricing.daily.toFixed(2)}/day
   - Availability: ${spot.availability}% available (${spot.totalSpots - spot.occupiedSpots}/${spot.totalSpots} spots free)
   - Safety Rating: ${spot.safetyRating.score.toFixed(1)}/5.0 (${spot.safetyRating.description})
   - Access: ${spot.access}
   - Features: ${features.length > 0 ? features.join(', ') : 'basic parking'}${spot.distance ? `\n   - Distance: ${spot.distance.toFixed(2)} km away` : ''}`;
      }).join('\n\n');

      const prompt = `You are a helpful parking assistant. Based on the parking data below, provide a conversational, friendly response to the user's query.

User asked: "${query}"

Found ${results.length} parking spots. Here are the details of the top options:

${parkingSummary}

Instructions:
- Give a natural, conversational response (3-4 sentences)
- Highlight the BEST option based on their query (cheapest, safest, most available, etc.)
- Mention 2-3 specific parking spots by name with key details
- If they asked about features (EV, covered, etc.), mention which spots have them
- Include prices and availability when relevant
- Be friendly and helpful, not robotic

Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Response generation error:', error.message);
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
