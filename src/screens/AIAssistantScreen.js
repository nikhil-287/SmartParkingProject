import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { processAIQuery, getSuggestions } from '../store/slices/aiSlice';
import ParkingCard from '../components/ParkingCard';
import { addFavorite, removeFavorite } from '../store/slices/userSlice';

const AIAssistantScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { chatHistory, suggestions, loading } = useSelector((state) => state.ai);
  const { favorites } = useSelector((state) => state.user);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    dispatch(getSuggestions());
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    dispatch(processAIQuery(inputText));
    setInputText('');
  };

  const handleSuggestionPress = (suggestion) => {
    dispatch(processAIQuery(suggestion));
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

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          {!isUser && (
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={16} color={colors.secondary} />
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.message}
          </Text>
        </View>
        
        {!isUser && item.results && item.results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Found {item.results.length} parking spots:</Text>
            {item.results.slice(0, 3).map((parking) => (
              <ParkingCard
                key={parking.id}
                parking={parking}
                onPress={() => handleCardPress(parking)}
                onFavorite={() => handleFavorite(parking)}
                isFavorite={favorites.some((f) => f.id === parking.id)}
              />
            ))}
            {item.results.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {item.results.length} results
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.welcomeIcon}>
        <Ionicons name="chatbubbles" size={64} color={colors.secondary} />
      </View>
      <Text style={styles.welcomeTitle}>AI Parking Assistant</Text>
      <Text style={styles.welcomeText}>
        Ask me anything about parking! Try questions like:
      </Text>
      
      <View style={styles.suggestionsContainer}>
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <Ionicons name="bulb-outline" size={16} color={colors.secondary} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.aiHeaderIcon}>
          <Ionicons name="sparkles" size={24} color={colors.secondary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Natural language parking search</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={chatHistory}
        keyExtractor={(item, index) => `message-${index}`}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContent}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about parking..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Ionicons name="send" size={20} color={colors.background} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.medium,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.xlarge,
    paddingBottom: spacing.medium,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chatContent: {
    padding: spacing.medium,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.large,
  },
  welcomeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.large,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.small,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
    lineHeight: 24,
  },
  suggestionsContainer: {
    width: '100%',
    gap: spacing.small,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
    backgroundColor: colors.background,
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
    borderColor: colors.secondary + '30',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  messageContainer: {
    marginBottom: spacing.medium,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.medium,
    borderRadius: borderRadius.large,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  aiBubble: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiIcon: {
    marginBottom: spacing.tiny,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: colors.background,
  },
  aiText: {
    color: colors.text,
  },
  resultsContainer: {
    width: '100%',
    marginTop: spacing.small,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.small,
    marginLeft: spacing.small,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.small,
    padding: spacing.medium,
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  inputContainer: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.small,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.large,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.small,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
});

export default AIAssistantScreen;
