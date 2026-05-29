import React, { useState, useEffect, useRef } from "react";
import {
  LogOut,
  Plus,
  Trash2,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { SessionState } from "../../../hooks/useCleanUpSession";
import logo from "../../../assets/publicHygineCouncil.png";
// import { AddUserModal } from "../../../components/sections/org/modal/AddUserModal";
// import { EventRequestModal } from "../../../components/sections/org/modal/EventRequestModal"; // Commented out unused import
import type {
  EventData /* , UserProfile, EventRequest */,
} from "../../../types/api.types"; // Commented out unused EventRequest import
import { apiService } from "../../../services/apiService";
import { orgApiService } from "../../../services/orgApiService";
import type { UserStats } from "../../../services/apiService";
import { toast } from "sonner";
import { LogActivityForm } from "../../../components/sections/user/LogActivityForm";
import { EventCarousel } from "../../../components/shared/EventCarousel";
import { RewardsBadgesCard } from "../../../components/shared/RewardsBadgesCard";
import { EventGuidelines } from "../../../components/sections/user/EventGuidelines";
// import { LazyEventImage } from "../../../components/ui/LazyEventImage";

function formatCleanupTime(hours: number): { value: string; unit: string } {
  if (!hours) return { value: "0", unit: "hrs" };
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return { value: mins.toString(), unit: "mins" };
  }
  const floored = Math.floor(hours * 10) / 10;
  return { value: floored.toFixed(1), unit: "hrs" };
}

