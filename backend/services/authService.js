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
          // Expect a `profiles` table with `email` as unique key
          const upsertData = {
            email: profile.email,
            full_name: profile.name,
            given_name: profile.given_name,
            family_name: profile.family_name,
            avatar_url: profile.picture,
            provider: 'google',
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase.from('profiles').upsert(upsertData, { onConflict: 'email' });
          if (error) {
            console.warn('Supabase upsert error:', error.message);
          }
        } catch (err) {
          console.error('Supabase upsert failed:', err.message);
        }
      }

      return profile;
    } catch (error) {
      console.error('Failed to verify ID token:', error.message);
      return null;
    }
  }

  /**
   * Verify Supabase access token sent from frontend and upsert profile.
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

      // Upsert into profiles
      try {
        const upsertData = {
          email: profile.email,
          full_name: profile.name,
          given_name: profile.given_name,
          family_name: profile.family_name,
          avatar_url: profile.picture,
          provider: profile.provider,
          updated_at: new Date().toISOString(),
        };

        const { error: upsertErr } = await supabase.from('profiles').upsert(upsertData, { onConflict: 'email' });
        if (upsertErr) {
          console.warn('Supabase upsert error:', upsertErr.message);
        }
      } catch (err) {
        console.error('Supabase upsert failed:', err.message);
      }

      return profile;
    } catch (err) {
      console.error('syncProfileFromSupabase error:', err.message);
      return null;
    }
  }
}

module.exports = new AuthService();

