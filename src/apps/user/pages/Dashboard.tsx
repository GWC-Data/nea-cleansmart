import React, { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, Clock, StopCircle } from "lucide-react";
import logo from "../../../assets/publicHygineCouncil.png";
import { useCleanUpSession } from "../../../hooks/useCleanUpSession";
import { StatsOverview } from "../../../components/dashboard/StatsOverview";
import { WelcomeSection } from "../../../components/dashboard/WelcomeSection";
import { CommunityEvents } from "../../../components/dashboard/CommunityEvents";
// import { RewardsSection } from "../../../components/dashboard/RewardsSection";
import { EventGuidelines } from "../../../components/dashboard/EventGuidelines";
import { LogActivityForm } from "../../../components/dashboard/LogActivityForm";
import { DurationSelectModal } from "../../../components/modal/DurationSelectModal";
// import { EventDetailsModal } from "../../../components/modal/EventDetailsModal";
import { DesktopDashboardView } from "../../../components/dashboard/DesktopDashboardView";
import { apiService } from "../../../services/apiService";
import type {
  EventData,
  UserStats,
  DashboardEvent,
} from "../../../services/apiService";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

export const Dashboard: React.FC = () => {
  const { currentUser, logout: handleLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // All events from /events (for Upcoming section)
  const [events, setEvents] = useState<EventData[]>([]);
  // Joined events from /dashboard (active events the user already joined)
  const [activeEvents, setActiveEvents] = useState<DashboardEvent[]>([]);

  const [dashboardLocation, setDashboardLocation] = useState<string>("");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userName, setUserName] = useState<string>(
    currentUser?.name?.split(" ")[0] || "",
  );

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
  }, []);

  const {
    state,
    activeEventId,
    activeLogId,
    remainingSeconds,
    elapsedSeconds,
    restoredFromStorage,
    initializeTimer,
    openDurationPicker,
    cancelDurationPicker,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession,
  } = useCleanUpSession();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Make sure we load the timer as soon as user enters the page
  useEffect(() => {
    async function loadActiveTimer() {
      const timerData = await apiService.getTimer();
      // Only initialize if we got valid server-side timer state
      if (timerData && timerData.logId && timerData.checkInTime) {
        initializeTimer(timerData);
      }
    }
    loadActiveTimer();
  }, [initializeTimer]);

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

  // True only when the session was restored from backend timer that had expired
  // (timer had already completed). Used to force the form with no X dismiss button.
  const isMandatory = state === "logging_activity" && restoredFromStorage;

  // keep events load (already done above in separate useEffect)

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            );
            const data = await res.json();
            if (data && data.display_name) {
              setDashboardLocation(data.display_name);
            }
          } catch (e) {
            console.error("Failed to reverse geocode:", e);
          }
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
        },
      );
    }
  }, []);

  // ── Format mm:ss / hh:mm:ss for the countdown timer ──────────────────────
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ── Step 2: User selects duration → call checkInEvent API ───────────────
  const handleDurationSelected = async (durationSecs: number) => {
    if (!activeEventId) return;
    // User ID is extracted from JWT token by the backend
    const resultId = await apiService.checkInEvent({
      eventId: activeEventId,
      checkInTime: new Date().toISOString(),
      hoursEnrolled: (durationSecs / 3600).toString(),
    });
    if (resultId) {
      handleCheckIn(resultId, durationSecs);
      toast.success("Checked in! Your session has started.");
    } else {
      cancelDurationPicker();
      toast.error("Already checked in for this event.");
    }
  };

  const calculateCheckOutTime = async () => {
    const timerData = await apiService.getTimer();
    const now = new Date();

    if (timerData && timerData.checkInTime && timerData.hoursEnrolled) {
      const checkInDate = new Date(timerData.checkInTime);
      let durationMs = 0;
      const hoursStr = timerData.hoursEnrolled.toLowerCase();

      if (hoursStr.endsWith("min")) {
        durationMs = parseFloat(hoursStr) * 60 * 1000;
      } else if (hoursStr.endsWith("hours") || hoursStr.endsWith("hour")) {
        durationMs = parseFloat(hoursStr) * 3600 * 1000;
      } else {
        durationMs = parseFloat(hoursStr) * 3600 * 1000;
      }

      const maxCheckOutDate = new Date(checkInDate.getTime() + durationMs);

      // Validation:
      // 1. If user checks out BEFORE the max time, use current timestamp.
      // 2. If user checks out AFTER the max time, cap it at the max duration.
      return now < maxCheckOutDate ? now.toISOString() : maxCheckOutDate.toISOString();
    }
    return now.toISOString(); // fallback
  };

  // ── Step 4: User submits the log activity form → checkOutEvent API ──────
  const handleSubmitReport = async (
    weight: number,
    type: string,
    finalLocation: string,
    photo?: File,
  ) => {
    if (!activeLogId) return;

    const checkOutTime = await calculateCheckOutTime();

    const checkoutSuccess = await apiService.checkOutEvent(activeLogId, {
      checkOutTime,
      garbageWeight: weight,
      garbageType: type,
      eventLocation: finalLocation,
      wasteImage: photo, // pass file directly — sent as multipart
    });

    if (checkoutSuccess) {
      completeSession();
      toast.success("Report submitted! Great job 🌿");
      // Re-fetch dashboard to show updated hours, weight, carbon & points
      await loadDashboard();
    } else {
      toast.error("Failed to submit report. Please try again.");
    }
  };

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

  // Convert DashboardEvent to EventData shape for components that need it
  const activeEventsAsEventData: EventData[] = activeEvents.map((e) => ({
    eventId: e.eventId,
    date: e.eventDate,
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
          {/* Session controls: shown on ALL screen sizes */}
          <div className="flex items-center gap-2 mr-1">
            {state === "idle" && activeEvents.length > 0 && (
              /* Start Clean-up — visible on both mobile and desktop */
              <button
                onClick={() => {
                  if (userStats && (userStats.todayHours || 0) >= 2) {
                    toast.error("Daily limit of 2 hours reached! See you tomorrow 🌿");
                    return;
                  }
                  openDurationPicker(activeEvents[0].eventId);
                }}
                disabled={activeEvents.length === 0}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold text-white transition-all rounded-full shadow-md cursor-pointer sm:px-5 sm:py-2.5 sm:text-sm active:scale-95 ${
                  userStats && (userStats.todayHours || 0) >= 2
                    ? "bg-gray-400 grayscale"
                    : "bg-[#96c93d] hover:bg-[#86b537]"
                }`}
              >
                {(userStats?.todayHours || 0) >= 2 ? "Limit Reached" : "Start Clean-up"}
              </button>
            )}

            {state === "checked_in" && (
              <div className="hidden lg:flex items-center gap-2">
                {/* Live countdown pill */}
                <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-4 py-2.5 rounded-full text-[#08351e] shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold tabular-nums text-sm">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
                {/* Stop Clean-up */}
                <button
                  onClick={initiateCheckout}
                  className="cursor-pointer bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Clean-up</span>
                </button>
              </div>
            )}
          </div>

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
                  className="cursor-pointer   w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
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

        {/* Mobile Active Session Banner */}
        {state === "checked_in" && (
          <div className="bg-linear-to-r from-[#08351e] to-[#0f5431] rounded-[2rem] px-6 py-5 flex items-center justify-between shadow-lg shadow-green-900/10 border border-[#13613b]">
            <div className="flex items-center gap-4">
              <div className="bg-[#9bf8b7]/20 p-2.5 rounded-full shadow-inner border border-[#9bf8b7]/10 shrink-0">
                <Clock className="w-5 h-5 text-[#9bf8b7]" />
              </div>
              <div>
                <p className="text-[10px] text-[#a7d0b8] font-bold uppercase tracking-widest mb-0.5">
                  Time Remaining
                </p>
                <div className="text-white font-mono font-extrabold text-3xl tabular-nums leading-none tracking-tight">
                  {formatTime(remainingSeconds)}
                </div>
              </div>
            </div>
            <button
              onClick={initiateCheckout}
              className="bg-red-500 hover:bg-red-600 border border-red-500 text-white text-sm font-extrabold px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <StopCircle className="w-5 h-5" />
              Stop
            </button>
          </div>
        )}

        <StatsOverview stats={userStats} />

        <div className="flex flex-col gap-8 mt-2 min-w-0">
          {/* <RewardsSection /> */}
          <CommunityEvents
            activeEvents={activeEventsAsEventData}
            upcomingEvents={upcomingEvents}
            // currentUserId={currentUser?.id ?? null}
            // onJoinClick={setSelectedEventToJoin}
          />
          <EventGuidelines />
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

      {/* ── Overlays ────────────────────────────────────────────────────────── */}

      {/* Step 2: Duration Picker Modal */}
      {state === "selecting_duration" && (
        <DurationSelectModal
          onSelect={handleDurationSelected}
          onCancel={cancelDurationPicker}
          todayHours={userStats?.todayHours || 0}
        />
      )}

      {/* Step 3→4: Log Activity Form (also shown when timer hits zero natively by hooks if not in background) */}
      {state === "logging_activity" && (
        <LogActivityForm
          elapsedSeconds={elapsedSeconds}
          location={dashboardLocation}
          onCancel={isMandatory ? undefined : cancelCheckout}
          onSubmit={handleSubmitReport}
          isMandatory={isMandatory}
        />
      )}

      {/* Event Details / Join flow modal */}
      {/* {selectedEventToJoin && (
        <EventDetailsModal
          event={selectedEventToJoin}
          onClose={() => setSelectedEventToJoin(null)}
          onSuccessClose={() => {
            setSelectedEventToJoin(null);
            const profStr = localStorage.getItem("nea_user_profile");
            if (profStr) {
              setLocalJoinedEventIds(JSON.parse(profStr).joinedEvents || []);
            }
          }}
        />
      )} */}
    </div>
  );
};
