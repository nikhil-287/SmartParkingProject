import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../constants/theme';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🅿️</Text>
        <Text style={styles.title}>Smart Parking Finder</Text>
        <Text style={styles.subtitle}>Your intelligent parking assistant</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Features</Text>
          <Text style={styles.feature}>🗺️  Real-time parking search & map view</Text>
          <Text style={styles.feature}>🤖  AI-powered natural language queries</Text>
          <Text style={styles.feature}>🔍  Advanced filtering (price, distance, features)</Text>
          <Text style={styles.feature}>⭐  Favorites & search history</Text>
          <Text style={styles.feature}>🛡️  Safety ratings & security info</Text>
          <Text style={styles.feature}>📴  Offline mode with cached data</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Getting Started</Text>
          <Text style={styles.info}>1. Start the backend server</Text>
          <Text style={styles.code}>cd backend && node server.js</Text>
          <Text style={styles.info}>2. Configure OpenAI API key in backend/.env</Text>
          <Text style={styles.info}>3. Build your UI components</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Project Structure</Text>
          <Text style={styles.info}>✅ Backend API (Node.js + Express)</Text>
          <Text style={styles.info}>✅ Redux Store (Parking, AI, User slices)</Text>
          <Text style={styles.info}>✅ Service Layer (API clients)</Text>
          <Text style={styles.info}>✅ Configuration & Constants</Text>
          <Text style={styles.info}>⏳ UI Components (Next step)</Text>
          <Text style={styles.info}>⏳ Screens & Navigation (Next step)</Text>
        </View>

        <View style={styles.statusBar}>
          <Text style={styles.statusText}>🟢 Backend Ready</Text>
          <Text style={styles.statusText}>🟢 Redux Configured</Text>
          <Text style={styles.statusText}>🟡 UI Pending</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.large,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.medium,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.xlarge,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.large,
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.medium,
  },
  feature: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.small,
    lineHeight: 24,
  },
  info: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.small,
    lineHeight: 22,
  },
  code: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#000',
    color: '#0f0',
    padding: spacing.small,
    borderRadius: 6,
    marginBottom: spacing.medium,
  },
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.medium,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginTop: spacing.large,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default HomeScreen;
