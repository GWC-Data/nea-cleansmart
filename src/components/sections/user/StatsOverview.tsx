import React from "react";
import { Clock, Trash2, Wind } from "lucide-react";
import type { UserStats } from "../../../services/apiService";

function formatCleanupHours(totalMinutes: number): string {
  if (totalMinutes === 0) return "0";
  const hours = totalMinutes / 60;
  // Floor to 1 decimal place (e.g. 11min → 0.1h, not 0.2h)
  const floored = Math.floor(hours * 10) / 10;
  return floored.toFixed(1);
}

interface StatsOverviewProps {
  stats: UserStats | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const hoursDisplay = stats
    ? formatCleanupHours(stats.totalMinutesLogged)
    : "0";
  const wasteDisplay = stats ? stats.totalWeight : "0";
  const carbonDisplay = stats ? Math.floor(stats.co2Collected).toString() : "0";
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Stat Pill: Clean-up Hours */}
      <div className="bg-[#f9f5f0] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#efdfc6]">
        <div className="bg-[#eab308] text-white p-3 rounded-full shrink-0 shadow-[0_2px_10px_rgba(234,179,8,0.3)]">
          <Clock className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-bold mb-0.5">
            Clean-up Hours
          </p>
          <div className="text-2xl font-extrabold tracking-tight leading-none text-gray-900">
            {hoursDisplay} <span className="text-sm font-semibold">hrs</span>
          </div>
        </div>
      </div>

      {/* Stat Pill: Waste Collected */}
      <div className="bg-[#f0f8f4] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#e2efe8]">
        <div className="bg-[#9bf8b7] text-[#08351e] p-3 rounded-full shrink-0">
          <Trash2 className="w-5 h-5 fill-current" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-bold mb-0.5">
            Waste Collected
          </p>
          <div className="text-2xl font-extrabold tracking-tight leading-none text-gray-900">
            {wasteDisplay} <span className="text-sm font-semibold">kg</span>
          </div>
        </div>
      </div>

      {/* Stat Pill: Carbon Reduced */}
      <div className="bg-[#f0f6ff] px-5 py-4 rounded-3xl flex items-center gap-4 shadow-sm border border-[#d6e4ff]">
        <div className="bg-[#bfdbfe] text-[#1e40af] p-3 rounded-full shrink-0 shadow-[0_2px_10px_rgba(59,130,246,0.2)]">
          <Wind className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-bold mb-0.5">
            Carbon Reduced
          </p>
          <div className="text-2xl font-extrabold tracking-tight leading-none text-gray-900">
            {carbonDisplay}{" "}
            <span className="text-sm font-semibold">kg CO₂</span>
          </div>
        </div>
      </div>
    </div>
  );
};
