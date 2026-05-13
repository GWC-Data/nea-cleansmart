import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  History,
  Award,
  ExternalLink,
} from "lucide-react";
import logo from "../../../assets/publicHygineCouncil.png";
import {
  apiService,
  type EventLog,
  type DashboardEvent,
  type UserStats,
} from "../../../services/apiService";

/**
 * EventHistoryPage Component
 * Displays the user's participation history by merging actual Cleanup Logs
 * with Joined Events that have already ended.
 */
export const EventHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State from navigation (optimization to reduce API calls)
  const stateData = location.state as {
    eventsJoined?: DashboardEvent[];
    stats?: UserStats;
  } | null;

  const [logs, setLogs] = useState<EventLog[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<DashboardEvent[]>(
    stateData?.eventsJoined || [],
  );
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch logs (actual sessions)
        const logsRes = await apiService.getUserEventLogs();
        if (logsRes) setLogs(logsRes.eventLogs);

        // If we don't have joined events from state, fetch them via dashboard
        if (!stateData?.eventsJoined) {
          const dashboardRes = await apiService.getDashboard();
          if (dashboardRes) setJoinedEvents(dashboardRes.eventsJoined);
        }
      } catch (error) {
        console.error("Failed to fetch history data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stateData]);

  /**
   * Merged History Logic:
   * 1. Start with Event Logs (Actual work done).
   * 2. Filter Joined Events for those that have ended (endDate < now).
   * 3. Add Ended Joined Events that DON'T have a corresponding Event Log.
   */
  const mergedHistory = useMemo(() => {
    const now = new Date();

    // Map logs for easy lookup by eventId
    const loggedEventIds = new Set(logs.map((l) => l.eventId));

    // Convert past joined events into a history-compatible format
    const pastJoins = joinedEvents
      .filter((e) => {
        const ended = new Date(e.endDate) < now;
        return ended && !loggedEventIds.has(e.eventId);
      })
      .map((e) => ({
        id: `join-${e.eventId}`,
        eventId: e.eventId,
        checkInTime: e.startDate, // Use start date as fallback time
        isRegistrationOnly: true,
        event: {
          name: e.eventName,
          location: e.location,
        },
        garbageWeight: 0,
        totalHours: 0,
      }));

    // Combine and sort by date descending
    const combined = [
      ...logs.map((l) => ({ ...l, isRegistrationOnly: false })),
      ...pastJoins,
    ];

    return combined.sort(
      (a, b) =>
        new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime(),
    );
  }, [logs, joinedEvents]);

  return (
    <div className="min-h-screen bg-[#f8fcf9] font-sans text-gray-900 flex flex-col">
      {/* Header — consistent with other user pages */}
      <header className="bg-white px-5 sm:px-8 lg:px-12 py-4 sticky top-0 z-40 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <img
            src={logo}
            alt="Public Hygiene Council"
            className="h-10 lg:h-12 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 py-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#08351e] p-2.5 rounded-xl shadow-lg">
            <History className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Participation History
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-medium">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#08351e] rounded-full animate-spin mb-4" />
            Loading your history...
          </div>
        ) : mergedHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No events joined yet
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
              Your clean-up journey hasn't started yet! Join an event and make
              Singapore greener.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-[#08351e] text-white font-extrabold px-8 py-3 rounded-full hover:bg-[#0a4527] transition-all active:scale-95 cursor-pointer shadow-md"
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mergedHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/events/${item.eventId}`)}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 sm:items-center group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-gray-900 truncate group-hover:text-[#08351e] transition-colors">
                        {item.event?.name || "Cleanup Event"}
                      </h3>
                      {item.isRegistrationOnly && (
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                          Registration Only (No session recorded)
                        </p>
                      )}
                    </div>
                    <div
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 border ${
                        item.isRegistrationOnly
                          ? "bg-gray-50 text-gray-400 border-gray-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}
                    >
                      <Award className="w-3 h-3" />
                      {item.isRegistrationOnly ? "Joined" : "Completed"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                      <Calendar className="w-4 h-4 text-[#08351e]/60" />
                      {new Date(item.checkInTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                      <MapPin className="w-4 h-4 text-[#08351e]/60" />
                      <span className="truncate">
                        {item.event?.location || "Singapore"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                      <Clock className="w-4 h-4 text-[#08351e]/60" />
                      {item.totalHours > 0
                        ? `${item.totalHours.toFixed(1)} Hours Logged`
                        : "No Hours Logged"}
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                      <Award className="w-4 h-4 text-[#08351e]/60" />
                      {item.garbageWeight > 0
                        ? `${item.garbageWeight} kg Collected`
                        : "No weight recorded"}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-300 group-hover:bg-[#08351e]/5 group-hover:text-[#08351e] transition-all">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer — consistent with other user pages */}
      <footer className="max-w-[1600px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-8 border-t border-gray-100 mt-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Public Hygiene Council"
              className="h-8 lg:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-center sm:text-left">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
