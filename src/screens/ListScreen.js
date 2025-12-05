import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import ParkingCard from '../components/ParkingCard';
import FilterPanel from '../components/FilterPanel';
import { searchParking, searchByAddress, searchByBbox, filterParking, setFilters } from '../store/slices/parkingSlice';
import { addFavorite, removeFavorite, addRecentSearch } from '../store/slices/userSlice';
import locationService from '../services/locationService';
import parkingService from '../services/parkingService';

const ListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { parkingSpots, filteredSpots, loading } = useSelector((state) => state.parking);
  const { favorites, recentSearches, userLocation } = useSelector((state) => state.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const location = await locationService.getCurrentLocation();
    
    // Calculate bounding box from current location with 5km radius
    const radiusInDegrees = 5000 / 111320; // 5000 meters to degrees
    const bbox = [
      location.longitude - radiusInDegrees, // lon1 (west)
      location.latitude - radiusInDegrees,  // lat1 (south)
      location.longitude + radiusInDegrees, // lon2 (east)
      location.latitude + radiusInDegrees   // lat2 (north)
    ];
    
    dispatch(searchByBbox({ bbox, limit: 20 }));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(addRecentSearch(searchQuery));
      dispatch(searchByAddress({ address: searchQuery, limit: 20 }));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCardPress = (parking) => {
    navigation.navigate('Details', { parking });
  };

  const handleFavorite = (parking) => {
    const isFav = favorites.some((f) => f.id === parking.id);
    if (isFav) {
      dispatch(removeFavorite(parking.id));
    } else {
      dispatch(addFavorite(parking));
    }
  };

  const displayedSpots = filteredSpots.length > 0 ? filteredSpots : parkingSpots;
  const spotsWithDistance = userLocation 
    ? parkingService.addDistanceToResults(displayedSpots, userLocation.latitude, userLocation.longitude)
    : displayedSpots;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={80} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Parking Found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or filters
      </Text>
      <TouchableOpacity style={styles.searchAgainButton} onPress={loadInitialData}>
        <Ionicons name="refresh" size={20} color={colors.background} />
        <Text style={styles.searchAgainText}>Search Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setFilterVisible(true)}
      >
        <Ionicons name="options-outline" size={20} color={colors.background} />
        <Text style={styles.filterButtonText}>Filters</Text>
        {filteredSpots.length !== parkingSpots.length && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{filteredSpots.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.sortInfo}>
        <Text style={styles.sortText}>
          {spotsWithDistance.length} spot{spotsWithDistance.length !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
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
      </View>

      <FlatList
        data={spotsWithDistance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            parking={item}
            onPress={() => handleCardPress(item)}
            onFavorite={() => handleFavorite(item)}
            isFavorite={favorites.some((f) => f.id === item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={{}}
        onApplyFilters={(filters) => {
          // Save filters to redux and apply them
          dispatch(setFilters(filters));
          dispatch(filterParking({ results: spotsWithDistance, filters }));
          setFilterVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  listContent: {
    paddingBottom: spacing.xlarge,
  },
  header: {
    backgroundColor: colors.background,
    paddingBottom: spacing.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 20,
  },
  filterButtonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: spacing.tiny,
  },
  filterBadgeText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  sortInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  sortText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxlarge * 2,
    paddingHorizontal: spacing.large,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.large,
    marginBottom: spacing.small,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  searchAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 24,
  },
  searchAgainText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListScreen;
