const authService = require('../services/authService');

class AuthController {
  async googleSignIn(req, res) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'Missing idToken in request body' });
      }

      const profile = await authService.verifyIdToken(idToken);

      if (!profile) {
        return res.status(401).json({ error: 'Invalid ID token' });
      }

      // In a real app: find or create user in DB. For now return profile.
      return res.json({ success: true, user: profile });
    } catch (error) {
      console.error('Google sign-in error:', error.message);
      return res.status(500).json({ error: 'Failed to sign in with Google', message: error.message });
    }
  }

  /**
   * Sync profile using Supabase access token provided by frontend.
   * Expects: { accessToken: 'supabase-access-token' }
   */
  async syncProfile(req, res) {
    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: 'Missing accessToken in request body' });
      }

      const profile = await authService.syncProfileFromSupabase(accessToken);
      if (!profile) {
        return res.status(401).json({ error: 'Invalid Supabase access token' });
      }

      return res.json({ success: true, user: profile });
    } catch (error) {
      console.error('Sync profile error:', error.message);
      return res.status(500).json({ error: 'Failed to sync profile', message: error.message });
    }
  }
}

module.exports = new AuthController();
