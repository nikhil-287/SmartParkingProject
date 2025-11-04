require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  geoapifyApiKey: process.env.GEOAPIFY_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
};
