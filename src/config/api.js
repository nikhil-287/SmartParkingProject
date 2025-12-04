// API Configuration
// Update this based on your environment

const API_BASE_URL = __DEV__ 
  ? 'http://url:3000' // Backend on same network (LAN)
  : 'https://your-production-api.com'; // Production URL

export { API_BASE_URL };
