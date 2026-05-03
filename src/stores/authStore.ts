import { create } from 'zustand';
import { User, UserRole } from '../../types';

interface AuthState {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  setAuth: (user: User | null, role: UserRole) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: 'visitor',
  isLoading: true,
  setAuth: (user, role) => set({ user, role, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
