import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';

export const useTasksQuery = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await taskService.fetchAll();
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
};

export const useAddTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.insert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, response }: { id: string; status: string; response?: string }) => 
        taskService.updateStatus(id, status, response),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
