import React from "react";
import {
  Trash2,
  MapPin,
  Clock,
  Wind,
  CalendarDays,
  Users,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { EventData, UserStats } from "../../../services/apiService";
import { getEventImageUrl } from "../../../utils/imageUtils";

function formatCleanupHours(totalMinutes: number): string {
  if (totalMinutes === 0) return "0";
  const hours = totalMinutes / 60;
  // Floor to 1 decimal place (e.g. 11min → 0.1h, not 0.2h)
  const floored = Math.floor(hours * 10) / 10;
  return floored.toFixed(1);
}

function getNextBadgeInfo(
  totalPoints: number,
): { label: string; pointsNeeded: number } | null {
  if (totalPoints < 50)
    return { label: "Silver", pointsNeeded: 50 - totalPoints };
  if (totalPoints < 100)
    return { label: "Gold", pointsNeeded: 100 - totalPoints };
  if (totalPoints < 150)
    return { label: "Diamond", pointsNeeded: 150 - totalPoints };
  return null;
}

interface DesktopDashboardViewProps {
  name: string;
  activeEvents: EventData[];
  upcomingEvents: EventData[];
  currentUserId?: string | null;
  stats: UserStats | null;
}

export const DesktopDashboardView: React.FC<DesktopDashboardViewProps> = ({
  name,
  activeEvents,
  upcomingEvents,
  stats,
}) => {
  const navigate = useNavigate();

  const totalMinutes = stats?.totalMinutesLogged ?? 0;
  const totalWeight = stats?.totalWeight ?? 0;
  const totalPoints = stats?.totalPoints ?? 0;
  const carbonReduced = stats ? Math.floor(stats.co2Collected).toString() : "0";
  const hoursDisplay = formatCleanupHours(totalMinutes);
  const nextBadge = getNextBadgeInfo(totalPoints);
  const hasBadge = totalPoints >= 50;
  const badgeName = !hasBadge
    ? null
    : totalPoints < 100
      ? "Silver"
      : totalPoints < 150
        ? "Gold"
        : "Diamond";

  // XP ring progress
  const start =
    totalPoints < 50
      ? 0
      : totalPoints < 100
        ? 50
        : totalPoints < 150
          ? 100
          : 150;
  const end = totalPoints < 50 ? 50 : totalPoints < 100 ? 100 : 150;
  const progress = Math.min((totalPoints - start) / (end - start), 1);
  const circumference = 264;
  const offset = circumference - progress * circumference;

  return (
    <div className="min-h-screen bg-[#f3f7f5] font-sans text-gray-900 pb-12">
      <div className="max-w-[1400px] mx-auto px-8 xl:px-12 pt-8 flex flex-col gap-8">
        {/* TOP ROW: Welcome */}
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 lg:col-span-8 xl:col-span-6 flex flex-col gap-2">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              Welcome back, {name}!
            </h1>
            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-lg">
              Your contribution helped to create a cleaner and more hygienic
              environment for all Singapore residents to enjoy.
            </p>
          </div>
        </div>

        {/* MAIN CONTENT + RIGHT PANEL */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* LEFT — Events */}
          <div className="col-span-8 flex flex-col gap-8">
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

          {/* RIGHT PANEL */}
          <div className="col-span-4 flex flex-col gap-6 sticky top-24">
            {/* XP Ring */}
            <div className="col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
              {/* <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                Impact Points
              </p> */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    strokeWidth="8"
                    stroke="#f3f7f5"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="#96c93d"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-900 leading-none">
                    {totalPoints}
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    Points
                  </span>
                </div>
              </div>
              {/* Display the user earned badge */}
              <p className="text-xs text-gray-500 font-medium text-center leading-relaxed max-w-[180px]">
                {badgeName ? `Earned ${badgeName} Badge` : "No Badge Yet"}
              </p>
              <p className="text-xs text-gray-500 font-medium text-center leading-relaxed max-w-[180px]">
                {nextBadge ? (
                  <>
                    <span className="font-black text-gray-800">
                      {" "}
                      {nextBadge.pointsNeeded} pts{" "}
                    </span>{" "}
                    until your
                    <span className="font-black text-[#08351e]">
                      {" "}
                      {nextBadge.label}{" "}
                    </span>{" "}
                    badge!
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-black text-[#08351e]">
                      All badges earned!
                    </span>
                  </div>
                )}
              </p>
            </div>

            {/* Event Guidelines */}
            <div className="bg-[#f0fdf4] rounded-3xl p-6 border border-[#bbf7d0] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#08351e] p-1.5 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">
                  Event Guidelines
                </h3>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  "Ensure you are properly hydrated",
                  "Wear covered shoes and safety gloves",
                  "Separate recyclables",
                  "Log hours accurately (max 2h)",
                ].map((guideline) => (
                  <div key={guideline} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#08351e] flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {guideline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
