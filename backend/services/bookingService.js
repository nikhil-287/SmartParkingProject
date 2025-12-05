const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

// Initialize Supabase client with service role key
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

const bookingService = {
  createBooking: async (bookingData) => {
    try {
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
      } = bookingData;

      console.log(`🔍 Checking if user exists in profiles: ${user_id}`);
      
      // Verify user exists in profiles table
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user_id)
        .single();

      if (profileError) {
        console.error(`❌ Error checking profile:`, profileError);
        if (profileError.code === 'PGRST116') {
          // No rows found - profile doesn't exist
          console.warn(`⚠️  Profile not found for user ${user_id}. Attempting to create profile...`);
          
          // Try to create a minimal profile
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user_id, email: `user-${user_id}@app.local`, provider: 'supabase' }]);
          
          if (createError) {
            console.error(`❌ Failed to create profile:`, createError.message);
            throw new Error(`User profile does not exist and could not be created: ${createError.message}`);
          }
          console.log(`✅ Profile created for ${user_id}`);
        } else {
          throw new Error(`Failed to check profile: ${profileError.message}`);
        }
      } else {
        console.log(`✅ User profile found: ${user_id}`);
      }

      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id,
          api_parking_id,
          api_provider,
          parking_name,
          latitude,
          longitude,
          address,
          check_in_time: new Date(check_in_time).toISOString(),
          check_out_time: new Date(check_out_time).toISOString(),
          vehicle_number,
          estimated_price,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]).select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Booking inserted but no data returned from database');
      }
      console.log(`✅ Booking inserted successfully: ${data[0].id}`);
      return data[0];
    } catch (err) {
      console.error(`🚨 Failed to create booking:`, err.message);
      throw new Error(`Failed to create booking: ${err.message}`);
    }
  },

  getUserBookings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('check_in_time', { ascending: false });

      if (error) throw error;

      // Separate into upcoming and history
      const now = new Date();
      const upcoming = data.filter(
        (b) => new Date(b.check_in_time) > now && b.status !== 'cancelled'
      );
      const history = data.filter(
        (b) => new Date(b.check_in_time) <= now || b.status === 'cancelled'
      );

      return { upcoming, history, all: data };
    } catch (err) {
      throw new Error(`Failed to fetch user bookings: ${err.message}`);
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      throw new Error(`Failed to cancel booking: ${err.message}`);
    }
  },

  completeBooking: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      throw new Error(`Failed to complete booking: ${err.message}`);
    }
  },

  getBookingById: async (bookingId) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(`Failed to fetch booking: ${err.message}`);
    }
  },
};

module.exports = bookingService;
