import React from "react";
import {
  Trash2,
  TreePine,
  BarChart2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Waves,
  Recycle,
  Clock,
} from "lucide-react";
import { Leaf, Medal } from "lucide-react";

interface DesktopDashboardViewProps {
  name: string;
}

export const DesktopDashboardView: React.FC<DesktopDashboardViewProps> = ({
  name,
}) => {
  return (
    <div className="hidden lg:flex flex-col w-full min-h-screen bg-[#f4f7f6] pt-6 text-gray-900 pb-8">
      <div className="max-w-[1400px] w-full mx-auto px-8 xl:px-12 flex flex-col gap-10">
        {/* TOP ROW: Welcome & Stats */}
        <div className="flex flex-row justify-between items-center gap-10">
          {/* Welcome Message */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight mb-3">
              Welcome back, {name}!
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              Your contributions last week helped restore 12 hectares of local
              woodland. Let's keep the pulse strong.
            </p>
          </div>

          <div className="shrink-0 w-[400px]">
            {/* Rewards & Badges */}
            <div className="bg-[#fcf8f2] rounded-[2rem] p-6 shadow-sm border border-orange-50/50">
              <div className="flex justify-between items-center mb-6 px-1">
                <h3 className="font-extrabold text-gray-900 text-[15px] tracking-tight">
                  Rewards & Badges
                </h3>
                {/* <button className="text-[10px] font-bold text-[#08351e] uppercase tracking-wider hover:underline">View All</button> */}
              </div>

              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-[#bbf7d0] p-4 rounded-full shadow-inner border border-green-200 mb-1">
                    <Medal className="w-5 h-5 text-[#0a4527]" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">
                    Silver
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    5 hrs
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-[#fde68a] p-4 rounded-full shadow-inner border border-yellow-200 mb-1">
                    <Medal className="w-5 h-5 text-yellow-800" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">
                    Gold
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    10 hrs
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 group">
                  <div className="bg-[#e2e8f0] p-4 rounded-full shadow-inner border border-slate-200 mb-1">
                    <Medal className="w-5 h-5 text-slate-700" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">
                    Diamond
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium">
                    15 hrs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8 xl:gap-10 items-start">
          {/* LEFT COLUMN */}
          <div className="col-span-8 flex flex-col gap-10">
            {/* Stat Pills */}
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {/* Stat Pill: Waste Collected */}
              <div className="bg-[#f0f8f4] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#e2efe8] flex-1 min-w-[200px]">
                <div className="bg-[#9bf8b7] text-[#08351e] p-2.5 rounded-full shrink-0">
                  <Trash2 className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-0.5">
                    Waste Collected
                  </p>
                  <div className="text-xl font-extrabold tracking-tight leading-none text-gray-900">
                    9 <span className="text-sm font-semibold">kg</span>
                  </div>
                </div>
              </div>

              {/* Stat Pill: Trees Planted */}
              <div className="bg-[#f9f5f0] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#efdfc6] flex-1 min-w-[200px]">
                <div className="bg-[#eab308] text-white p-2.5 rounded-full shrink-0 shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-0.5">
                    Time logged
                  </p>
                  <div className="text-xl font-extrabold tracking-tight leading-none text-gray-900">
                    12.5 <span className="text-sm font-semibold">hrs</span>
                  </div>
                </div>
              </div>

              {/* Stat Pill: Global Rank */}
              <div className="bg-[#f0f9f4] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#e2efe8] flex-1 min-w-[200px]">
                <div className="bg-[#c2f2d1] text-[#08351e] p-2.5 rounded-full shrink-0">
                  <BarChart2 className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-0.5">
                    Ranking
                  </p>
                  <div className="text-xl font-extrabold tracking-tight leading-none text-gray-900">
                    #25
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

            {/* Upcoming Cleanups Row */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Upcoming Cleanups Events
                </h2>
                <div className="flex gap-2">
                  <button className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-white transition-all bg-[#f4f7f6]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-white transition-all bg-[#f4f7f6]">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5 xl:gap-6">
                {/* Cleanup Card 1 */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col border border-gray-100 h-full">
                  <div className="h-40 relative shrink-0">
                    <img
                      src="https://picsum.photos/seed/beach/600/400"
                      className="w-full h-full object-cover"
                      alt="Beach"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-[#08351e]">
                      Sat, Oct 12
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 pb-6">
                    <h3 className="font-extrabold text-gray-900 mb-1 leading-snug tracking-tight">
                      Coastal Revival Drive
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mb-4">
                      <MapPin className="w-3 h-3" /> Pacifica State Beach
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
                      <button className="bg-[#08351e] hover:bg-[#0a4527] text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cleanup Card 2 */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col border border-gray-100 h-full">
                  <div className="h-40 relative shrink-0">
                    <img
                      src="https://picsum.photos/seed/forest/600/400"
                      className="w-full h-full object-cover"
                      alt="Forest"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-gray-800">
                      Sun, Oct 13
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 pb-6">
                    <h3 className="font-extrabold text-gray-900 mb-1 leading-snug tracking-tight">
                      Muir Woods Saplings
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mb-4">
                      <MapPin className="w-3 h-3" /> Redwood Valley
                    </p>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex -space-x-2">
                        <img
                          src="https://i.pravatar.cc/100?img=3"
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          alt="User"
                        />
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                          +42
                        </div>
                      </div>
                      <button className="bg-[#08351e] hover:bg-[#0a4527] text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cleanup Card 3 */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col border border-gray-100 h-full">
                  <div className="h-40 relative shrink-0">
                    <img
                      src="https://picsum.photos/seed/city/600/400"
                      className="w-full h-full object-cover"
                      alt="City"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-[#08351e]">
                      Wed, Oct 16
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 pb-6">
                    <h3 className="font-extrabold text-gray-900 mb-1 leading-snug tracking-tight">
                      Downtown Sweep
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mb-4">
                      <MapPin className="w-3 h-3" /> Market Street
                    </p>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex -space-x-2">
                        <img
                          src="https://i.pravatar.cc/100?img=4"
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          alt="User"
                        />
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                          +5
                        </div>
                      </div>
                      <button className="bg-[#08351e] hover:bg-[#0a4527] text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-4 flex flex-col gap-8">
            {/* XP Ring Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center flex flex-col items-center">
              {/* <h3 className="font-bold text-gray-700 mb-6 text-sm tracking-wide">
                Level 12 Explorer
              </h3> */}

              <div className="relative w-40 h-40 mb-6 group">
                {/* SVG Progress Ring */}
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
                    className="text-[#2dd4bf]" /* Minty progress bar */
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset="79" /* 70% progress */
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
                    strokeDashoffset="79"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="42"
                    cx="50"
                    cy="50"
                    style={{ filter: "blur(4px)", opacity: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mt-1">
                    125
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 mt-1">
                    Points
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[200px] mb-2">
                25 points until your{" "}
                <span className="font-bold text-[#08351e]">Diamond</span> badge!
              </p>
            </div>

            {/* Joined Groups List */}
            <div className="flex flex-col group mt-2 gap-4">
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

              {/* <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
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
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
