import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import DetailsScreen from '../screens/DetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookingScreen from '../screens/BookingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { clearWelcomeMessage } from '../store/slices/userSlice';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const welcomeMessage = useSelector((state) => state.user.welcomeMessage);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (welcomeMessage) {
      const t = setTimeout(() => dispatch(clearWelcomeMessage()), 10500);
      return () => clearTimeout(t);
    }
  }, [welcomeMessage]);

  return (
    <NavigationContainer>
      {welcomeMessage && (
        <View style={styles.welcomeContainer} pointerEvents="none">
          <Text style={styles.welcomeText}>{welcomeMessage}</Text>
        </View>
      )}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main app
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="Details" 
              component={DetailsScreen}
              options={{ headerShown: true, headerTitle: 'Parking Details', headerBackTitle: 'Back' }}
            />
            <Stack.Screen 
              name="Booking" 
              component={BookingScreen}
              options={{ headerShown: true, headerTitle: 'Reserve Parking', headerBackTitle: 'Back' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ headerShown: true, headerTitle: 'My Profile', headerBackTitle: 'Back' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  welcomeContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: spacing.small,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 999,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  welcomeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
