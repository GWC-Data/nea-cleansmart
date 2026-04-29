import React, { useState } from "react";
import {
  Trash2,
  MapPin,
  Clock,
  Wind,
  Users,
  Trophy,
  Building2,
  Medal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EventData, UserStats } from "../../../services/apiService";
import { getEventImageUrl } from "../../../utils/imageUtils";

function formatCleanupHours(totalMinutes: number): string {
  if (totalMinutes === 0) return "0";
  const hours = totalMinutes / 60;
  const floored = Math.floor(hours * 10) / 10;
  return floored.toFixed(1);
}

interface DesktopDashboardViewProps {
  name: string;
  activeEvents: EventData[];
  upcomingEvents: EventData[];
  currentUserId?: string | null;
  stats: UserStats | null;
  userLeaderboard?: any[];
  orgLeaderboard?: any[];
}

export const DesktopDashboardView: React.FC<DesktopDashboardViewProps> = ({
  name,
  activeEvents,
  upcomingEvents,
  stats,
  userLeaderboard = [],
  orgLeaderboard = [],
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "orgs">("users");

  const totalMinutes = stats?.totalMinutesLogged ?? 0;
  const totalWeight = stats?.totalWeight ?? 0;
  const carbonReduced = stats ? Math.floor(stats.co2Collected).toString() : "0";
  const hoursDisplay = formatCleanupHours(totalMinutes);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500 bg-yellow-50";
      case 2:
        return "text-gray-400 bg-gray-50";
      case 3:
        return "text-orange-500 bg-orange-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Medal className="w-4 h-4" />;
    }
    return <span className="text-[10px] font-bold">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] font-sans text-gray-900 pb-12">
      <div className="max-w-[1400px] mx-auto px-8 xl:px-12 pt-8 flex flex-col gap-8">
        {/* TOP ROW: Welcome */}
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 flex flex-col gap-2">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              Welcome back, {name}!
            </h1>
            <p className="text-gray-500 font-medium text-sm leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
              Your contribution helped to create a cleaner and more hygienic environment for all Singapore residents to enjoy.
            </p>
          </div>
        </div>

        {/* MAIN CONTENT + RIGHT PANEL */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* LEFT — Events */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
            {/* Stat Cards — single horizontal row */}
            <div className="flex flex-row gap-4">
              {/* Clean-up Hours */}
              <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3.5 border-l-4 border-[#eab308] shadow-sm flex-1">
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Clean-up Hours
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900">
                      {hoursDisplay}
                    </span>
                    <span className="text-sm font-bold text-gray-400">h</span>
                  </div>
                </div>
                <div className="bg-[#fef9c3] p-2 rounded-xl shrink-0">
                  <Clock className="w-5 h-5 text-[#eab308]" />
                </div>
              </div>

              {/* Waste Collected */}
              <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3.5 border-l-4 border-[#22c55e] shadow-sm flex-1">
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Waste Collected
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900">
                      {totalWeight}
                    </span>
                    <span className="text-sm font-bold text-gray-400">kg</span>
                  </div>
                </div>
                <div className="bg-[#dcfce7] p-2 rounded-xl shrink-0">
                  <Trash2 className="w-5 h-5 text-[#22c55e]" />
                </div>
              </div>

              {/* Carbon Reduced */}
              <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-3.5 border-l-4 border-[#3b82f6] shadow-sm flex-1">
                <div className="flex-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Carbon Reduced
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900">
                      {carbonReduced}
                    </span>
                    <span className="text-sm font-bold text-gray-400">
                      kg CO₂
                    </span>
                  </div>
                </div>
                <div className="bg-[#dbeafe] p-2 rounded-xl shrink-0">
                  <Wind className="w-5 h-5 text-[#3b82f6]" />
                </div>
              </div>
            </div>

            {/* Active Events */}
            <section>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">
                Active Events
              </h2>
              {activeEvents.length === 0 ? (
                <div className="bg-white rounded-2xl px-6 py-10 border border-gray-100 shadow-sm text-center">
                  <div className="text-3xl mb-3">🌱</div>
                  <p className="text-sm font-semibold text-gray-400">
                    No events joined yet.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Join an upcoming event to get started!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {activeEvents.map((event) => {
                    const eventDate = new Date(event.startDate);
                    const month = eventDate
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase();
                    const day = eventDate.getDate();
                    return (
                      <div
                        key={event.eventId}
                        onClick={() => navigate(`/events/${event.eventId}`)}
                        className="cursor-pointer bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
                      >
                        <div className="h-44 relative overflow-hidden">
                          <img
                            src={getEventImageUrl(event.eventImage)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={event.name}
                          />
                          {/* Date badge */}
                          <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-1.5 shadow-sm text-center min-w-[48px]">
                            <p className="text-[9px] font-black text-[#08351e] uppercase tracking-widest leading-none">
                              {month}
                            </p>
                            <p className="text-lg font-black text-gray-900 leading-tight">
                              {day}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-1.5">
                          <h3 className="font-extrabold text-gray-900 text-sm leading-snug">
                            {event.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.joinsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Upcoming Events */}
            <section>
              <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">
                Upcoming Events
              </h2>
              {upcomingEvents.length === 0 ? (
                <div className="bg-white rounded-2xl px-6 py-10 border border-gray-100 shadow-sm text-center">
                  <div className="text-3xl mb-3">📅</div>
                  <p className="text-sm font-semibold text-gray-400">
                    No upcoming events available.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Stay tuned — new events are coming soon!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.startDate);
                    const month = eventDate
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase();
                    const day = eventDate.getDate();
                    return (
                      <div
                        key={event.eventId}
                        onClick={() => navigate(`/events/${event.eventId}`)}
                        className="cursor-pointer bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
                      >
                        <div className="h-44 relative overflow-hidden">
                          <img
                            src={getEventImageUrl(event.eventImage)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt={event.name}
                          />
                          {/* Date badge */}
                          <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-1.5 shadow-sm text-center min-w-[48px]">
                            <p className="text-[9px] font-black text-[#08351e] uppercase tracking-widest leading-none">
                              {month}
                            </p>
                            <p className="text-lg font-black text-gray-900 leading-tight">
                              {day}
                            </p>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-1.5">
                          <h3 className="font-extrabold text-gray-900 text-sm leading-snug">
                            {event.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.joinsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT PANEL — Leaderboards */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 sticky top-24">
            <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-gray-100 overflow-hidden h-[450px]">
              {/* Tab Navigation */}
              <div className="flex p-1 bg-gray-50 rounded-[2rem] mb-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === "users"
                      ? "bg-[#96c93d] text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Trophy className={`w-4 h-4 ${activeTab === "users" ? "text-white" : "text-gray-300"}`} />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab("orgs")}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === "orgs"
                      ? "bg-[#96c93d] text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === "orgs" ? "text-white" : "text-gray-300"}`} />
                  Orgs
                </button>
              </div>

              <div className="px-6 pb-8 flex flex-col gap-3 animate-in fade-in duration-500">
                {activeTab === "users" ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Top Performers</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                      {userLeaderboard.length > 0 ? (
                        userLeaderboard.map((user, idx) => (
                          <div
                            key={user.userId}
                            className="flex items-center gap-4 pb-2 rounded-2xl hover:bg-gray-50 transition-colors group"
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getRankColor(
                                idx + 1
                              )}`}
                            >
                              {getRankIcon(idx + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#08351e] transition-colors">
                                {user.userName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-[#08351e] uppercase tracking-widest">
                                  {user.totalPoints} pts
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] font-medium text-gray-400">
                                  {user.totalTimeLogged} hrs
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <Trophy className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-gray-400 font-medium">No performer data yet</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">Top Organizations</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                      {orgLeaderboard.length > 0 ? (
                        orgLeaderboard.map((org, idx) => (
                          <div
                            key={org.orgId}
                            className="flex items-center gap-4 pb-2 rounded-2xl hover:bg-gray-50 transition-colors group"
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                idx === 0 ? "bg-[#96c93d] text-[#08351e]" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {getRankIcon(idx + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-[#08351e] transition-colors">
                                {org.orgName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black text-[#08351e] uppercase tracking-widest">
                                  {org.totalHours.toFixed(1)} hrs
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] font-medium text-gray-400">
                                  {org.memberCount} members
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <p className="text-xs text-gray-400 font-medium">No organization data yet</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
