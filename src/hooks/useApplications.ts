import { applicationService } from '../services/applicationService';
import { useApplicationStore } from '../stores/applicationStore';
import { Application } from '../../types';

export const useApplications = () => {
  const { applications, loading, setApplications, setLoading } = useApplicationStore();

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await applicationService.fetchAll();
    setApplications(data || []);
    setLoading(false);
  };

  const addApplication = async (app: Omit<Application, 'id' | 'created_at'>) => {
    await applicationService.insert(app);
    await fetchApplications();
  };

  const updateStatus = async (id: string, status: string) => {
    await applicationService.updateStatus(id, status);
    await fetchApplications();
  };

  const deleteApplication = async (id: string) => {
    await applicationService.delete(id);
    await fetchApplications();
  };

  return { 
    applications, 
    loading, 
    addApplication, 
    updateStatus, 
    deleteApplication, 
    refresh: fetchApplications 
  };
};
