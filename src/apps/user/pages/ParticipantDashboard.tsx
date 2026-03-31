import React, { useState, useEffect, useRef } from "react";
import { LogOut, Settings, Leaf } from "lucide-react";
import { useCleanUpSession } from "../../../hooks/useCleanUpSession";
import { StatsOverview } from "../../../components/dashboard/StatsOverview";
import { WelcomeSection } from "../../../components/dashboard/WelcomeSection";
import { CommunityEvents } from "../../../components/dashboard/CommunityEvents";
import { JoinedGroups } from "../../../components/dashboard/JoinedGroups";
import { RewardsSection } from "../../../components/dashboard/RewardsSection";
import { ActiveSessionCard } from "../../../components/dashboard/ActiveSessionCard";
import { LogActivityForm } from "../../../components/dashboard/LogActivityForm";
import { QRScannerModal } from "../../../components/dashboard/QRScannerModal";
import { useAuth } from "../../../hooks/useAuth";
import { DesktopDashboardView } from "../../../components/dashboard/DesktopDashboardView";
// import { BottomNav } from "../../../components/navigation/BottomNav";

export const ParticipantDashboard: React.FC = () => {
  const { currentUser, logout: handleLogout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    state,
    elapsedSeconds,
    location,
    startScanning,
    startSession,
    cancelScanning,
    initiateLogOff,
    completeLogOff,
    cancelLogOff,
  } = useCleanUpSession();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };
  const initials = getInitials(currentUser?.name || "Jane Doe");

  const handleScanSuccess = () => {
    startSession();
  };

  const handleSubmitLog = () => {
    completeLogOff();
    setTimeout(() => {
      alert("Report submitted successfully! Great job!");
    }, 300);
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
    <div className="min-h-screen bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900 pb-24 lg:pb-8">
      {/* Unified Top Navigation */}
      <header className="bg-[#f4fff5] lg:bg-white px-5 sm:px-8 lg:px-12 py-4 lg:py-5 sticky top-0 z-40 lg:border-b lg:border-gray-100 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 lg:w-7 lg:h-7 text-secondary" />
          <span className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">
            NEA - CleanTrack
          </span>
        </div>

        <div className="flex items-center gap-4 relative shrink-0">
          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 lg:w-11 lg:h-11 bg-cover bg-center text-secondary rounded-full font-bold flex items-center justify-center transition-colors shadow-sm ring-2 ring-transparent hover:ring-secondary/20 overflow-hidden"
              style={{
                backgroundImage: `url(https://i.pravatar.cc/150?u=${currentUser?.email || "demo"})`,
              }}
              title="Profile"
            >
              {!currentUser?.email && initials}
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
          onScanClick={startScanning}
        />

        {/* Restore Active/Logging off state logic */}
        {(state === "active" || state === "logging_off") && (
          <div className="w-full mt-2">
            <ActiveSessionCard
              elapsedSeconds={elapsedSeconds}
              location={location}
              onLogOff={initiateLogOff}
            />
          </div>
        )}

        <StatsOverview />

        <div className="flex flex-col gap-8 mt-2 min-w-0">
          <CommunityEvents />
          <RewardsSection />
          <JoinedGroups />
        </div>
      </main>

      {/* Desktop Container (Strictly hide on Mobile) */}
      <div className="hidden lg:block">
        <DesktopDashboardView
          name={currentUser?.name?.split(" ")[0] || "Alex"}
        />
      </div>

      {/* Desktop Footer */}
      <footer className="hidden lg:block max-w-[1600px] mx-auto w-full px-6 lg:px-12 py-0 border-t border-gray-100 animate-slide-up">
        <div className="flex justify-between items-center pt-8 border-t border-gray-100 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-secondary" />
            <span className="font-extrabold text-gray-900 text-xl tracking-tight">
              NEA - CleanTrack
            </span>
          </div>

          <p className="text-xs font-semibold text-gray-400">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>

      {/* <BottomNav /> */}

      {/* Overlays / Modals */}
      {state === "scanning" && (
        <QRScannerModal
          onScanSuccess={handleScanSuccess}
          onClose={cancelScanning}
        />
      )}

      {state === "logging_off" && (
        <LogActivityForm
          durationSeconds={elapsedSeconds}
          location={location}
          onCancel={cancelLogOff}
          onSubmit={handleSubmitLog}
        />
      )}
    </div>
  );
};
