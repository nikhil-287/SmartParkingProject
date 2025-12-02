import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import supabase from '../services/supabaseClient';
import { clearAuthUser } from '../store/slices/userSlice';
import { colors, spacing } from '../constants/theme';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.user.authUser);

  const [profile, setProfile] = useState({
    email: '',
    full_name: '',
    first_name: '',
    family_name: '',
    phone: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Get the current user from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('DEBUG: Supabase session:', session?.user?.email);

      if (!session?.user?.email) {
        console.error('No session or email found');
        return;
      }

      const userEmail = session.user.email;
      console.log('DEBUG: Fetching profile for email:', userEmail);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      console.log('DEBUG: Profile data:', data);
      console.log('DEBUG: Profile error:', error);

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }

      if (data) {
        console.log('DEBUG: Setting profile with data:', data);
        setProfile({
          email: data.email || '',
          full_name: data.full_name || '',
          first_name: data.first_name || '',
          family_name: data.family_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          first_name: profile.first_name,
          family_name: profile.family_name,
          phone: profile.phone,
          updated_at: new Date(),
        })
        .eq('email', profile.email);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Profile updated');
        setEditing(false);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(clearAuthUser());
      // Simply pop back to login screen - Redux will handle the auth state change
      // which triggers navigation reset in AppNavigator
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.full_name}
              onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              placeholder="Enter full name"
            />
          ) : (
            <Text style={styles.value}>{profile.full_name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>First Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.first_name}
              onChangeText={(text) => setProfile({ ...profile, first_name: text })}
              placeholder="Enter first name"
            />
          ) : (
            <Text style={styles.value}>{profile.first_name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Family Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.family_name}
              onChangeText={(text) => setProfile({ ...profile, family_name: text })}
              placeholder="Enter family name"
            />
          ) : (
            <Text style={styles.value}>{profile.family_name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{profile.phone || 'Not set'}</Text>
          )}
        </View>

        {editing ? (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.large,
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    marginBottom: spacing.medium,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.medium,
    color: colors.text,
  },
  fieldGroup: {
    marginBottom: spacing.medium,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    padding: spacing.small,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    padding: spacing.small,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  button: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    flex: 1,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ProfileScreen;
