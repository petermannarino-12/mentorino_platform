import { supabase } from '../lib/supabase';
import { Booking } from '../../types';

export const bookingService = {
  async fetchAll() {
    return await supabase.from('bookings').select('*').order('date', { ascending: false });
  },
  async insert(booking: Omit<Booking, 'id'>) {
    return await supabase.from('bookings').insert(booking);
  }
};
