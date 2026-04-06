import React, { useState, useEffect, useRef } from "react";
import { LogOut, Settings, Clock, StopCircle } from "lucide-react";
import logo from "../../../assets/publicHygineCouncil.png";
import { useCleanUpSession } from "../../../hooks/useCleanUpSession";
import { StatsOverview } from "../../../components/dashboard/StatsOverview";
import { WelcomeSection } from "../../../components/dashboard/WelcomeSection";
import { CommunityEvents } from "../../../components/dashboard/CommunityEvents";
import { RewardsSection } from "../../../components/dashboard/RewardsSection";
import { LogActivityForm } from "../../../components/dashboard/LogActivityForm";
import { DurationSelectModal } from "../../../components/dashboard/DurationSelectModal";
import { EventDetailsModal } from "../../../components/dashboard/EventDetailsModal";
import { DesktopDashboardView } from "../../../components/dashboard/DesktopDashboardView";
import { apiService } from "../../../services/apiService";
import type { EventData } from "../../../services/apiService";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

export const Dashboard: React.FC = () => {
  const { currentUser, logout: handleLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventToJoin, setSelectedEventToJoin] = useState<EventData | null>(null);

  const {
    state,
    activeEventId,
    activeLogId,
    remainingSeconds,
    elapsedSeconds,
    openDurationPicker,
    cancelDurationPicker,
    handleCheckIn,
    initiateCheckout,
    cancelCheckout,
    completeSession,
  } = useCleanUpSession();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };
  const initials = getInitials(currentUser?.name || "Jane Doe");

  useEffect(() => {
    async function loadEvents() {
      const data = await apiService.getEvents();
      setEvents(data);
    }
    loadEvents();
  }, []);

  // ── Format mm:ss / hh:mm:ss for the countdown timer ──────────────────────
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ── Step 2: User selects duration → call checkInEvent API ───────────────
  const handleDurationSelected = async (durationSecs: number) => {
    if (!activeEventId) return;
    const userId = JSON.parse(localStorage.getItem("nea_user_profile") || "{}").id;
    const resultId = await apiService.checkInEvent({
      eventId: activeEventId,
      userId,
      checkInTime: new Date().toISOString(),
    });
    if (resultId) {
      handleCheckIn(resultId, durationSecs);
      toast.success("Checked in! Your session has started.");
    } else {
      cancelDurationPicker();
      toast.error("Already checked in for this event.");
    }
  };

  // ── Step 4: User submits the log activity form → checkOutEvent API ──────
  const handleSubmitReport = async (weight: number, type: string) => {
    if (!activeLogId) return;
    const checkoutSuccess = await apiService.checkOutEvent(activeLogId, {
      checkOutTime: new Date().toISOString(),
      garbageWeight: weight,
      garbageType: type,
    });
    if (checkoutSuccess) {
      completeSession();
      toast.success("Report submitted! Great job 🌿");
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

  const activeEvent = events.find(e => e.eventId === activeEventId);

  return (
    <div className="min-h-screen bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900">

      {/* ── Unified Top Navigation ──────────────────────────────────────────── */}
      <header className="bg-[#f4fff5] lg:bg-white px-5 sm:px-8 lg:px-12 py-3 lg:py-4 sticky top-0 z-40 lg:border-b lg:border-gray-100 flex justify-between items-center transition-colors">
        <div className="flex items-center">
          <img src={logo} alt="Public Hygiene Council" className="h-10 lg:h-12 w-auto object-contain" />
        </div>

        <div className="flex items-center gap-3 relative shrink-0">

          {/* Session controls: shown on ALL screen sizes */}
          <div className="flex items-center gap-2 mr-1">
            {state === "idle" && (
              /* Start Clean-up — visible on both mobile and desktop */
              <button
                onClick={() => events.length > 0 && openDurationPicker(events[0].eventId)}
                disabled={events.length === 0}
                className="bg-[#96c93d] hover:bg-[#86b537] disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                Start Clean-up
              </button>
            )}

            {state === "checked_in" && (
              <>
                {/* Live countdown pill */}
                <div className="flex items-center gap-1.5 bg-[#f4fff5] border border-[#a8e8bd] px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[#08351e] shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold tabular-nums text-xs sm:text-sm">{formatTime(remainingSeconds)}</span>
                </div>
                {/* Stop Clean-up */}
                <button
                  onClick={initiateCheckout}
                  className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <StopCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Stop Clean-up</span>
                  <span className="sm:hidden">Stop</span>
                </button>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#08351e] text-white flex items-center justify-center text-sm font-bold shadow-md hover:bg-[#0a4527] hover:shadow-lg transition-all active:scale-95 ring-2 ring-transparent hover:ring-secondary/20"
              title="Profile"
            >
              {initials}
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-gray-800">{currentUser?.name || "Jane Doe"}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email || "jane@example.com"}</p>
                </div>
                <button
                  onClick={() => { setProfileMenuOpen(false); alert("Settings coming soon"); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-gray-400" /> Settings
                </button>
                <div className="h-px bg-gray-50 my-1 w-full" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
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
          name={currentUser?.name?.split(" ")[0] || "Sarah"}
          points={125}
          level={4}
        />

        <StatsOverview />

        <div className="flex flex-col gap-8 mt-2 min-w-0">
          <CommunityEvents events={events} onJoinClick={setSelectedEventToJoin} />
          <RewardsSection />
        </div>
      </main>

      {/* ── Desktop Layout ──────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <DesktopDashboardView
          name={currentUser?.name?.split(" ")[0] || "Alex"}
          events={events}
          onJoinClick={setSelectedEventToJoin}
        />
      </div>

      {/* ── Global Footer ───────────────────────────────────────────────────── */}
      <footer className="max-w-[1600px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-5 border-t border-gray-100 animate-slide-up bg-white lg:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center">
            <img src={logo} alt="Public Hygiene Council" className="h-8 lg:h-10 w-auto object-contain" />
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
        />
      )}

      {/* Step 3→4: Log Activity Form (also shown when timer hits zero) */}
      {state === "logging_activity" && (
        <LogActivityForm
          elapsedSeconds={elapsedSeconds}
          location={activeEvent?.location || ""}
          onCancel={cancelCheckout}
          onSubmit={handleSubmitReport}
        />
      )}

      {/* Event Details / Join flow modal */}
      {selectedEventToJoin && (
        <EventDetailsModal
          event={selectedEventToJoin}
          onClose={() => setSelectedEventToJoin(null)}
          onSuccessClose={() => setSelectedEventToJoin(null)}
        />
      )}
    </div>
  );
};
