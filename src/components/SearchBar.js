import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';

const SearchBar = ({ 
  value, 
  onChangeText, 
  onSearch, 
  onClear,
  placeholder = 'Search parking...',
  recentSearches = [],
  onSelectRecent,
  showRecent = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onClear();
    onChangeText('');
  };

  const showRecentSearches = isFocused && showRecent && recentSearches.length > 0 && !value;

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          returnKeyType="search"
        />

        {value ? (
          <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity onPress={onSearch} style={styles.searchButton}>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      {showRecentSearches && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `recent-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentItem}
                onPress={() => onSelectRecent(item)}
              >
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.recentText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.medium,
    marginVertical: spacing.small,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    gap: spacing.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.small,
  },
  iconButton: {
    padding: spacing.tiny,
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: spacing.small,
    borderRadius: borderRadius.round,
  },
  recentContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    marginTop: spacing.small,
    padding: spacing.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    textTransform: 'uppercase',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.small,
  },
  recentText: {
    fontSize: 15,
    color: colors.text,
  },
});

export default SearchBar;
