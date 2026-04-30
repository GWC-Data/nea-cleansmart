import React from "react";
import { MapPin, CalendarX, Clock4 } from "lucide-react";
import type { EventData } from "../../../services/apiService";
import { useNavigate } from "react-router-dom";
import { getEventImageUrl } from "../../../utils/imageUtils";

interface CommunityEventsProps {
  activeEvents: EventData[];
  upcomingEvents: EventData[];
  onJoinClick?: (event: EventData) => void;
}

export const CommunityEvents: React.FC<CommunityEventsProps> = ({
  activeEvents,
  upcomingEvents,
  onJoinClick,
}) => {
  const navigate = useNavigate();

  const renderCarousel = (
    title: string,
    eventList: EventData[],
    hideJoin: boolean = false,
    emptyMessage: string = "No events available.",
    emptyIcon: React.ReactNode = (
      <CalendarX className="w-8 h-8 text-gray-300" />
    ),
  ) => {
    return (
      <div className="w-full mb-8 last:mb-0">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>

        {eventList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 bg-gray-50 rounded-3xl border border-gray-100 text-center">
            {emptyIcon}
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[240px]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto snap-x hide-scrollbar scroll-smooth">
            <div className="flex gap-4 min-w-max pb-2">
              {eventList.map((event) => {
                const startDate = new Date(event.startDate);
                const endDate = event.endDate ? new Date(event.endDate) : null;

                const isValidStart = !isNaN(startDate.getTime());
                const isValidEnd = endDate && !isNaN(endDate.getTime());

                const formatOptions: Intl.DateTimeFormatOptions = {
                  month: "short",
                  day: "numeric",
                };

                let formattedDate = isValidStart
                  ? startDate.toLocaleDateString("en-US", formatOptions)
                  : "Date TBD";

                if (isValidStart && isValidEnd) {
                  const startStr = startDate.toLocaleDateString(
                    "en-US",
                    formatOptions,
                  );
                  const endStr = endDate.toLocaleDateString(
                    "en-US",
                    formatOptions,
                  );

                  if (startStr !== endStr) {
                    formattedDate = `${startStr} - ${endStr}`;
                  }
                }

                return (
                  <div
                    key={event.eventId}
                    onClick={() => navigate(`/events/${event.eventId}`)}
                    className="relative w-[300px] h-[200px] rounded-[2.5rem] overflow-hidden shadow-md snap-start shrink-0 group hover:shadow-xl transition-all border border-gray-100 cursor-pointer"
                  >
                    <img
                      src={getEventImageUrl(event.eventImage)}
                      alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/20 to-black/80" />

                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="mb-2">
                        <span className="inline-block bg-[#9bf8b7] text-[#08351e] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          {formattedDate}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white leading-tight mb-2 tracking-tight drop-shadow-md">
                        {event.name}
                      </h3>
                      <div className="flex items-end justify-between mt-1">
                        <div className="flex items-center gap-1.5 text-white/90">
                          <MapPin className="w-4 h-4 fill-transparent stroke-2 opacity-80" />
                          <span className="text-[11px] font-semibold drop-shadow-md line-clamp-1">
                            {event.location}
                          </span>
                        </div>
                        {!hideJoin && onJoinClick && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${event.eventId}`);
                            }}
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
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderCarousel(
        "Active Events",
        activeEvents,
        true,
        "No events joined yet. Browse upcoming events below and join one to get started!",
        <CalendarX className="w-8 h-8 text-gray-300" />,
      )}
      {renderCarousel(
        "Upcoming Events",
        upcomingEvents,
        false,
        "Currently there are no upcoming events available, stay tuned!",
        <Clock4 className="w-8 h-8 text-gray-300" />,
      )}
    </div>
  );
};
