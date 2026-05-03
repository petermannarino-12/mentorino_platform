import { supabase } from '../lib/supabase';
import { Application } from '../../types';

export const applicationService = {
  async fetchAll() {
    return await supabase.from('applications').select('*').order('created_at', { ascending: false });
  },
  async insert(app: Omit<Application, 'id' | 'created_at'>) {
    return await supabase.from('applications').insert(app);
  },
  async updateStatus(id: string, status: string) {
    return await supabase.from('applications').update({ status }).eq('id', id);
  },
  async delete(id: string) {
    return await supabase.from('applications').delete().eq('id', id);
  }
};
