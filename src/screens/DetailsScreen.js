import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { addFavorite, removeFavorite } from '../store/slices/userSlice';

const DetailsScreen = ({ route, navigation }) => {
  const { parking } = route.params;
  const dispatch = useDispatch();
  const { favorites } = useSelector((state) => state.user);
  
  const isFavorite = favorites.some((f) => f.id === parking.id);

  const handleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavorite(parking.id));
    } else {
      dispatch(addFavorite(parking));
    }
  };

  const openMaps = () => {
    const { latitude, longitude } = parking.coordinates;
    const label = encodeURIComponent(parking.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    Linking.openURL(url);
  };

  const getAvailabilityColor = (availability) => {
    if (availability >= 70) return colors.success;
    if (availability >= 30) return colors.warning;
    return colors.error;
  };

  const availabilityColor = getAvailabilityColor(parking.availability);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? colors.error : colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainInfo}>
          <Text style={styles.name}>{parking.name}</Text>
          <Text style={styles.address}>{parking.address}</Text>
          
          {parking.distance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.distanceText}>{parking.distance.toFixed(1)} km away</Text>
            </View>
          )}
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={[styles.availabilityBadge, { backgroundColor: availabilityColor }]}>
              <Text style={styles.availabilityText}>{parking.availability}%</Text>
            </View>
          </View>
          
          <View style={styles.capacityInfo}>
            <View style={styles.capacityItem}>
              <Text style={styles.capacityNumber}>{parking.availableSpots}</Text>
              <Text style={styles.capacityLabel}>Available</Text>
            </View>
            <View style={styles.capacityDivider} />
            <View style={styles.capacityItem}>
              <Text style={styles.capacityNumber}>{parking.capacity}</Text>
              <Text style={styles.capacityLabel}>Total Capacity</Text>
            </View>
          </View>
        </View>

        <View style={styles.pricingCard}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Hourly</Text>
              <Text style={styles.priceValue}>
                {parking.pricing.hourly === 0 ? 'FREE' : `$${parking.pricing.hourly.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Daily</Text>
              <Text style={styles.priceValue}>${parking.pricing.daily.toFixed(2)}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Monthly</Text>
              <Text style={styles.priceValue}>${parking.pricing.monthly.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.featuresList}>
            {parking.features.covered && (
              <View style={styles.featureItem}>
                <Ionicons name="umbrella" size={20} color={colors.primary} />
                <Text style={styles.featureText}>Covered Parking</Text>
              </View>
            )}
            {parking.features.security && (
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
                <Text style={styles.featureText}>24/7 Security</Text>
              </View>
            )}
            {parking.features.ev_charging && (
              <View style={styles.featureItem}>
                <Ionicons name="flash" size={20} color={colors.warning} />
                <Text style={styles.featureText}>EV Charging Station</Text>
              </View>
            )}
            {parking.features.disabled_access && (
              <View style={styles.featureItem}>
                <Ionicons name="accessibility" size={20} color={colors.info} />
                <Text style={styles.featureText}>Wheelchair Accessible</Text>
              </View>
            )}
            {parking.features.bike_parking && (
              <View style={styles.featureItem}>
                <Ionicons name="bicycle" size={20} color={colors.secondary} />
                <Text style={styles.featureText}>Bike Parking</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.safetyCard}>
          <Text style={styles.sectionTitle}>Safety Rating</Text>
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= parking.safetyRating.score ? 'star' : 'star-outline'}
                  size={24}
                  color={colors.warning}
                />
              ))}
            </View>
            <Text style={styles.ratingScore}>{parking.safetyRating.score.toFixed(1)}</Text>
          </View>
          
          <View style={styles.safetyFeatures}>
            {parking.safetyRating.lighting && (
              <View style={styles.safetyItem}>
                <Ionicons name="sunny" size={18} color={colors.warning} />
                <Text style={styles.safetyText}>Well Lit</Text>
              </View>
            )}
            {parking.safetyRating.security_cameras && (
              <View style={styles.safetyItem}>
                <Ionicons name="videocam" size={18} color={colors.error} />
                <Text style={styles.safetyText}>CCTV Cameras</Text>
              </View>
            )}
            {parking.safetyRating.security_patrol && (
              <View style={styles.safetyItem}>
                <Ionicons name="eye" size={18} color={colors.primary} />
                <Text style={styles.safetyText}>Security Patrol</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Parking Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{parking.type.replace('-', ' ')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Access:</Text>
            <Text style={styles.infoValue}>{parking.access}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fee Required:</Text>
            <Text style={styles.infoValue}>{parking.fee ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate('Booking', {
              api_parking_id: parking.id,
              parking_name: parking.name,
              latitude: parking.coordinates.latitude,
              longitude: parking.coordinates.longitude,
              address: parking.address,
              price_per_hour: parking.pricing.hourly,
            })
          }
        >
          <Ionicons name="calendar" size={22} color={colors.background} />
          <Text style={styles.bookText}>Book a Spot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
          <Ionicons name="navigate" size={22} color={colors.background} />
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.medium,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: spacing.small,
  },
  favoriteButton: {
    padding: spacing.small,
  },
  content: {
    flex: 1,
  },
  mainInfo: {
    backgroundColor: colors.background,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.small,
  },
  address: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.small,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tiny,
    marginTop: spacing.small,
  },
  distanceText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  availabilityCard: {
    backgroundColor: colors.background,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  availabilityBadge: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.large,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityItem: {
    flex: 1,
    alignItems: 'center',
  },
  capacityNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.tiny,
  },
  capacityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  capacityDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  pricingCard: {
    backgroundColor: colors.background,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  priceGrid: {
    flexDirection: 'row',
    marginTop: spacing.medium,
    gap: spacing.small,
  },
  priceItem: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.tiny,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  featuresCard: {
    backgroundColor: colors.background,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  featuresList: {
    marginTop: spacing.medium,
    gap: spacing.medium,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
  },
  safetyCard: {
    backgroundColor: colors.background,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
    marginBottom: spacing.large,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.tiny,
  },
  ratingScore: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  safetyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.medium,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.medium,
  },
  safetyText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.background,
    padding: spacing.large,
    marginBottom: spacing.xlarge,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  footer: {
    padding: spacing.large,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.medium,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    backgroundColor: colors.success,
    padding: spacing.medium,
    borderRadius: borderRadius.large,
  },
  bookText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: borderRadius.large,
  },
  directionsText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
});

export default DetailsScreen;
