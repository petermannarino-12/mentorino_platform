import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/applicationService';

export const useApplicationsQuery = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data, error } = await applicationService.fetchAll();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAddApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationService.insert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
};

export const useUpdateApplicationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
        applicationService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });
};
