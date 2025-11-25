// API Configuration
export const BACKEND_URL = 'http://192.168.5.80:3000';

// Default search settings
export const DEFAULT_RADIUS = 5000; // meters
export const DEFAULT_LIMIT = 20;

// Default location (San Jose, CA - SJSU area)
export const DEFAULT_LOCATION = {
  latitude: 37.3352,
  longitude: -121.8811,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Map settings
export const MAP_SETTINGS = {
  initialRegion: DEFAULT_LOCATION,
  showsUserLocation: true,
  showsMyLocationButton: true,
  showsCompass: true,
  showsScale: true,
};

// Price ranges for filtering
export const PRICE_RANGES = {
  cheap: { min: 0, max: 3, label: 'Cheap ($0-$3/hr)' },
  moderate: { min: 3, max: 6, label: 'Moderate ($3-$6/hr)' },
  expensive: { min: 6, max: 999, label: 'Expensive ($6+/hr)' },
};

// Feature filters
export const PARKING_FEATURES = [
  { key: 'covered', label: 'Covered', icon: 'umbrella' },
  { key: 'security', label: 'Security', icon: 'shield' },
  { key: 'ev_charging', label: 'EV Charging', icon: 'flash' },
  { key: 'disabled_access', label: 'Accessible', icon: 'accessibility' },
  { key: 'bike_parking', label: 'Bike Parking', icon: 'bicycle' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'price', label: 'Price' },
  { value: 'availability', label: 'Availability' },
  { value: 'safety', label: 'Safety Rating' },
];
