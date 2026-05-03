import { bookingService } from '../services/bookingService';
import { useBookingStore } from '../stores/bookingStore';
import { Booking } from '../../types';

export const useBookings = () => {
  const { bookings, loading, setBookings, setLoading } = useBookingStore();

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await bookingService.fetchAll();
    setBookings(data || []);
    setLoading(false);
  };

  const addBooking = async (booking: Omit<Booking, 'id'>) => {
    await bookingService.insert(booking);
    await fetchBookings();
  };

  return { bookings, loading, addBooking, refresh: fetchBookings };
};
