const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Create a new booking
router.post('/create', bookingController.createBooking);

// Get all bookings for a user
router.get('/user/:userId', bookingController.getUserBookings);

// Cancel a booking
router.put('/:bookingId/cancel', bookingController.cancelBooking);

// Complete a booking
router.put('/:bookingId/complete', bookingController.completeBooking);

module.exports = router;
