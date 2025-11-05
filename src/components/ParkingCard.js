import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';

const ParkingCard = ({ parking, onPress, onFavorite, isFavorite }) => {
  const getAvailabilityColor = (availability) => {
    if (availability >= 70) return colors.success;
    if (availability >= 30) return colors.warning;
    return colors.error;
  };

  const getPriceLabel = (hourly) => {
    if (hourly === 0) return 'FREE';
    return `$${hourly.toFixed(2)}/hr`;
  };

  const availabilityColor = getAvailabilityColor(parking.availability);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {parking.name}
          </Text>
          <Text style={styles.distance}>
            {parking.distance ? `${parking.distance.toFixed(1)} km away` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={onFavorite} style={styles.favoriteButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.error : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.address} numberOfLines={2}>
        {parking.address}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="car" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            {parking.availableSpots}/{parking.capacity}
          </Text>
        </View>

        <View style={[styles.availabilityBadge, { backgroundColor: availabilityColor }]}>
          <Text style={styles.availabilityText}>{parking.availability}% Available</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{getPriceLabel(parking.pricing.hourly)}</Text>
          {parking.pricing.hourly > 0 && (
            <Text style={styles.dailyPrice}>
              ${parking.pricing.daily.toFixed(0)}/day
            </Text>
          )}
        </View>

        <View style={styles.features}>
          {parking.features.covered && (
            <Ionicons name="umbrella" size={16} color={colors.textSecondary} />
          )}
          {parking.features.ev_charging && (
            <Ionicons name="flash" size={16} color={colors.success} />
          )}
          {parking.features.security && (
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          )}
          {parking.features.disabled_access && (
            <Ionicons name="accessibility" size={16} color={colors.info} />
          )}
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={colors.warning} />
          <Text style={styles.rating}>{parking.safetyRating.score.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.large,
    padding: spacing.medium,
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.small,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  distance: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: spacing.tiny,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  availabilityBadge: {
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: borderRadius.medium,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  dailyPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  features: {
    flexDirection: 'row',
    gap: spacing.small,
    marginHorizontal: spacing.medium,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: borderRadius.small,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});

export default ParkingCard;
