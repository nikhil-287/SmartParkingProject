import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import supabase from '../services/supabaseClient';
import authService from '../services/authService';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../store/slices/userSlice';
import { colors, spacing } from '../constants/theme';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const handleManualRegister = async () => {
    if (!email || !password) return Alert.alert('Validation', 'Enter email and password');
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            first_name: firstName,
            family_name: familyName,
            phone,
          },
        },
      });
      if (error) {
        Alert.alert('Sign-up error', error.message);
        setLoading(false);
        return;
      }

      // If email confirmation is enabled, session may be null. If session exists, sync immediately
      const accessToken = data?.session?.access_token;
      if (accessToken) {
        const res = await authService.syncWithSupabase(accessToken);
        if (res && res.success) {
          dispatch(setAuthUser(res.user));
          Alert.alert('Success', 'Account created and profile synced!');
          // Navigate to home after brief delay
          setTimeout(() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }), 1000);
        } else {
          Alert.alert('Sync failed', res?.error || 'Profile creation failed');
        }
      } else {
        Alert.alert('Confirm Email', 'A confirmation email was sent. After confirming, sign in.');
      }
    } catch (err) {
      Alert.alert('Registration failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Family name" value={familyName} onChangeText={setFamilyName} />
      <TextInput style={styles.input} placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleManualRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register with Email'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.large,
    color: colors.text,
  },
  input: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.small,
    borderRadius: 8,
    marginTop: spacing.small,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    marginTop: spacing.medium,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: spacing.medium,
  },
  linkText: {
    color: colors.textSecondary,
  },
});

export default RegisterScreen;
