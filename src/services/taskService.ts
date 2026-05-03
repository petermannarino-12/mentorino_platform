import { supabase } from '../lib/supabase';
import { TaskActivity } from '../../types';

export const taskService = {
  async fetchAll() {
    return await supabase.from('task_activities').select('*').order('created_at', { ascending: false });
  },
  async insert(activity: Omit<TaskActivity, 'id' | 'created_at'>) {
    return await supabase.from('task_activities').insert(activity);
  },
  async updateStatus(id: string, status: string, response?: string) {
    return await supabase.from('task_activities').update({ status, admin_response: response }).eq('id', id);
  }
};
