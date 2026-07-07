import { useEffect, useState } from 'react';
import { eventService } from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import type { Event } from '../types';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventService.getAll();
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 animate-pulse-glow';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">📅 Event Agenda</h1>

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event._id} className="card hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="text-3xl font-bold text-blue-600 w-12">{index + 1}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(event.status)}`}>
                {event.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Start Time</p>
                <p className="font-semibold">
                  {formatDate(event.startTime)} at {formatTime(event.startTime)}
                </p>
              </div>
              {event.endTime && (
                <div>
                  <p className="text-gray-500 mb-1">End Time</p>
                  <p className="font-semibold">{formatTime(event.endTime)}</p>
                </div>
              )}
              {event.location && (
                <div>
                  <p className="text-gray-500 mb-1">Location</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No events scheduled yet
          </div>
        )}
      </div>
    </div>
  );
}
