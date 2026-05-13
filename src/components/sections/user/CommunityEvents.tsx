import React from "react";
import type { EventData } from "../../../services/apiService";
import type { SessionState } from "../../../hooks/useCleanUpSession"; // For session badge display
import { EventCarousel } from "../../shared/EventCarousel";

interface CommunityEventsProps {
  activeEvents: EventData[];
  upcomingEvents: EventData[];
  activeSessionEventId?: string | null; // The event ID that has an active timer session
  activeSessionState?: SessionState; // Whether timer is running or needs report submission
  onJoinClick?: (event: EventData) => void;
}

export const CommunityEvents: React.FC<CommunityEventsProps> = ({
  activeEvents,
  upcomingEvents,
  activeSessionEventId,
  activeSessionState,
}) => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div>
        <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight mb-4 px-2">
          Active Events
        </h2>
        <EventCarousel
          events={activeEvents}
          activeSessionEventId={activeSessionEventId || null}
          activeSessionState={activeSessionState || "idle"}
        />
      </div>

      <div>
        <h2 className="text-[1.35rem] font-bold text-gray-900 tracking-tight mb-4 px-2">
          Upcoming Events
        </h2>
        <EventCarousel
          events={upcomingEvents}
          activeSessionEventId={activeSessionEventId || null}
          activeSessionState={activeSessionState || "idle"}
        />
      </div>
    </div>
  );
};
