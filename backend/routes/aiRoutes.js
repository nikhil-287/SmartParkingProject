const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Process natural language query
router.post('/query', aiController.processQuery.bind(aiController));

// Get query suggestions
router.get('/suggestions', aiController.getSuggestions.bind(aiController));

module.exports = router;
