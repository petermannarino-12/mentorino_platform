import { eventService } from '../services/eventService';
import { useEventStore } from '../stores/eventStore';
import { NetworkEvent } from '../../types';

export const useEvents = () => {
  const { events, loading, setEvents, setLoading } = useEventStore();

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await eventService.fetchAll();
    setEvents(data || []);
    setLoading(false);
  };

  const addEvent = async (event: NetworkEvent) => {
    const { id, ...eventData } = event;
    await eventService.insert(eventData);
    await fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await eventService.delete(id);
    await fetchEvents();
  };

  const attendEvent = async (eventId: string, userId: string) => {
    const { data: event } = await eventService.getById(eventId);
    if (event) {
      const attendees = event.attendees || [];
      if (!attendees.includes(userId)) {
        attendees.push(userId);
        await eventService.updateAttendees(eventId, attendees);
        await fetchEvents();
      }
    }
  };

  return { events, loading, addEvent, deleteEvent, attendEvent, refresh: fetchEvents };
};
