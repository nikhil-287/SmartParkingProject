import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { colors, spacing } from '../constants/theme';
import { DEFAULT_LOCATION, MAP_SETTINGS } from '../constants/config';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ParkingCard from '../components/ParkingCard';
import { searchParking, searchByAddress, searchByBbox, setSelectedParking } from '../store/slices/parkingSlice';
import { addFavorite, removeFavorite, setUserLocation, addRecentSearch } from '../store/slices/userSlice';
import locationService from '../services/locationService';
import parkingService from '../services/parkingService';

const MapScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { parkingSpots, filteredSpots, selectedParking, loading, searchLocation } = useSelector((state) => state.parking);
  const { favorites, recentSearches, userLocation } = useSelector((state) => state.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState(DEFAULT_LOCATION);
  const [filterVisible, setFilterVisible] = useState(false);
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    performInitialSearch();
  }, []);

  // Animate map to searched location
  useEffect(() => {
    console.log('🗺️ searchLocation changed:', searchLocation);
    console.log('🗺️ mapRef available:', !!mapRef);
    
    if (searchLocation && mapRef) {
      const newRegion = {
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      console.log('🎯 Animating map to:', newRegion);
      setRegion(newRegion);
      mapRef.animateToRegion(newRegion, 1000);
    }
  }, [searchLocation, mapRef]);

  const getCurrentLocation = async () => {
    const location = await locationService.getCurrentLocation();
    dispatch(setUserLocation(location));
    setRegion({
      ...location,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const performInitialSearch = async () => {
    const location = await locationService.getCurrentLocation();
    const region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    searchParkingByRegion(region);
  };

  const searchParkingByRegion = (region) => {
    // Calculate bounding box from map region
    const bbox = [
      region.longitude - region.longitudeDelta / 2, // lon1 (west)
      region.latitude - region.latitudeDelta / 2,   // lat1 (south)
      region.longitude + region.longitudeDelta / 2, // lon2 (east)
      region.latitude + region.latitudeDelta / 2    // lat2 (north)
    ];
    
    console.log('📍 Map region bbox:', bbox);
    dispatch(searchByBbox({ bbox, limit: 20 }));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Enter Location', 'Please enter a location to search');
      return;
    }
    
    console.log('🔍 Searching for address:', searchQuery);
    dispatch(addRecentSearch(searchQuery));
    dispatch(searchByAddress({ address: searchQuery, limit: 20 }));
  };

  const handleMyLocation = async () => {
    const location = await locationService.getCurrentLocation();
    const newRegion = {
      ...location,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    setRegion(newRegion);
    mapRef?.animateToRegion(newRegion);
    searchParkingByRegion(newRegion);
  };

  const handleMarkerPress = (parking) => {
    dispatch(setSelectedParking(parking));
    mapRef?.animateToRegion({
      latitude: parking.coordinates.latitude,
      longitude: parking.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleCardPress = () => {
    navigation?.navigate('Details', { parking: selectedParking });
  };

  const handleFavorite = (parking) => {
    const isFav = favorites.some((f) => f.id === parking.id);
    if (isFav) {
      dispatch(removeFavorite(parking.id));
    } else {
      dispatch(addFavorite(parking));
    }
  };

  const getMarkerColor = (availability) => {
    if (availability >= 70) return colors.mapMarkerAvailable;
    if (availability >= 30) return colors.mapMarkerLimited;
    return colors.mapMarkerFull;
  };

  const displayedSpots = filteredSpots.length > 0 ? filteredSpots : parkingSpots;
  
  // Add distance to spots
  const spotsWithDistance = userLocation 
    ? parkingService.addDistanceToResults(displayedSpots, userLocation.latitude, userLocation.longitude)
    : displayedSpots;

  // Handle map region change to search visible area
  const handleRegionChangeComplete = (newRegion) => {
    // Update region state
    setRegion(newRegion);
    // Search parking in the new visible area
    searchParkingByRegion(newRegion);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MapView
        ref={setMapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {spotsWithDistance.map((parking) => (
          <Marker
            key={parking.id}
            coordinate={{
              latitude: parking.coordinates.latitude,
              longitude: parking.coordinates.longitude,
            }}
            onPress={() => handleMarkerPress(parking)}
            pinColor={getMarkerColor(parking.availability)}
          >
            <View style={[
              styles.marker,
              selectedParking?.id === parking.id && styles.markerSelected,
              { backgroundColor: getMarkerColor(parking.availability) }
            ]}>
              <Ionicons name="car" size={16} color={colors.background} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.topControls}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onClear={() => setSearchQuery('')}
          placeholder="Search location..."
          recentSearches={recentSearches}
          onSelectRecent={(query) => {
            setSearchQuery(query);
            dispatch(searchByAddress({ address: query, limit: 20 }));
          }}
          showRecent={true}
        />

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setFilterVisible(true)}>
            <Ionicons name="options" size={24} color={colors.text} />
            {filteredSpots.length !== parkingSpots.length && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filteredSpots.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleMyLocation}>
            <Ionicons name="locate" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {selectedParking && (
        <View style={styles.cardContainer}>
          <ParkingCard
            parking={selectedParking}
            onPress={handleCardPress}
            onFavorite={() => handleFavorite(selectedParking)}
            isFavorite={favorites.some((f) => f.id === selectedParking.id)}
          />
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding parking spots...</Text>
        </View>
      )}

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={{}}
        onApplyFilters={(filters) => {
          // Apply filters logic would go here
          console.log('Filters applied:', filters);
        }}
      />

      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          Found {spotsWithDistance.length} parking spots
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: spacing.large,
    left: 0,
    right: 0,
    paddingTop: spacing.large,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.small,
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
  },
  iconButton: {
    backgroundColor: colors.background,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelected: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
  },
  cardContainer: {
    position: 'absolute',
    bottom: spacing.large,
    left: 0,
    right: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: colors.background,
    padding: spacing.large,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    marginTop: spacing.small,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  resultsBar: {
    position: 'absolute',
    bottom: spacing.small,
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resultsText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MapScreen;
