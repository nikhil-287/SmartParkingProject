import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserBookings,
  cancelBooking,
  completeBooking,
} from '../store/slices/bookingSlice';
import { useFocusEffect } from '@react-navigation/native';

const BookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { upcoming, history, loading } = useSelector((state) => state.booking);
  const authUser = useSelector((state) => state.user.user);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch bookings when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (authUser?.id) {
        dispatch(fetchUserBookings(authUser.id));
      }
    }, [authUser?.id, dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (authUser?.id) {
      await dispatch(fetchUserBookings(authUser.id));
    }
    setRefreshing(false);
  };

  const handleCancelBooking = (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Yes',
        onPress: async () => {
          await dispatch(cancelBooking(bookingId));
          Alert.alert('Success', 'Booking cancelled');
        },
      },
    ]);
  };

  const BookingCard = ({ booking, showCancel = false }) => {
    const checkInDate = new Date(booking.check_in_time);
    const checkOutDate = new Date(booking.check_out_time);

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
          borderLeftWidth: 4,
          borderLeftColor:
            booking.status === 'confirmed'
              ? '#00AA00'
              : booking.status === 'completed'
              ? '#0066cc'
              : '#cc0000',
          borderWidth: 1,
          borderColor: '#eee',
        }}
      >
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
            {booking.parking_name}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            📍 {booking.address}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
              Check-in
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '500' }}>
              {checkInDate.toLocaleString()}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
              Check-out
            </Text>
            <Text style={{ fontSize: 13, fontWeight: '500' }}>
              {checkOutDate.toLocaleString()}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            marginBottom: 8,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: '#999' }}>Vehicle</Text>
            <Text style={{ fontSize: 13, fontWeight: '500' }}>
              {booking.vehicle_number}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: '#999' }}>Price</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#0066cc' }}>
              ${booking.estimated_price.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text
            style={{
              fontSize: 11,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor:
                booking.status === 'confirmed'
                  ? '#e8f5e9'
                  : booking.status === 'completed'
                  ? '#e3f2fd'
                  : '#ffebee',
              color:
                booking.status === 'confirmed'
                  ? '#00AA00'
                  : booking.status === 'completed'
                  ? '#0066cc'
                  : '#cc0000',
              borderRadius: 4,
              overflow: 'hidden',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {booking.status?.toUpperCase()}
          </Text>
        </View>

        {showCancel && booking.status === 'confirmed' && (
          <TouchableOpacity
            onPress={() => handleCancelBooking(booking.id)}
            style={{
              marginTop: 8,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: '#cc0000',
              borderRadius: 4,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#cc0000', fontWeight: '600', fontSize: 12 }}>
              Cancel Booking
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && upcoming.length === 0 && history.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const displayData = activeTab === 'upcoming' ? upcoming : history;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Tab Selector */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'upcoming' ? 3 : 0,
            borderBottomColor: activeTab === 'upcoming' ? '#007AFF' : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: activeTab === 'upcoming' ? '600' : '400',
              color: activeTab === 'upcoming' ? '#007AFF' : '#666',
            }}
          >
            Upcoming ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'history' ? 3 : 0,
            borderBottomColor: activeTab === 'history' ? '#007AFF' : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: activeTab === 'history' ? '600' : '400',
              color: activeTab === 'history' ? '#007AFF' : '#666',
            }}
          >
            History ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {displayData.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 16, color: '#999', marginBottom: 8 }}>
            {activeTab === 'upcoming'
              ? 'No upcoming bookings'
              : 'No booking history'}
          </Text>
          {activeTab === 'upcoming' && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Map')}
              style={{
                marginTop: 12,
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: '#007AFF',
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                Find a Parking Spot
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard booking={item} showCancel={activeTab === 'upcoming'} />
          )}
          scrollEnabled={true}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default BookingsScreen;
