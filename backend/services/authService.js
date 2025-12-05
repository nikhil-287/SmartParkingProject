const axios = require('axios');
const config = require('../config/config');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase admin client using service role key
const supabase = config.supabaseUrl && config.supabaseServiceRoleKey
  ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey)
  : null;

class AuthService {
  /**
   * Verify Google ID token using Google's tokeninfo endpoint
   * and ensure audience matches our CLIENT_ID
   */
  async verifyIdToken(idToken) {
    try {
      const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
      const resp = await axios.get(url, { timeout: 5000 });
      const data = resp.data;

      // Validate audience
      if (config.googleClientId && data.aud && data.aud !== config.googleClientId) {
        console.warn('ID token audience does not match configured GOOGLE_CLIENT_ID');
        return null;
      }

      // Build a minimal profile
      const profile = {
        id: data.sub,
        email: data.email,
        email_verified: data.email_verified === 'true' || data.email_verified === true,
        name: data.name,
        given_name: data.given_name,
        family_name: data.family_name,
        picture: data.picture,
        locale: data.locale,
      };

      // Upsert profile into Supabase (if configured)
      if (supabase) {
        try {
          // Check if profile exists - only create if it doesn't
          const { data: existingProfile, error: selectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', profile.id)
            .single();

          if (selectError && selectError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log(`Google profile doesn't exist for ${profile.id}, creating...`);
            const { error: insertError } = await supabase.from('profiles').insert([
              {
                id: profile.id,
                email: profile.email,
                full_name: profile.name,
                avatar_url: profile.picture,
                provider: 'google',
                updated_at: new Date().toISOString(),
              },
            ]);

            if (insertError) {
              console.warn('Failed to create Google profile:', insertError.message);
            } else {
              console.log('✅ Google profile created successfully');
            }
          } else if (!selectError) {
            console.log(`✅ Google profile already exists for ${profile.id}`);
          }
        } catch (err) {
          console.error('Google profile check/creation failed:', err.message);
        }
      }

      return profile;
    } catch (error) {
      console.error('Failed to verify ID token:', error.message);
      return null;
    }
  }

  /**
   * Verify Supabase access token sent from frontend and return user profile.
   * Expects a Supabase access token (JWT)
   */
  async syncProfileFromSupabase(accessToken) {
    if (!supabase) return null;

    try {
      // Use admin client to get user by access token
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error) {
        console.warn('supabase.auth.getUser error:', error.message);
        return null;
      }

      const user = data?.user;
      if (!user || !user.email) return null;

      const profile = {
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed_at ? true : false,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        given_name: user.user_metadata?.given_name || null,
        family_name: user.user_metadata?.family_name || null,
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        provider: user.app_metadata?.provider || 'supabase',
      };

      // Check if profile exists in database - only create if it doesn't exist
      try {
        const { data: existingProfile, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (selectError && selectError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log(`📝 Profile doesn't exist for ${user.id}, creating...`);
          const { error: insertError } = await supabase.from('profiles').insert([
            {
              id: user.id,
              email: profile.email,
              full_name: profile.name,
              avatar_url: profile.picture,
              provider: profile.provider,
              updated_at: new Date().toISOString(),
            },
          ]);

          if (insertError) {
            console.warn('Failed to create profile:', insertError.message);
            // Don't throw - profile creation failure shouldn't block login
          } else {
            console.log('✅ Profile created successfully');
          }
        } else if (selectError) {
          console.warn('Error checking profile:', selectError.message);
        } else {
          console.log(`✅ Profile already exists for ${user.id}`);
        }
      } catch (err) {
        console.error('Profile check/creation error:', err.message);
        // Don't throw - profile check failure shouldn't block login
      }

      return profile;
    } catch (err) {
      console.error('syncProfileFromSupabase error:', err.message);
      return null;
    }
  }

  /**
   * Check if a profile exists in the database
   */
  async checkProfileExists(userId) {
    if (!supabase) return { exists: false, error: 'Supabase not configured' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(`❌ Profile check error for ${userId}:`, error.message);
        return { exists: false, userId, error: error.message };
      }

      console.log(`✅ Profile exists for ${userId}:`, data);
      return { exists: true, userId, profile: data };
    } catch (err) {
      console.error(`Profile check exception for ${userId}:`, err.message);
      return { exists: false, userId, error: err.message };
    }
  }

  /**
   * Register a new user profile with extended data (first_name, family_name, phone)
   * Called after user signs up
   */
  async registerProfile({ accessToken, firstName, familyName, phone, fullName }) {
    if (!supabase) return null;

    try {
      // Get user from access token
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error) {
        console.error('Failed to get user from token:', error.message);
        throw error;
      }

      const user = data?.user;
      if (!user || !user.email) {
        throw new Error('Invalid user data from token');
      }

      console.log(`📝 Registering profile for user: ${user.id}, email: ${user.email}`);

      // Create profile with all provided data
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: fullName || user.user_metadata?.full_name || null,
            given_name: firstName || user.user_metadata?.given_name || null,
            family_name: familyName || user.user_metadata?.family_name || null,
            phone: phone || null,
            provider: 'supabase',
            updated_at: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        console.error('❌ Profile insert error:', insertError.message);
        throw insertError;
      }

      console.log(`✅ Profile registered successfully for user ${user.id}`);

      // Return profile object
      const profile = {
        id: user.id,
        email: user.email,
        name: fullName || user.user_metadata?.full_name,
        given_name: firstName,
        family_name: familyName,
        phone: phone,
        provider: 'supabase',
      };

      return profile;
    } catch (err) {
      console.error('Register profile error:', err.message);
      throw err;
    }
  }
}

module.exports = new AuthService();

