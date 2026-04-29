import React, { useState, useEffect, useRef, useCallback } from "react";
import { LogOut } from "lucide-react";
import logo from "../../../assets/publicHygineCouncil.png";
import { StatsOverview } from "../../../components/sections/user/StatsOverview";
import { WelcomeSection } from "../../../components/sections/user/WelcomeSection";
import { CommunityEvents } from "../../../components/sections/user/CommunityEvents";
import { EventGuidelines } from "../../../components/sections/user/EventGuidelines";
import { DesktopDashboardView } from "../../../components/sections/user/DesktopDashboardView";
import { Leaderboard } from "../../../components/sections/user/Leaderboard";
import { apiService } from "../../../services/apiService";
import type {
  EventData,
  UserStats,
  DashboardEvent,
} from "../../../services/apiService";
import { useAuth } from "../../../hooks/useAuth";

export const UserDashboard: React.FC = () => {
  const { currentUser, logout: handleLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // All events from /events (for Upcoming section)
  const [events, setEvents] = useState<EventData[]>([]);
  // Joined events from /dashboard (active events the user already joined)
  const [activeEvents, setActiveEvents] = useState<DashboardEvent[]>([]);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userName, setUserName] = useState<string>(
    currentUser?.name?.split(" ")[0] || "",
  );
  const [userLeaderboard, setUserLeaderboard] = useState<any[]>([]);
  const [orgLeaderboard, setOrgLeaderboard] = useState<any[]>([]);

  // Load dashboard data: stats + joined events
  const loadDashboard = useCallback(async () => {
    const data = await apiService.getDashboard();
    if (data) {
      setUserStats(data.stats);
      setActiveEvents(data.eventsJoined);
      if (data.profile?.name) {
        setUserName(data.profile.name.split(" ")[0]);
      }
    }

    // Load global leaderboards
    const [uLeaderboard, oLeaderboard] = await Promise.all([
      apiService.getUserLeaderboard(5),
      apiService.getOrganizationLeaderboard(5),
    ]);
    setUserLeaderboard(uLeaderboard);
    setOrgLeaderboard(oLeaderboard);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Load all events from /events for the Upcoming Events section
  useEffect(() => {
    async function loadEvents() {
      const data = await apiService.getEvents();
      setEvents(data);
    }
    loadEvents();
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };
  const initials = getInitials(currentUser?.name || "Jane Doe");

  // keep events load (already done above in separate useEffect)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Active events = joined events from /dashboard.
  // Upcoming events = events from /events NOT already in active list.
  const activeEventIds = new Set(activeEvents.map((e) => e.eventId));
  const upcomingEvents = events.filter((e) => !activeEventIds.has(e.eventId));

  const activeEventsAsEventData: EventData[] = activeEvents.map((e) => ({
    eventId: e.eventId,
    startDate: e.startDate,
    endDate: e.endDate,
    location: e.location,
    name: e.eventName,
    details: "",
    description: "",
    rewards: "",
    joinsCount: e.joinedCount,
    eventImage: e.eventImage ?? null,
    participants: [],
    createdAt: "",
    updatedAt: "",
  }));

  return (
    <div className="min-h-screen bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900">
      {/* ── Unified Top Navigation ──────────────────────────────────────────── */}
      <header className="bg-[#f4fff5] lg:bg-white px-5 sm:px-8 lg:px-12 py-3 lg:py-4 sticky top-0 z-40 lg:border-b lg:border-gray-100 flex justify-between items-center transition-colors">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Public Hygiene Council"
            className="h-10 lg:h-12 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-3 relative shrink-0">
          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="cursor-pointer w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#08351e] text-white flex items-center justify-center text-sm font-bold shadow-md hover:bg-[#0a4527] hover:shadow-lg transition-all active:scale-95 ring-2 ring-transparent hover:ring-secondary/20"
              title="Profile"
            >
              {initials}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-gray-800">
                    {currentUser?.name || "Jane Doe"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email || "jane@example.com"}
                  </p>
                </div>
                {/* <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    alert("Settings coming soon");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-gray-400" /> Settings
                </button> */}
                <div className="h-px bg-gray-50 my-1 w-full" />
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Layout ───────────────────────────────────────────────────── */}
      <main className="flex lg:hidden px-5 sm:px-8 pt-6 max-w-xl mx-auto w-full animate-slide-up flex-col gap-6 pb-8">
        <WelcomeSection
          name={userName || currentUser?.name?.split(" ")[0] || "Sarah"}
          points={userStats?.totalPoints ?? 0}
          level={4}
          stats={userStats}
        />

        <StatsOverview stats={userStats} />

        <Leaderboard
          userLeaderboard={userLeaderboard}
          orgLeaderboard={orgLeaderboard}
        />

        <div className="flex flex-col gap-8 mt-2 min-w-0">
          {/* <RewardsSection /> */}
          <CommunityEvents
            activeEvents={activeEventsAsEventData}
            upcomingEvents={upcomingEvents}
            // currentUserId={currentUser?.id ?? null}
            // onJoinClick={setSelectedEventToJoin}
          />
          {/* <EventGuidelines /> */}
        </div>
      </main>

      {/* ── Desktop Layout ──────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopDashboardView
          name={userName || currentUser?.name?.split(" ")[0] || "Alex"}
          activeEvents={activeEventsAsEventData}
          upcomingEvents={upcomingEvents}
          // currentUserId={currentUser?.id ?? null}
          // onJoinClick={setSelectedEventToJoin}
          stats={userStats}
          userLeaderboard={userLeaderboard}
          orgLeaderboard={orgLeaderboard}
        />
      </div>

      {/* ── Global Footer ───────────────────────────────────────────────────── */}
      <footer className="max-w-[1600px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-5 border-t border-gray-100 animate-slide-up bg-white lg:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center">
            <img
              src={logo}
              alt="Public Hygiene Council"
              className="h-8 lg:h-10 w-auto object-contain"
            />
          </div>
          <p className="text-xs font-semibold text-gray-400 text-center sm:text-left">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
