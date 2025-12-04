const bookingService = require('../services/bookingService');

const bookingController = {
  createBooking: async (req, res) => {
    try {
      console.log('Received booking request body:', JSON.stringify(req.body, null, 2));
      
      const {
        user_id,
        api_parking_id,
        api_provider,
        parking_name,
        latitude,
        longitude,
        address,
        check_in_time,
        check_out_time,
        vehicle_number,
        estimated_price,
      } = req.body;

      console.log('Extracted fields:', {
        user_id: user_id ? '✓' : '✗ MISSING',
        api_parking_id: api_parking_id ? '✓' : '✗ MISSING',
        check_in_time: check_in_time ? '✓' : '✗ MISSING',
        check_out_time: check_out_time ? '✓' : '✗ MISSING',
      });

      if (!user_id || !api_parking_id || !check_in_time || !check_out_time) {
        console.error('Missing required fields');
        return res.status(400).json({ 
          error: 'Missing required fields',
          received: { user_id, api_parking_id, check_in_time, check_out_time }
        });
      }

      console.log(`Creating booking for user_id: ${user_id}`);
      
      const booking = await bookingService.createBooking({
        user_id,
        api_parking_id,
        api_provider: api_provider || 'geoapify',
        parking_name,
        latitude,
        longitude,
        address,
        check_in_time,
        check_out_time,
        vehicle_number,
        estimated_price,
      });

      console.log('Booking created successfully:', booking.id);
      res.status(201).json({ success: true, booking });
    } catch (err) {
      console.error('Create booking error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const bookings = await bookingService.getUserBookings(userId);
      res.json({ success: true, bookings });
    } catch (err) {
      console.error('Get user bookings error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;

      if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID required' });
      }

      const booking = await bookingService.cancelBooking(bookingId);
      res.json({ success: true, booking });
    } catch (err) {
      console.error('Cancel booking error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  completeBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;

      if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID required' });
      }

      const booking = await bookingService.completeBooking(bookingId);
      res.json({ success: true, booking });
    } catch (err) {
      console.error('Complete booking error:', err);
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = bookingController;
