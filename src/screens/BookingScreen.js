import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, clearBookingError } from '../store/slices/bookingSlice';

const BookingScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.booking);
  const authUser = useSelector((state) => state.user.user);
  const {
    api_parking_id,
    parking_name,
    latitude,
    longitude,
    address,
    price_per_hour,
  } = route.params || {};

  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  ); // Default 1 hour later
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  // Calculate estimated price when dates change
  useEffect(() => {
    const durationMinutes =
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60);
    const durationHours = Math.ceil(durationMinutes / 60);
    const price = (price_per_hour || 0) * Math.max(durationHours, 1);
    setEstimatedPrice(price);
  }, [checkInDate, checkOutDate, price_per_hour]);

  const handleCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
    }
  };

  const handleCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const validateBooking = () => {
    if (!authUser?.id) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return false;
    }
    if (!vehicleNumber.trim()) {
      Alert.alert('Error', 'Please enter your vehicle number');
      return false;
    }
    if (checkOutDate <= checkInDate) {
      Alert.alert('Error', 'Check-out time must be after check-in time');
      return false;
    }
    if (!api_parking_id) {
      Alert.alert('Error', 'Parking information missing. Please go back and try again.');
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    if (!validateBooking()) return;

    try {
      console.log('📋 Booking data:', {
        user_id: authUser?.id,
        api_parking_id,
        parking_name,
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
        vehicle: vehicleNumber,
        price: estimatedPrice,
      });

      const bookingData = {
        user_id: authUser?.id || '',
        api_parking_id,
        api_provider: 'geoapify',
        parking_name,
        latitude,
        longitude,
        address,
        check_in_time: checkInDate.toISOString(),
        check_out_time: checkOutDate.toISOString(),
        vehicle_number: vehicleNumber,
        estimated_price: estimatedPrice,
      };

      const result = await dispatch(createBooking(bookingData));
      if (result.payload && result.payload.id) {
        Alert.alert(
          'Booking Confirmed!',
          `Your booking (ID: ${result.payload.id}) is confirmed.\n\nPlease proceed to the parking lot and pay at the venue.`,
          [
            {
              text: 'View Booking',
              onPress: () => navigation.navigate('Bookings'),
            },
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      console.error('🚨 Booking error:', err);
      Alert.alert('Error', 'Failed to create booking: ' + err.message);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearBookingError());
    }
  }, [error]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} showsVerticalScrollIndicator={false}>
      <View style={{ padding: 16 }}>
        {/* Parking Details */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
            {parking_name || 'Parking Spot'}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
            📍 {address || 'Address not available'}
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            💰 ${price_per_hour || 0}/hour
          </Text>
        </View>

        {/* Check-in Date & Time */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Check-in Date & Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowCheckInPicker(true)}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              backgroundColor: '#f9f9f9',
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {checkInDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="datetime"
              display="spinner"
              onChange={handleCheckInChange}
            />
          )}
        </View>

        {/* Check-out Date & Time */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Check-out Date & Time
          </Text>
          <TouchableOpacity
            onPress={() => setShowCheckOutPicker(true)}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              backgroundColor: '#f9f9f9',
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {checkOutDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="datetime"
              display="spinner"
              onChange={handleCheckOutChange}
            />
          )}
        </View>

        {/* Vehicle Number */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Vehicle Number
          </Text>
          <TextInput
            placeholder="e.g., ABC1234"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              fontSize: 16,
            }}
            placeholderTextColor="#999"
          />
        </View>

        {/* Estimated Price */}
        <View
          style={{
            backgroundColor: '#f0f9ff',
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#0066cc',
          }}
        >
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Estimated Price
          </Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0066cc' }}>
            ${estimatedPrice.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            💳 Pay at the venue
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
          }}
        >
          <Text style={{ color: '#666', fontSize: 16, fontWeight: '600' }}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BookingScreen;
