const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// Search parking by coordinates
router.get('/search', parkingController.searchByCoordinates.bind(parkingController));

// Search parking by address
router.get('/search-by-address', parkingController.searchByAddress.bind(parkingController));

// Get parking details
router.get('/:id', parkingController.getParkingById.bind(parkingController));

// Filter parking results
router.post('/filter', parkingController.filterParking.bind(parkingController));

module.exports = router;
