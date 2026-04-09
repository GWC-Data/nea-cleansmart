import React from "react";
import {
  Trash2,
  MapPin,
  // ChevronLeft,
  // ChevronRight,
  // Waves,
  Clock,
  Wind,
} from "lucide-react";
// import { Medal } from "lucide-react";
import type { EventData, UserStats } from "../../services/apiService";
import { useNavigate } from "react-router-dom";

interface DesktopDashboardViewProps {
  name: string;
  activeEvents: EventData[];
  upcomingEvents: EventData[];
  onJoinClick?: (event: EventData) => void;
  stats: UserStats | null;
  points?: number;
}

function formatCleanupHours(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return hours === 0 ? "0" : `${hours}`;
  if (mins === 30) return hours === 0 ? "½" : `${hours} ½`;
  return (totalMinutes / 60).toFixed(1);
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
  return null; // All badges earned
}

export const DesktopDashboardView: React.FC<DesktopDashboardViewProps> = ({
  name,
  activeEvents,
  upcomingEvents,
  onJoinClick,
  stats,
}) => {
  const navigate = useNavigate();

  const hoursDisplay = stats ? formatCleanupHours(stats.totalMinutes) : "—";
  const wasteDisplay = stats ? stats.totalWeight : "—";
  const carbonDisplay = stats ? (stats.totalWeight * 0.5).toFixed(1) : "—";

  const renderEventGrid = (
    title: string,
    eventList: EventData[],
    hideJoin: boolean = false,
  ) => {
    if (eventList.length === 0) return null;
    return (
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 xl:gap-6">
          {eventList.slice(0, 3).map((event, index) => {
            const mockImage =
              index === 0 ? "beach" : index === 1 ? "forest" : "city";
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={event.eventId}
                onClick={() => navigate(`/events/${event.eventId}`)}
                className="cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col border border-gray-100 h-full"
              >
                <div className="h-40 relative shrink-0">
                  <img
                    src={`https://picsum.photos/seed/${mockImage}/600/400`}
                    className="w-full h-full object-cover"
                    alt={event.name}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-[#08351e]">
                    {formattedDate}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 pb-6">
                  <h3 className="font-extrabold text-gray-900 mb-1 leading-snug tracking-tight">
                    {event.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mb-4">
                    <MapPin className="w-3 h-3" /> {event.location}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex -space-x-2">
                      <img
                        src="https://i.pravatar.cc/100?img=1"
                        className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                        alt="User"
                      />
                      <img
                        src="https://i.pravatar.cc/100?img=2"
                        className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                        alt="User"
                      />
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                        +18
                      </div>
                    </div>
                    {!hideJoin && onJoinClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.eventId}`);
                        }}
                        className="bg-[#08351e] hover:bg-[#0a4527] cursor-pointer text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-sm transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  return (
    <div className="hidden lg:flex flex-col w-full min-h-screen bg-[#f4f7f6] pt-6 text-gray-900 pb-8">
      <div className="max-w-[1400px] w-full mx-auto px-8 xl:px-12 flex flex-col gap-10">
        {/* TOP ROW: Welcome + XP Ring side by side */}
        <div className="flex flex-row justify-between items-center gap-10">
          {/* Welcome Message */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight mb-3">
              Welcome back, {name}!
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Your contribution helped to create a cleaner and more hygienic
              environment for all Singapore residents to enjoy.
            </p>
          </div>

          {/* XP Ring — moved from right column into top row */}
          <div className="shrink-0 bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center w-[250px]">
            <div className="relative w-32 h-32 mb-4 group">
              {(() => {
                const points = stats?.totalPoints ?? 0;
                const start =
                  points < 50
                    ? 0
                    : points < 100
                      ? 50
                      : points < 150
                        ? 100
                        : 150;
                const end = points < 50 ? 50 : points < 100 ? 100 : 150;
                const progress = Math.min((points - start) / (end - start), 1);
                const offset = 264 - progress * 264;
                return (
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      className="text-[#f0f4f2]"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-[#08351e]"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-[#08351e]"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                      style={{ filter: "blur(4px)", opacity: 0.3 }}
                    />
                  </svg>
                );
              })()}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mt-1">
                  {stats?.totalPoints ?? 0}
                </span>
                <span className="text-[9px] font-bold text-gray-400 mt-1">
                  Points
                </span>
              </div>
            </div>
            {(() => {
              const next = getNextBadgeInfo(stats?.totalPoints ?? 0);
              return next ? (
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[160px]">
                  {next.pointsNeeded} pts until{" "}
                  <span className="font-extrabold text-[#08351e]">
                    {next.label}
                  </span>
                  !
                </p>
              ) : (
                <p className="text-xs text-gray-500 font-medium">
                  🎉 All badges earned!
                </p>
              );
            })()}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">
          {/* LEFT COLUMN */}
          <div className="col-span-12 flex flex-col gap-10">
            {/* Stat Pills */}
            <div className="flex flex-wrap items-center gap-8 shrink-0">
              {/* Stat Pill: Clean-up hours */}
              <div className="bg-[#f9f5f0] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#efdfc6] flex-1 min-w-[200px]">
                <div className="bg-[#eab308] text-white p-2.5 rounded-full shrink-0 shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-2">
                    Clean-up Hours
                  </p>
                  <div className="text-xl font-extrabold tracking-tight leading-none text-gray-900">
                    {hoursDisplay}{" "}
                    <span className="text-sm font-semibold">hrs</span>
                  </div>
                </div>
              </div>

              {/* Stat Pill: Waste Collected */}
              <div className="bg-[#f0f8f4] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#e2efe8] flex-1 min-w-[200px]">
                <div className="bg-[#9bf8b7] text-[#08351e] p-2.5 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-2">
                    Waste Collected
                  </p>
                  <div className="text-xl font-extrabold tracking-tight leading-none text-gray-900">
                    {wasteDisplay}{" "}
                    <span className="text-sm font-semibold">kg</span>
                  </div>
                </div>
              </div>

              {/* Stat Pill: Carbon Reduced */}
              <div className="bg-[#f0f6ff] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#d6e4ff] flex-1 min-w-[200px]">
                <div className="bg-[#bfdbfe] text-[#1e40af] p-2.5 rounded-full shrink-0 shadow-[0_2px_10px_rgba(59,130,246,0.2)]">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-2">
                    Carbon Reduced
                  </p>
                  <div className="text-xl font-extrabold tracking-tight leading-none text-gray-900">
                    {carbonDisplay}{" "}
                    <span className="text-sm font-semibold">kg CO₂</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Huge Map placeholder */}
            {/* <div className="w-full h-[450px] bg-blue-50 rounded-[2.5rem] overflow-hidden relative shadow-md group">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600"
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                alt="San Francisco Map Placeholder"
              />
              <div className="absolute inset-0 border border-black/5 rounded-[2.5rem] pointer-events-none"></div> */}

            {/* Map Floating Dialog */}
            {/* <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-gray-100/50">
                <div className="flex gap-3 items-center">
                  <div className="text-[#08351e]">
                    <MapPin className="w-5 h-5 fill-current border border-white rounded-full bg-white shadow-sm box-content p-0.5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 tracking-tight">
                      Active Collection Points
                    </h4>
                    <p className="text-[11px] font-medium text-gray-500">
                      12 events active in your area
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

            {renderEventGrid("Active Events", activeEvents, true)}
            {renderEventGrid("Upcoming Events", upcomingEvents)}
          </div>

          {/* RIGHT COLUMN */}
          {/* <div className="col-span-4 flex flex-col gap-8"> */}
          {/* XP Ring Card */}
          {/* <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center"> */}
          {/* <div className="relative w-40 h-40 mb-6 group"> */}
          {/* SVG Progress Ring */}
          {/* {(() => {
                  const points = stats?.totalPoints ?? 0;
                  const start =
                    points < 50
                      ? 0
                      : points < 100
                        ? 50
                        : points < 150
                          ? 100
                          : 150;
                  const end = points < 50 ? 50 : points < 100 ? 100 : 150;
                  const progress = Math.min(
                    (points - start) / (end - start),
                    1,
                  );
                  const circumference = 264;
                  const offset = circumference - progress * circumference;

                  return (
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="text-[#f0f4f2]"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-[#2dd4bf]"
                        strokeWidth="8"
                        strokeDasharray="264"
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-emerald-500"
                        strokeWidth="8"
                        strokeDasharray="264"
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="42"
                        cx="50"
                        cy="50"
                        style={{ filter: "blur(4px)", opacity: 0.3 }}
                      />
                    </svg>
                  );
                })()}

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mt-1">
                    {stats?.totalPoints ?? 0}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 mt-1">
                    Points
                  </span>
                </div>
              </div>

              {(() => {
                const next = getNextBadgeInfo(stats?.totalPoints ?? 0);
                return next ? (
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mb-2">
                    {next.pointsNeeded} points until your{" "}
                    <span className="font-bold text-[#08351e]">
                      {next.label}
                    </span>{" "}
                    badge!
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mb-2">
                    🎉 You've earned all badges!
                  </p>
                );
              })()}
            </div> */}

          {/* Joined Groups List */}
          {/* <div className="flex flex-col group mt-2 gap-4">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight px-1 mb-2">
                Joined Groups
              </h2>

              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="bg-[#08351e] text-white p-3 rounded-xl shrink-0">
                  <Waves className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-gray-900 text-[13px] tracking-tight mb-0.5">
                    Ocean Warriors
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    2.4k Members &bull; 12 active
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="bg-[#a16207] text-white p-3 rounded-xl shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-gray-900 text-[13px] tracking-tight mb-0.5">
                    Green Tech SF
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    850 Members &bull; 3 active
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center gap-4 bg-[#f8faf9] p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="bg-[#475569] text-white p-3 rounded-xl shrink-0">
                  <Recycle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-gray-900 text-[13px] tracking-tight mb-0.5">
                    Urban Composter
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">
                    1.1k Members &bull; 5 active
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <button className="w-full py-4 mt-2 border-2 border-dashed border-gray-300 rounded-2xl text-[13px] font-bold text-gray-600">
                Discover New Groups
              </button>
            </div> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};
