import React, { useState, useEffect, useRef } from "react";
import {
  LogOut,
  Plus,
  Users,
  CalendarDays,
  Trash2,
  MapPin,
  Award,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/publicHygineCouncil.png";
import { EventFormModal } from "../../../components/sections/admin/modal/EventFormModal";
import { AddUserModal } from "../../../components/sections/org/modal/AddUserModal";
import type { EventData, UserProfile } from "../../../types/api.types";
import { apiService } from "../../../services/apiService";
import type { UserStats } from "../../../services/apiService";
import { toast } from "sonner";
import { getEventImageUrl } from "../../../utils/imageUtils";

function formatCleanupTime(hours: number): { value: string; unit: string } {
  if (!hours) return { value: "0", unit: "h" };
  if (hours < 1) {
    // If less than an hour, show minutes
    const mins = Math.round(hours * 60);
    return { value: mins.toString(), unit: "m" };
  }
  // Otherwise show hours with 1 decimal place
  const floored = Math.floor(hours * 10) / 10;
  return { value: floored.toFixed(1), unit: "h" };
}

export const OrgDashboard: React.FC = () => {
  const { currentUser, logout: handleLogout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"org" | "public">("org");

  const [orgUsers, setOrgUsers] = useState<UserProfile[]>([]);
  const [orgEvents, setOrgEvents] = useState<EventData[]>([]);
  const [publicEvents, setPublicEvents] = useState<EventData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    async function loadData() {
      const allEvents = await apiService.getEvents();
      setPublicEvents(allEvents.filter((e) => e.eventType !== "private"));
      const dashData = await apiService.getDashboard();
      if (dashData) setUserStats(dashData.stats);
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEventSubmit = async (values: any, imageFile: File | null) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newEvent: EventData = {
      eventId: Math.random().toString(36).substr(2, 9),
      name: values.name,
      description: values.description,
      details: values.details || "",
      location: values.location,
      startDate: values.startDate,
      endDate: values.endDate,
      rewards: values.rewards || "",
      joinsCount: 0,
      participants: [],
      eventType: values.eventType,
      userCount: values.userCount ? Number(values.userCount) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventImage: imageFile ? URL.createObjectURL(imageFile) : null,
    };
    setOrgEvents((prev) => [newEvent, ...prev]);
    toast.success(
      `${values.eventType === "private" ? "Private" : "Public"} event created!`,
    );
  };

  const handleUserAdded = (user: UserProfile) => {
    if (!orgUsers.find((u) => u.id === user.id)) {
      setOrgUsers((prev) => [...prev, user]);
    } else {
      toast.error("User is already in the organization.");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "O";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };
  const initials = getInitials(currentUser?.name || "Org User");

  const displayedEvents = activeTab === "org" ? orgEvents : publicEvents;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900">
      {/* Minimal Header */}
      <header className="bg-[#f4fff5] lg:bg-white px-5 sm:px-8 lg:px-12 py-3 lg:py-4 sticky top-0 z-40 lg:border-b lg:border-gray-100 flex justify-between items-center transition-colors">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Public Hygiene Council"
            className="h-10 lg:h-12 w-auto object-contain"
          />
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-9 h-9 rounded-full bg-[#86B537] text-white flex items-center justify-center text-xs font-bold hover:shadow-md transition-all cursor-pointer ring-2 ring-transparent hover:ring-[#86B537]/20"
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
              <div className="h-px bg-gray-50 my-1 w-full" />
              <button
                onClick={handleLogout}
                className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> LogOut
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-10 pb-12 flex flex-col gap-10">
        {/* Welcome & Actions Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Hello, {currentUser?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here is what's happening in your organization today.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold transition-all cursor-pointer"
            >
              <Users size={16} /> Add Member
            </button>
            <button
              onClick={() => setEventFormOpen(true)}
              className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer bg-[#86B537] hover:bg-[#7aa632]"
            >
              <Plus size={16} /> Create Event
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#86B537]/20 flex flex-col justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(134,181,55,0.2)] hover:shadow-[0_8px_20px_-6px_rgba(134,181,55,0.3)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#86B537]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#86B537]/10 flex items-center justify-center text-[#86B537] group-hover:bg-[#86B537] group-hover:text-white transition-colors duration-300">
                <Award size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#86B537]">
                Total Points
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {userStats?.totalPoints ?? 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#509CD1]/20 flex flex-col justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(80,156,209,0.2)] hover:shadow-[0_8px_20px_-6px_rgba(80,156,209,0.3)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#509CD1]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#509CD1]/10 flex items-center justify-center text-[#509CD1] group-hover:bg-[#509CD1] group-hover:text-white transition-colors duration-300">
                <Clock size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#509CD1]">
                Hours Logged
              </span>
            </div>
            <div className="relative z-10">
              {(() => {
                const time = formatCleanupTime(userStats?.todayHours ?? 0);
                return (
                  <p className="text-4xl font-black text-gray-900 tracking-tight">
                    {time.value}
                    <span className="text-lg font-bold text-gray-400 ml-1">
                      {time.unit}
                    </span>
                  </p>
                );
              })()}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#86B537]/20 flex flex-col justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(134,181,55,0.2)] hover:shadow-[0_8px_20px_-6px_rgba(134,181,55,0.3)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#86B537]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#86B537]/10 flex items-center justify-center text-[#86B537] group-hover:bg-[#86B537] group-hover:text-white transition-colors duration-300">
                <Trash2 size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#86B537]">
                Waste Collected
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {userStats?.totalWeight ?? 0}
                <span className="text-lg font-bold text-gray-400 ml-1">kg</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#509CD1]/20 flex flex-col justify-between gap-4 shadow-[0_2px_10px_-4px_rgba(80,156,209,0.2)] hover:shadow-[0_8px_20px_-6px_rgba(80,156,209,0.3)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#509CD1]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#509CD1]/10 flex items-center justify-center text-[#509CD1] group-hover:bg-[#509CD1] group-hover:text-white transition-colors duration-300">
                <Users size={20} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#509CD1]">
                Team Size
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                {orgUsers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Events Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Minimal Tabs */}
            <div className="flex gap-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("org")}
                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "org" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                Organization Events
                {activeTab === "org" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#86B537] rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("public")}
                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "public" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                Public Platform Events
                {activeTab === "public" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#86B537] rounded-t-full"></div>
                )}
              </button>
            </div>

            {/* Events Grid */}
            {displayedEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 border-dashed p-12 text-center flex flex-col items-center justify-center">
                <CalendarDays className="text-gray-300 mb-3" size={32} />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No events found
                </p>
                <p className="text-xs text-gray-500 max-w-[250px]">
                  {activeTab === "org"
                    ? "You haven't created any events yet. Click 'Create Event' to get started."
                    : "There are currently no public events available on the platform."}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {displayedEvents.map((event) => (
                  <div
                    key={event.eventId}
                    onClick={() => navigate(`/events/${event.eventId}`)}
                    className="group bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-[#86B537]/30 hover:shadow-sm transition-all flex flex-col gap-3"
                  >
                    <div className="h-32 rounded-xl bg-gray-50 overflow-hidden relative">
                      {event.eventImage ? (
                        <img
                          src={getEventImageUrl(event.eventImage)}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CalendarDays className="text-gray-300" size={24} />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-center shadow-sm">
                        <p className="text-[10px] font-bold uppercase text-gray-900 leading-none">
                          {new Date(event.startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                            },
                          )}
                        </p>
                        <p className="text-sm font-black text-[#86B537] leading-tight">
                          {new Date(event.startDate).getDate()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm truncate mb-1">
                        {event.name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 gap-1 font-medium">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-sm">
                  Team Members
                </h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {orgUsers.length}
                </span>
              </div>

              {orgUsers.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-xs text-gray-500 font-medium">
                    No members added yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orgUsers.slice(0, 5).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#f4fff5] text-[#86B537] flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                          {u.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  {orgUsers.length > 5 && (
                    <button className="text-xs font-semibold text-[#509CD1] hover:text-[#3b7eb3] mt-2 flex items-center justify-center gap-1 py-2">
                      View all members <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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

      {/* Modals */}
      <EventFormModal
        isOpen={eventFormOpen}
        onClose={() => setEventFormOpen(false)}
        onSuccess={() => {}}
        showEventTypeToggle={true}
        onSubmitOverride={handleEventSubmit}
      />

      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};
