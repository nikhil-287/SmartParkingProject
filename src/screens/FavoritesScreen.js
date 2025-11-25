import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import ParkingCard from '../components/ParkingCard';
import { removeFavorite } from '../store/slices/userSlice';

const FavoritesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { favorites } = useSelector((state) => state.user);

  const handleCardPress = (parking) => {
    navigation.navigate('Details', { parking });
  };

  const handleRemoveFavorite = (parkingId) => {
    dispatch(removeFavorite(parkingId));
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyText}>
        Start adding your favorite parking spots to find them quickly later
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Map')}
      >
        <Ionicons name="search" size={20} color={colors.background} />
        <Text style={styles.exploreText}>Explore Parking</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.heartIcon}>
            <Ionicons name="heart" size={24} color={colors.error} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Favorites</Text>
            <Text style={styles.headerSubtitle}>
              {favorites.length} saved spot{favorites.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParkingCard
            parking={item}
            onPress={() => handleCardPress(item)}
            onFavorite={() => handleRemoveFavorite(item.id)}
            isFavorite={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.medium,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  heartIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.small,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.xxlarge,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.large,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.small,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xlarge,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xlarge,
    paddingVertical: spacing.medium,
    borderRadius: 24,
  },
  exploreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});

export default FavoritesScreen;
