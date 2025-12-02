import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { colors } from '../constants/theme';

import MapScreen from '../screens/MapScreen';
import ListScreen from '../screens/ListScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'List') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'AI Assistant') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          headerTitle: 'Smart Parking',
        }}
      />
      <Tab.Screen 
        name="List" 
        component={ListScreen}
        options={{
          headerTitle: 'Parking List',
        }}
      />
      <Tab.Screen 
        name="AI Assistant" 
        component={AIAssistantScreen}
        options={{
          headerTitle: 'AI Assistant',
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          headerTitle: 'My Favorites',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
