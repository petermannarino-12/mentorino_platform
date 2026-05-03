import { taskService } from '../services/taskService';
import { useTaskStore } from '../stores/taskStore';
import { TaskActivity } from '../../types';

export const useTasks = () => {
  const { taskActivities, loading, setTaskActivities, setLoading } = useTaskStore();

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await taskService.fetchAll();
    setTaskActivities(data || []);
    setLoading(false);
  };

  const addTask = async (activity: Omit<TaskActivity, 'id' | 'user_id' | 'user_name' | 'status' | 'created_at'>, userId: string, userName: string) => {
    const fullActivity = {
      ...activity,
      user_id: userId,
      user_name: userName,
      status: 'pending'
    };
    await taskService.insert(fullActivity as any);
    await fetchTasks();
  };

  const updateStatus = async (id: string, status: 'reviewed', response?: string) => {
    await taskService.updateStatus(id, status, response);
    await fetchTasks();
  };

  return { taskActivities, loading, addTask, updateStatus, refresh: fetchTasks };
};
