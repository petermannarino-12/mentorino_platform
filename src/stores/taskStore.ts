import { create } from 'zustand';
import { TaskActivity } from '../../types';

interface TaskState {
  taskActivities: TaskActivity[];
  loading: boolean;
  setTaskActivities: (tasks: TaskActivity[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  taskActivities: [],
  loading: false,
  setTaskActivities: (taskActivities) => set({ taskActivities }),
  setLoading: (loading) => set({ loading }),
}));
