import { create } from 'zustand';
import { NetworkEvent } from '../../types';

interface EventState {
  events: NetworkEvent[];
  loading: boolean;
  setEvents: (events: NetworkEvent[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  loading: false,
  setEvents: (events) => set({ events }),
  setLoading: (loading) => set({ loading }),
}));
