import React from 'react';
import { MapPin } from 'lucide-react';
import type { EventData } from '../../services/apiService';

interface CommunityEventsProps {
  events: EventData[];
  onJoinClick?: (event: EventData) => void;
}

export const CommunityEvents: React.FC<CommunityEventsProps> = ({ events, onJoinClick }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight">Active Events</h2>
      </div>

      <div className="w-full overflow-x-auto snap-x hide-scrollbar scroll-smooth">
        <div className="flex gap-4 min-w-max pb-2">
          {events.map((event, index) => {
            const mockImage = index === 0 ? "beach" : index === 1 ? "forest" : "city";
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={event.eventId} className="relative w-[300px] h-[200px] rounded-[2.5rem] overflow-hidden shadow-md snap-start shrink-0 group hover:shadow-xl transition-all border border-gray-100">
                <img
                  src={`https://picsum.photos/seed/${mockImage}/600/400`}
                  alt={event.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/20 to-black/80" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="mb-2">
                    <span className="inline-block bg-[#9bf8b7] text-[#08351e] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      Upcoming : {formattedDate}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
                    {event.name}
                  </h3>
                  <div className="flex items-end justify-between mt-1">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <MapPin className="w-4 h-4 fill-transparent stroke-2 opacity-80" />
                      <span className="text-[11px] font-semibold drop-shadow-md line-clamp-1">{event.location}</span>
                    </div>
                    {onJoinClick && (
                      <button 
                        onClick={() => onJoinClick(event)}
                        className="bg-[#08351e] hover:bg-[#0a4527] text-white text-[10px] font-extrabold px-5 py-1.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
