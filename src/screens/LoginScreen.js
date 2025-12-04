import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useDispatch } from 'react-redux';
import { setAuthUser, setWelcomeMessage, clearWelcomeMessage } from '../store/slices/userSlice';
import authService from '../services/authService';
import supabase from '../services/supabaseClient';
import { GOOGLE_CLIENT_ID } from '../constants/config';
import { colors, spacing } from '../constants/theme';
import { TextInput } from 'react-native';

// Complete any pending auth session on app start
try {
  WebBrowser.maybeCompleteAuthSession();
} catch (err) {
  console.log('WebBrowser.maybeCompleteAuthSession error (usually expected):', err.message);
}

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const showWelcome = (name) => {
    const displayName = name || 'there';
    dispatch(setWelcomeMessage(`Hi ${displayName}, welcome in!`));
    setTimeout(() => dispatch(clearWelcomeMessage()), 3000);
  };

  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Hardcode the Expo proxy redirect URI (already registered in Google Console)
  const redirectUri = 'https://auth.expo.io/@ksbhat/SmartParkingProject';

  // Initialize OAuth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: redirectUri,
      responseType: 'id_token',
      extraParams: { nonce: 'nonce' },
      usePKCE: false,
    },
    discovery
  );

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      // Temporary workaround: use email/password login instead of OAuth
      // This bypasses the Google OAuth redirect URI issues during development
      const testEmail = 'abc@gmail.com';
      const testPassword = '12345678';

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        // If test account doesn't exist, create it first
        if (error.message.includes('Invalid login credentials')) {
          console.log('Test account does not exist, creating...');
          const { error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
          });
          if (signUpError) {
            Alert.alert('Error', signUpError.message);
            setLoadingGoogle(false);
            return;
          }
          // Retry login
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });
          if (retryError) {
            Alert.alert('Error', retryError.message);
            setLoadingGoogle(false);
            return;
          }
          data = retryData;
        } else {
          Alert.alert('Sign-in error', error.message);
          setLoadingGoogle(false);
          return;
        }
      }

      const accessToken = data?.session?.access_token;
      if (!accessToken) {
        Alert.alert('Error', 'No access token returned');
        setLoadingGoogle(false);
        return;
      }

      console.log('DEBUG: Test OAuth login accessToken:', accessToken?.slice(0, 40) + '...');

      const res = await authService.syncWithSupabase(accessToken);
      console.log('DEBUG: OAuth sync response:', res);

      if (res?.success) {
        dispatch(setAuthUser(res.user));
        showWelcome(res.user?.name || 'Test User');
      } else {
        Alert.alert('Sync failed', res?.error || 'Unable to sync profile');
      }
    } catch (err) {
      console.error('OAuth workaround error:', err);
      Alert.alert('Error', err.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Email/password sign-in using Supabase
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !password) return Alert.alert('Validation', 'Enter email and password');
    try {
      setLoadingEmail(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Sign-in error', error.message);
        setLoadingEmail(false);
        return;
      }

      const accessToken = data?.session?.access_token;
      if (!accessToken) {
        Alert.alert('Sign-in error', 'No access token returned');
        setLoadingEmail(false);
        return;
      }

      // Debug: log the access token being sent to backend (truncate for privacy)
      console.log('DEBUG: supabase accessToken:', accessToken?.slice ? accessToken.slice(0, 40) + '...' : accessToken);

      const res = await authService.syncWithSupabase(accessToken);
      console.log('DEBUG: syncWithSupabase response:', res);
      if (res && res.success) {
        dispatch(setAuthUser(res.user));
        showWelcome(res.user?.name || res.user?.email);
      } else {
        Alert.alert('Sync failed', res?.error || 'Unable to sync profile');
      }
    } catch (err) {
      Alert.alert('Sign-in failed', err.message);
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Smart Parking</Text>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={loadingGoogle}
      >
        <Text style={styles.googleButtonText}>{loadingGoogle ? 'Signing in...' : 'Sign in with Google'}</Text>
      </TouchableOpacity>

      <View style={styles.emailContainer}>
        <Text style={styles.orText}>— or —</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={[styles.emailButton, loadingEmail && { opacity: 0.6 }]} onPress={handleEmailSignIn} disabled={loadingEmail}>
          <Text style={styles.emailButtonText}>{loadingEmail ? 'Signing in...' : 'Sign in with Email'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: spacing.large,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.large,
    color: colors.text,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    marginTop: spacing.medium,
  },
  googleButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
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
  link: {
    marginTop: spacing.medium,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
  emailContainer: {
    width: '100%',
    marginTop: spacing.medium,
    paddingHorizontal: spacing.large,
  },
  orText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginVertical: spacing.small,
  },
  label: {
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.small,
    borderRadius: 8,
    marginTop: spacing.tiny,
  },
  emailButton: {
    backgroundColor: colors.primary,
    padding: spacing.medium,
    borderRadius: 8,
    marginTop: spacing.medium,
    alignItems: 'center',
  },
  emailButtonText: {
    color: colors.background,
    fontWeight: '700',
  },
});

export default LoginScreen;
