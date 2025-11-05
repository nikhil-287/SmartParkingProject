import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { PARKING_FEATURES, SORT_OPTIONS, PRICE_RANGES } from '../constants/config';

const FilterPanel = ({ visible, onClose, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const toggleFeature = (feature) => {
    const features = localFilters.features || [];
    const newFeatures = features.includes(feature)
      ? features.filter((f) => f !== feature)
      : [...features, feature];
    setLocalFilters({ ...localFilters, features: newFeatures });
  };

  const selectPriceRange = (range) => {
    setLocalFilters({ ...localFilters, priceMax: range.max });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      priceMax: null,
      features: [],
      minAvailability: 0,
      access: null,
      sortBy: 'distance',
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(PRICE_RANGES).map(([key, range]) => {
                  const isSelected = localFilters.priceMax === range.max;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => selectPriceRange(range)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {range.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresGrid}>
                {PARKING_FEATURES.map((feature) => {
                  const isSelected = (localFilters.features || []).includes(feature.key);
                  return (
                    <TouchableOpacity
                      key={feature.key}
                      style={[styles.featureButton, isSelected && styles.featureButtonSelected]}
                      onPress={() => toggleFeature(feature.key)}
                    >
                      <Ionicons
                        name={feature.icon}
                        size={20}
                        color={isSelected ? colors.background : colors.primary}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          isSelected && styles.featureTextSelected,
                        ]}
                      >
                        {feature.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = localFilters.sortBy === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.sortOption, isSelected && styles.sortOptionSelected]}
                      onPress={() =>
                        setLocalFilters({ ...localFilters, sortBy: option.value })
                      }
                    >
                      <View
                        style={[styles.radio, isSelected && styles.radioSelected]}
                      >
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.sortText, isSelected && styles.sortTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xlarge,
    borderTopRightRadius: borderRadius.xlarge,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: spacing.large,
  },
  section: {
    marginBottom: spacing.xlarge,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  chip: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.large,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.background,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  featureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tiny,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  featureButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  featureTextSelected: {
    color: colors.background,
  },
  sortOptions: {
    gap: spacing.small,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.backgroundSecondary,
  },
  sortOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  sortText: {
    fontSize: 15,
    color: colors.text,
  },
  sortTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.medium,
    padding: spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 2,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});

export default FilterPanel;
