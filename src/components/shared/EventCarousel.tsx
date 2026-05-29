import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EventData } from "../../types/api.types";
import { getEventImageUrl } from "../../utils/imageUtils";
import type { SessionState } from "../../hooks/useCleanUpSession";
import { useAuth } from "../../hooks/useAuth";

interface EventCarouselProps {
  events: EventData[];
  activeSessionEventId: string | null;
  activeSessionState: SessionState;
  // Optional list of event IDs that the user has joined, to verify eligibility to view status badges
  joinedEventIds?: string[];
}

export const EventCarousel: React.FC<EventCarouselProps> = ({
  events,
  activeSessionEventId,
  activeSessionState,
  joinedEventIds,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Fetch current user and role context to enforce status visibility rules
  const { currentUser } = useAuth();

  // Helper function to check if the current user has access to see event status badges (Running, Report, Pending, Rejected)
  const showEventStatus = (event: EventData) => {
    if (!currentUser) return false;

    // Rule 1: Organizations should only see status badges on events they created/own
    if (currentUser.role === "organization") {
      return event.createdBy === currentUser.id;
    }

    // Rule 2: Regular users/volunteers should only see status badges if they have joined the event
    if (currentUser.role === "user") {
      if (joinedEventIds) {
        return joinedEventIds.includes(event.eventId);
      }
      return currentUser.joinedEvents?.includes(event.eventId) ?? false;
    }

    // Fallback: Default to showing status for admin or other management roles
    return true;
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [events]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 320; // card width + gap
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 500);
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-sm text-gray-500 font-medium">No events found.</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#86B537] hover:scale-110 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#86B537] hover:scale-110 transition-all active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar pb-4"
      >
        {events.map((event) => (
          <div
            key={event.eventId}
            onClick={() => navigate(`/events/${event.eventId}`)}
            className="snap-start shrink-0 w-[300px] group bg-white border border-gray-100 rounded-2xl cursor-pointer hover:border-[#86B537]/30 hover:shadow-md transition-all flex flex-col gap-3"
          >
            <div className="h-32 rounded-sm bg-gray-50 overflow-hidden relative">
              <img
                src={getEventImageUrl(event.eventImage)}
                alt={event.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dates */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase text-gray-900 leading-none">
                  {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                </p>
                <p className="text-sm font-black text-[#86B537] leading-tight">
                  {new Date(event.startDate).getDate()}
                </p>
              </div>

              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase text-gray-900 leading-none">
                  {new Date(event.endDate).toLocaleDateString("en-US", { month: "short" })}
                </p>
                <p className="text-sm font-black text-[#86B537] leading-tight">
                  {new Date(event.endDate).getDate()}
                </p>
              </div>

              {/* Status Badges (Pending, Rejected, Running, Report!) - Conditional based on user permission context */}
              {showEventStatus(event) && (
                <>
                  {event.status === "pending" && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-yellow-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md border border-yellow-200/20">
                      <Clock className="w-2.5 h-2.5" />
                      Pending
                    </div>
                  )}
                  {event.status === "rejected" && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md border border-red-200/20">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Rejected
                    </div>
                  )}

                  {/* Running Status - only visible for volunteers (users) since organizations manually log activity */}
                  {currentUser?.role !== "organization" && (
                    event.isStarted ? (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-[#08351e]/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md border border-[#9bf8b7]/20">
                        <Clock className="w-2.5 h-2.5 animate-pulse" />
                        Running
                      </div>
                    ) : (
                      activeSessionEventId === event.eventId && (
                        <>
                          {activeSessionState === "checked_in" && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-[#08351e]/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md border border-[#9bf8b7]/20">
                              <Clock className="w-2.5 h-2.5 animate-pulse" />
                              Running
                            </div>
                          )}
                          {activeSessionState === "logging_activity" && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-orange-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md border border-orange-200/20">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Report!
                            </div>
                          )}
                        </>
                      )
                    )
                  )}
                </>
              )}
            </div>

            <div className="px-4 pb-4">
              <h3 className="font-bold text-gray-900 text-sm truncate mb-1">
                {event.name}
              </h3>
              {/* Flex container displaying location on the left and a Public/Private event type badge on the right */}
              <div className="flex items-center justify-between text-xs text-gray-500 gap-2 font-medium w-full">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
                {/* Badge showing whether the event is Public or Private */}
                <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${event.eventType === "private"
                  ? "bg-[#0083cf] text-white border border-[#0083cf]"
                  : "bg-[#88cc00] text-white border border-[#88cc00]"
                  }`}>
                  {event.eventType === "private" ? "Private" : "Public"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
