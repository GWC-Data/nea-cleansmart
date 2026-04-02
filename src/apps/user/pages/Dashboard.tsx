import React, { useState, useEffect, useRef } from "react";
import { LogOut, Settings, Leaf } from "lucide-react";
import { useCleanUpSession } from "../../../hooks/useCleanUpSession";
import { StatsOverview } from "../../../components/dashboard/StatsOverview";
import { WelcomeSection } from "../../../components/dashboard/WelcomeSection";
import { CommunityEvents } from "../../../components/dashboard/CommunityEvents";
import { RewardsSection } from "../../../components/dashboard/RewardsSection";
import { LogActivityForm } from "../../../components/dashboard/LogActivityForm";
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

  const {
    state,
    activeEventId,
    activeLogId,
    checkInTime,
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

  const handleStartClicked = async (eventId: number) => {
    // Call api to log POST
    const userId = 3; // Assuming 1 per instructions
    console.log("eventId", eventId);
    console.log("userId", userId);
    const resultId = await apiService.checkInEvent({
      eventId,
      userId,
      checkInTime: new Date().toISOString()
    });
    if (resultId) {
      handleCheckIn(eventId, resultId);
      toast.success("Checked in successfully!");
    } else {
      toast.error("User already checked in for this event");
    }
  };

  const handleSubmitReport = async (weight: number, type: string) => {
    console.log("activeLogId", 3);
    console.log("weight", weight);
    console.log("type", type);
    if (!activeLogId) return;
    const checkoutSuccess = await apiService.checkOutEvent(20, {
      checkOutTime: new Date().toISOString(),
      garbageWeight: weight,
      garbageType: type
    });
    if (checkoutSuccess) {
      completeSession();
      toast.success("Report submitted successfully! Great job!");
    } else {
      toast.error("Failed to submit checkout report.");
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

  return (
    <div className="min-h-screen bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900">
      {/* Unified Top Navigation */}
      <header className="bg-[#f4fff5] lg:bg-white px-5 sm:px-8 lg:px-12 py-4 lg:py-4 sticky top-0 z-40 lg:border-b lg:border-gray-100 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 lg:w-7 lg:h-7 text-secondary" />
          <span className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
            NEA - CleanTrack
          </span>
        </div>

        <div className="flex items-center gap-3 relative shrink-0">
          
          {/* Desktop Only: Active Timer Removed */}
          <div className="hidden lg:flex items-center gap-3 mr-2">
            
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
                  <p className="text-sm font-bold text-gray-800">
                    {currentUser?.name || "Jane Doe"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email || "jane@example.com"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    alert("Settings coming soon");
                  }}
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

      {/* Mobile Container (Strictly hide on Desktop) */}
      <main className="flex lg:hidden px-5 sm:px-8 pt-6 max-w-xl mx-auto w-full animate-slide-up flex-col gap-6 pb-8">
        <WelcomeSection
          name={currentUser?.name?.split(" ")[0] || "Sarah"}
          points={125}
          level={4}
          onScanClick={() => {}} // deprecated QR scanner
        />

        <StatsOverview />

        <div className="flex flex-col gap-8 mt-2 min-w-0">
          <CommunityEvents 
            events={events}
            activeEventId={activeEventId}
            onStartClick={handleStartClicked}
            onSubmitClick={initiateCheckout}
          />
          <RewardsSection />
          {/* <JoinedGroups /> */}
        </div>
      </main>

      {/* Desktop Container (Strictly hide on Mobile) */}
      <div className="hidden lg:block">
        <DesktopDashboardView
          name={currentUser?.name?.split(" ")[0] || "Alex"}
          events={events}
          activeEventId={activeEventId}
          onStartClick={handleStartClicked}
          onSubmitClick={initiateCheckout}
        />
      </div>

      {/* Global Footer */}
      <footer className="max-w-[1600px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-8 mt-4 border-t border-gray-100 animate-slide-up bg-white lg:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 lg:w-8 lg:h-8 text-secondary" />
            <span className="font-extrabold text-gray-900 text-lg lg:text-xl tracking-tight">
              NEA - CleanTrack
            </span>
          </div>

          <p className="text-xs font-semibold text-gray-400 text-center sm:text-left">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Overlays / Modals */}
      {state === "logging_activity" && (
        <LogActivityForm
          checkInTime={checkInTime}
          location={events.find(e => e.eventId === activeEventId)?.location || ""}
          onCancel={cancelCheckout}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
};
