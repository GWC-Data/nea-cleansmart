import React, { useState, useEffect, useRef } from 'react';
import { QrCode, LogOut, Settings, Star } from 'lucide-react';
import { useCleanUpSession } from '../../../hooks/useCleanUpSession';
import { StatsOverview } from '../../../components/dashboard/StatsOverview';
import { RewardsSection } from '../../../components/dashboard/RewardsSection';
import { CommunitySection } from '../../../components/dashboard/CommunitySection';
import { EventGuidelines } from '../../../components/dashboard/EventGuidelines';
import { ActiveSessionCard } from '../../../components/dashboard/ActiveSessionCard';
import { LogActivityForm } from '../../../components/dashboard/LogActivityForm';
import { QRScannerModal } from '../../../components/dashboard/QRScannerModal';
import { useAuth } from '../../../hooks/useAuth';

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

  // Shortened Initialization
  // -> John Snow -> JS
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };
  const initials = getInitials(currentUser?.name || 'Jane Doe');

  const points = Math.floor(12.5 * 2) * 5; // Hardcoded mock based on 12.5 hrs

  const handleScanSuccess = () => {
    startSession();
  };

  const handleSubmitLog = () => {
    completeLogOff();
    setTimeout(() => {
      alert("Report submitted successfully! Great job!");
    }, 300);
  };

  // Click Outside profile menu handler
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
    <div className="min-h-screen bg-background font-sans pb-10 text-[#1f2937]">
      {/* Header */}
      <header className="bg-white px-5 sm:px-6 pt-6 pb-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0 z-40 border-b border-gray-100 flex justify-between items-center whitespace-nowrap">
        <div className="flex-1 truncate">
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-dark tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 truncate">Ready to make a difference today?</p>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 relative shrink-0">
          
          {/* QR Scanning Button */}
          {state === 'idle' && (
            <button
              onClick={startScanning}
              className="bg-secondary hover:bg-secondary-hover text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
              title="Scan QR to Start Session"
            >
              <QrCode className="w-4 h-4" /> <span className="hidden sm:inline">Scan QR</span>
            </button>
          )}

          {/* Reward Points placed immediately after QR scanning button */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-yellow-50 text-yellow-700 px-2 sm:px-3 py-1.5 rounded-full border border-yellow-100 shadow-sm cursor-help">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">{points} <span className="hidden sm:inline">pts</span></span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
              className="w-10 h-10 bg-soft hover:bg-[#d0eadc] text-secondary rounded-full font-bold flex items-center justify-center transition-colors shadow-sm border border-secondary/10"
              title="Profile"
            >
              {initials}
            </button>
            {profileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-gray-800">{currentUser?.name || 'Jane Doe'}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'jane@example.com'}</p>
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

      <main className="px-5 sm:px-6 pt-6 sm:pt-8 max-w-7xl mx-auto w-full animate-slide-up">
        
        {state === 'active' || state === 'logging_off' ? (
          <div className="max-w-3xl mx-auto border-b border-gray-100 pb-2 mb-6">
            <ActiveSessionCard 
              elapsedSeconds={elapsedSeconds} 
              location={location} 
              onLogOff={initiateLogOff} 
            />
          </div>
        ) : null}

        {/* 2-Column Responsive Layout Optimization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Section: Stats, Active Events, Joined Groups */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 lg:gap-8 min-w-0">
            {<StatsOverview />}
            {<CommunitySection />}
          </div>

          {/* Right Section: Rewards & Badges, Event Guidelines */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:gap-8 min-w-0">
            {<RewardsSection />}
            {<EventGuidelines />}
          </div>

        </div>
        
      </main>

      {/* Overlays / Modals */}
      {state === 'scanning' && (
        <QRScannerModal onScanSuccess={handleScanSuccess} onClose={cancelScanning} />
      )}

      {state === 'logging_off' && (
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
