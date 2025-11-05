import * as Location from 'expo-location';

class LocationService {
  /**
   * Request location permissions
   */
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Location error:', error);
      // Return default location (San Jose, CA)
      return {
        latitude: 37.3352,
        longitude: -121.8811,
      };
    }
  }

  /**
   * Watch location changes
   */
  async watchLocation(callback) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 100, // Or every 100 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    } catch (error) {
      console.error('Watch location error:', error);
      return null;
    }
  }
}

export default new LocationService();
