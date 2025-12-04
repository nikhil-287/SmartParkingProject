const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Google OIDC sign-in/register
router.post('/google', authController.googleSignIn.bind(authController));

// Sync profile from Supabase auth (accepts access token from frontend)
router.post('/sync', authController.syncProfile.bind(authController));

// Register with profile data (called after signup)
router.post('/register-profile', authController.registerProfile.bind(authController));

// Diagnostic endpoint to check if profile exists in database
router.get('/check-profile/:userId', authController.checkProfile.bind(authController));

module.exports = router;
