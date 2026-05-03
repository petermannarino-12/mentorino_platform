import { create } from 'zustand';
import { Application } from '../../types';

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  setApplications: (apps: Application[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useApplicationStore = create<ApplicationState>((set) => ({
  applications: [],
  loading: false,
  setApplications: (applications) => set({ applications }),
  setLoading: (loading) => set({ loading }),
}));
