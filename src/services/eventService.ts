import { supabase } from '../lib/supabase';
import { NetworkEvent } from '../../types';

export const eventService = {
  async fetchAll() {
    return await supabase.from('events').select('*').order('created_at', { ascending: false });
  },
  async insert(event: Omit<NetworkEvent, 'id'>) {
    return await supabase.from('events').insert(event);
  },
  async delete(id: string) {
    return await supabase.from('events').delete().eq('id', id);
  },
  async updateAttendees(id: string, attendees: string[]) {
    return await supabase.from('events').update({ attendees }).eq('id', id);
  },
  async getById(id: string) {
    return await supabase.from('events').select('attendees').eq('id', id).single();
  }
};
