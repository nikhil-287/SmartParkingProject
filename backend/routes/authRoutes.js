const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Google OIDC sign-in/register
router.post('/google', authController.googleSignIn.bind(authController));

// Sync profile from Supabase auth (accepts access token from frontend)
router.post('/sync', authController.syncProfile.bind(authController));

module.exports = router;