export const OrgDashboard: React.FC = () => {
  const { currentUser, logout: handleLogout } = useAuth();
  const navigate = useNavigate();
  const [searchParams /*, setSearchParams*/] = useSearchParams(); // Commented out unused setSearchParams setter
  const menuRef = useRef<HTMLDivElement>(null);
  // const notifRef = useRef<HTMLDivElement>(null); // Commented out unused ref

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  // const [notificationsOpen, setNotificationsOpen] = useState(false); // Commented out unused state
  // const [eventRequestOpen, setEventRequestOpen] = useState(false); // Commented out unused state
  // const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  // Tab state representing Organization Events ('org') or Other Events created by Admin ('other')
  const [activeTab, setActiveTab] = useState<"org" | "other">("org");

  // const [orgUsers, setOrgUsers] = useState<UserProfile[]>([]);
  const [orgEvents, setOrgEvents] = useState<EventData[]>([]);
  // Events created by admin (Other events)
  const [otherEvents, setOtherEvents] = useState<EventData[]>([]);
  const [completedEvents, setCompletedEvents] = useState<EventData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // New state hooks for manual activity logging and all events list
  const [logFormOpen, setLogFormOpen] = useState(false);
  const [allEventsList, setAllEventsList] = useState<EventData[]>([]);

  // Active session state — used to show timer badge on event cards
  const [activeSessionEventId, setActiveSessionEventId] = useState<
    string | null
  >(null);
  const [activeSessionState, setActiveSessionState] =
    useState<SessionState>("idle");
  // const [myRequests, setMyRequests] = useState<EventRequest[]>([]); // Commented out unused state

  // const [loading, setLoading] = useState(false);

  const loadData = async () => {
    // if (!silent) setLoading(true);
    try {
      // Fetch both events and organizations concurrently to determine event creator roles
      const [allEvents, orgs] = await Promise.all([
        apiService.getEvents(),
        apiService.getOrganizations(),
      ]);
      setAllEventsList(allEvents); // store raw events in state
      const now = new Date();

      // Store a set of organization IDs to identify admin-created events
      const orgIds = new Set(orgs.map((o) => o.orgId || o.id));

      // Filter active/upcoming admin-created events (Other events)
      // Admin events are approved events whose creator is not in the organization registry and not the current organization
      setOtherEvents(
        allEvents.filter(
          (e) =>
            e.status === "approved" &&
            (!e.createdBy || !orgIds.has(e.createdBy)) &&
            e.createdBy !== currentUser?.id &&
            (!e.endDate || new Date(e.endDate) >= now)
        )
      );

      // Filter active/upcoming organization events (both public and private events created by the current organization)
      setOrgEvents(
        allEvents.filter(
          (e) =>
            e.createdBy === currentUser?.id &&
            (!e.endDate || new Date(e.endDate) >= now)
        )
      );

      // Filter completed events created by this organization
      setCompletedEvents(
        allEvents.filter(
          (e) =>
            e.createdBy === currentUser?.id &&
            e.status === "approved" &&
            e.endDate &&
            new Date(e.endDate) < now
        )
      );

      const dashData = await orgApiService.getDashboard();
      if (dashData) setUserStats(dashData.stats as any);

      // const requests = await orgApiService.getMyEventRequests(); // Commented out unused data fetch
      // setMyRequests(requests);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  // Submit handler for organization manual activity logging via bulk check-in/check-out
  const handleOrgManualReportSubmit = async (
    weight: number,
    type: string,
    finalLocation: string,
    photo?: File,
    eventId?: string,
    date?: string,
    durationSeconds?: number
  ) => {
    if (!eventId || !date || !durationSeconds) {
      toast.error("Invalid event or log options selected.");
      return;
    }

    // Find selected event to retrieve attendee list
    const selectedEvent = [...orgEvents, ...completedEvents].find((e) => e.eventId === eventId);
    if (!selectedEvent) {
      toast.error("Event not found.");
      return;
    }

    let attendees = selectedEvent.attendentParticipant || [];
    if (typeof attendees === "string") {
      try {
        attendees = JSON.parse(attendees);
      } catch {
        attendees = [];
      }
    }

    // Filter out the organization's own user ID (currentUser?.id) from the attendees list
    // to avoid checking in/out the organization itself as a volunteer participant.
    const attendeesFiltered = (attendees as string[]).filter((uid) => uid !== currentUser?.id);

    if (attendeesFiltered.length === 0) {
      toast.error("No registered volunteer attendees have been scanned for this event yet. Please scan volunteers on the event details page first.");
      return;
    }

    const checkInTime = new Date(date).toISOString();
    const hoursEnrolled = (durationSeconds / 3600).toString();

    try {
      // Step 1: Bulk check-in all volunteer attendees to register active sessions
      const checkInRes = await orgApiService.bulkCheckIn({
        eventId,
        checkInTime,
        hoursEnrolled,
        users: attendeesFiltered,
      });

      if (!checkInRes) {
        toast.error("Failed to check in attendees.");
        return;
      }

      // Step 2: Bulk check-out all volunteer attendees with split garbage weight
      const splitWeight = weight / attendeesFiltered.length;
      const checkOutTime = new Date(new Date(date).getTime() + durationSeconds * 1000).toISOString();

      const checkOutRes = await orgApiService.bulkCheckOut({
        eventId,
        checkOutTime,
        garbageWeight: splitWeight,
        garbageType: type,
        eventLocation: finalLocation,
        users: attendeesFiltered,
        wasteImage: photo,
      });

      if (checkOutRes && checkOutRes.updatedCount > 0) {
        toast.success(`Activity logged successfully! Stats updated for ${checkOutRes.updatedCount} attendees.`);
        setLogFormOpen(false);
        await loadData(); // refresh dashboard stats
      } else {
        toast.error("Failed to check out attendees.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An error occurred while logging activity.");
    }
  };

  useEffect(() => {
    // Reload dashboard data once the current organization user info is available
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  useEffect(() => {
    const finalizeId = searchParams.get("finalizeEvent");
    if (finalizeId) {
      navigate(`/org/create-event?finalizeEvent=${finalizeId}`);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      // if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
      //   setNotificationsOpen(false);
      // }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check for active cleanup session running on the server
  useEffect(() => {
    async function checkActiveTimer() {
      const timerData = await apiService.getTimer();
      if (
        timerData &&
        timerData.logId &&
        timerData.checkInTime &&
        timerData.eventId
      ) {
        const checkInMs = new Date(timerData.checkInTime).getTime();
        const nowMs = Date.now();
        const elapsed = Math.floor((nowMs - checkInMs) / 1000);

        // If hoursEnrolled is "0", it's a private event session managed by the organization.
        if (timerData.hoursEnrolled === "0") {
          setActiveSessionEventId(null);
          setActiveSessionState("idle");
          return;
        }

        let durationSeconds = 0;
        const hoursStr = (timerData.hoursEnrolled ?? "").toLowerCase();
        if (hoursStr.endsWith("min")) {
          durationSeconds = parseFloat(hoursStr) * 60;
        } else {
          durationSeconds = parseFloat(hoursStr) * 3600;
        }

        const remaining = durationSeconds - elapsed;
        setActiveSessionEventId(timerData.eventId);
        setActiveSessionState(
          remaining <= 0 ? "logging_activity" : "checked_in",
        );
      } else {
        setActiveSessionEventId(null);
        setActiveSessionState("idle");
      }
    }
    checkActiveTimer();
  }, []);

  /* Commented out unused event submission handler
  const handleEventSubmit = async (
    values: any,
    imageFile: File | null
  ) => {
    try {
      const payload = {
        ...values,
        ...(imageFile ? { eventImage: imageFile } : {}),
      };
      await orgApiService.createEvent(payload);
      
      const finalizeId = searchParams.get("finalizeEvent");
      if (finalizeId) {
        setSearchParams({});
        toast.success("Event finalized successfully!");
      } else {
        toast.success("Event submitted successfully and is pending approval.");
      }
      
      await loadData();
    } catch (error) {
      throw error;
    }
  };
  */

  // const handleUserAdded = (user: UserProfile) => {
  //   if (!orgUsers.find((u) => u.id === user.id)) {
  //     setOrgUsers((prev) => [...prev, user]);
  //   } else {
  //     toast.error("User is already in the organization.");
  //   }
  // };

  const getInitials = (name?: string) => {
    if (!name) return "O";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };
  const initials = getInitials(currentUser?.name || "Org User");

  // Map active tab to selected list: either Organization-created events or Other events (Admin-created)
  const displayedEvents = activeTab === "org" ? orgEvents : otherEvents;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4fff5] lg:bg-[#f8fcf9] font-sans text-gray-900">
      {/* Minimal Header */}
      <header className="bg-[#f4fff5] lg:bg-white px-5 sm:px-8 lg:px-12 py-3 lg:py-4 sticky top-0 z-40 lg:border-b lg:border-gray-100 flex justify-between items-center transition-colors">
        <div className="flex items-center">
          <img
            src={logo}
            onClick={() => navigate("/org/dashboard")}
            alt="Public Hygiene Council"
            className="h-10 lg:h-12 w-auto object-contain cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Commented out per user request: Event request notifications
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-500 hover:text-[#86B537] hover:bg-gray-50 rounded-full transition-colors"
            >
              <Bell size={20} />
              {myRequests.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-sm font-bold text-gray-800">Notifications</p>
                </div>
                {myRequests.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
                ) : (
                  <div className="flex flex-col">
                    {myRequests.map((req) => (
                      <div key={req.requestId} className="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <p className="text-sm font-medium text-gray-900">{req.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                          {req.status === 'approved' && (
                            <button
                              onClick={() => {
                                setNotificationsOpen(false);
                                setSearchParams({ finalizeEvent: req.requestId });
                              }}
                              className="text-xs font-semibold text-[#86B537] hover:underline"
                            >
                              Finalize Event
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          */}

          {/* Log Clean-up button with matching green styling for a premium look */}
          <button
            onClick={() => setLogFormOpen(true)}
            className="cursor-pointer bg-[#218355] hover:bg-[#2d7c50] text-white font-extrabold px-4 py-2.5 rounded-lg text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            Log Clean-up
          </button>

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
        </div>
      </header>

      {/* Comment: Main layout container with maximum width set to match the individual user dashboard page configuration */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 pt-10 pb-12 flex flex-col gap-8">
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
              onClick={() => {
                navigate("/org/create-event");
              }}
              className="flex-1 cursor-pointer md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#86B537] text-white rounded-lg text-sm font-bold hover:bg-[#7aa632] hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>
        </div>
        {/* Enhanced Stats Grid - Responsive grid: 1 column on mobile (3 rows total), 3 columns on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Hours Card */}
          <div className="bg-[#fffbeb]/60 border border-[#fef3c7] p-4 rounded-[2rem] flex flex-row items-center gap-4 shadow-[0_4px_16px_-4px_rgba(251,191,36,0.08)] hover:shadow-[0_8px_24px_-6px_rgba(251,191,36,0.15)] transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-[#eab308] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide">
                Clean-up Hours
              </span>
              {(() => {
                const time = formatCleanupTime(userStats?.totalHours ?? 0);
                return (
                  <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
                    {time.value}
                    <span className="text-xs md:text-sm font-bold text-gray-500 ml-1">
                      {time.unit}
                    </span>
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Waste Card */}
          <div className="bg-[#f0fdf4]/60 border border-[#dcfce7] p-4 rounded-[2rem] flex flex-row items-center gap-4 shadow-[0_4px_16px_-4px_rgba(34,197,94,0.08)] hover:shadow-[0_8px_24px_-6px_rgba(34,197,94,0.15)] transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-[#86efac] text-[#166534] flex items-center justify-center shrink-0 shadow-sm">
              <Trash2 size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide">
                Waste Collected
              </span>
              <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
                {userStats?.totalWeight ?? 0}
                <span className="text-xs md:text-sm font-bold text-gray-500 ml-1">kg</span>
              </p>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-[#eff6ff]/60 border border-[#dbeafe] p-4 rounded-[2rem] flex flex-row items-center gap-4 shadow-[0_4px_16px_-4px_rgba(59,130,246,0.08)] hover:shadow-[0_8px_24px_-6px_rgba(59,130,246,0.15)] transition-all duration-300">
            <div className="w-11 h-11 rounded-full bg-[#bfdbfe] text-[#1e40af] flex items-center justify-center shrink-0 shadow-sm">
              <Award size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide">
                Total Points
              </span>
              <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
                {userStats?.totalPoints ?? 0}
                <span className="text-xs md:text-sm font-bold text-gray-500 ml-1">pts</span>
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Split: Events and Completed Events Row */}
        {/* Comment: Layout grid for active/other events on the left and completed events on the right. Both sections have matched height constraints for consistent alignment. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left: Events Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Minimal Tabs for filtering events */}
            <div className="flex gap-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("org")}
                className={`pb-3 text-sm cursor-pointer font-semibold transition-colors relative ${activeTab === "org" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                Organization Events
                {activeTab === "org" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#86B537] rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("other")}
                className={`pb-3 text-sm cursor-pointer font-semibold transition-colors relative ${activeTab === "other" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                Other events
                {activeTab === "other" && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#86B537] rounded-t-full"></div>
                )}
              </button>
            </div>

            {/* Tab content wrapper with matching height constraint (320px + 56px tabs header matches 376px Completed Events card) */}
            <div className="h-[230px] flex flex-col justify-center">
              {displayedEvents.length === 0 ? (
                <div className="h-full bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-center flex flex-col items-center justify-center">
                  <Calendar className="mx-auto text-gray-300 mb-2.5 animate-pulse" size={28} />
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    No events found.<br />Check back later for new events!
                  </p>
                </div>
              ) : (
                <EventCarousel
                  events={displayedEvents}
                  activeSessionEventId={activeSessionEventId}
                  activeSessionState={activeSessionState}
                />
              )}
            </div>
          </div>

          {/* Right: Completed Events */}
          {/* Comment: Completed Events sidebar block with a fixed height matching the Events tab section. */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] h-[286px] flex flex-col">
              <div className="flex justify-between items-center mb-2 border-b border-gray-50 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#86B537]" />
                  <h3 className="font-bold text-gray-900 text-sm">
                    Completed Events
                  </h3>
                </div>
                {/* <span className="text-xs font-bold bg-[#f4fff5] text-[#86B537] px-2.5 py-0.5 rounded-full">
                  {completedEvents.length}
                </span> */}
              </div>

              {completedEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <CheckCircle2 className="mx-auto text-gray-300 mb-2.5 animate-pulse" size={28} />
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    No completed events yet.<br />Your past clean-ups will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1 snap-y snap-mandatory scroll-smooth completed-cleanups-scroll">
                  {completedEvents.map((event) => (
                    <div
                      key={event.eventId}
                      className="flex flex-col gap-0.5 p-3 hover:bg-gray-50 rounded-xl transition-all border border-gray-50 hover:border-gray-100 hover:shadow-sm cursor-pointer group snap-start shrink-0 mb-2 last:mb-0"
                      onClick={() => navigate(`/events/${event.eventId}`)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#86B537] transition-colors line-clamp-1">
                          {event.name}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#86B537] bg-[#f4fff5] px-1.5 py-0.5 rounded-md shrink-0">
                          Done
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {event.startDate
                              ? new Date(event.startDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                              : "N/A"}
                          </span>
                        </div>
                        {/* Flex container displaying location on the left and a Public/Private event type badge on the right */}
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-600">
                            {event.joinsCount || 0} volunteers joined
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guidelines and Badge Milestones Row */}
        {/* Comment: Row placed after events showing guidelines on the left side and rewards/badges progress on the right side. */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* Left: Event Guidelines */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <EventGuidelines />
          </div>

          {/* Right: Badge progress card */}
          <div className="flex flex-col gap-6">
            {/* Reusable Badges progress card */}
            {/* Comment: Pass total points instead of total hours to calculate badges progress */}
            <RewardsBadgesCard userTotalPoints={userStats?.totalPoints ?? 0} />
          </div>
        </div>
      </main>

      {/* ── Global Footer ───────────────────────────────────────────────────── */}
      <footer className="max-w-[1600px] mx-auto w-full px-5 sm:px-8 lg:px-12 py-5 border-t border-gray-100 animate-slide-up bg-white lg:bg-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex items-center">
            <img
              src={logo}
              onClick={() => navigate("/org/dashboard")}
              alt="Public Hygiene Council"
              className="h-8 lg:h-10 w-auto object-contain cursor-pointer"
            />
          </div>
          <p className="text-xs font-semibold text-gray-400 text-center sm:text-left">
            © 2026 Public Hygiene Council. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}

      {/* Commented out per user request: Event request flow
      <EventRequestModal
        isOpen={eventRequestOpen}
        onClose={() => setEventRequestOpen(false)}
        onSuccess={() => loadData()}
      />
      */}

      {/* <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      /> */}

      {/* Manual Activity Logging Form Modal for Organizations */}
      {logFormOpen && (
        <LogActivityForm
          isDashboardLog={true}
          isOrgFlow={true}
          currentUserId={currentUser?.id}
          allEvents={allEventsList}
          onCancel={() => setLogFormOpen(false)}
          onSubmit={handleOrgManualReportSubmit}
        />
      )}
    </div>
  );
};
