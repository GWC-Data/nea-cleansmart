/**
 * StatCard.tsx
 * Reusable KPI stat card — elegant redesign with brand palette.
 */

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  borderColor,
  iconBg,
  iconColor,
  trend,
  loading = false,
}) => {
  return (
    <div
      className="group relative bg-white rounded-2xl border border-[#E8EEF4] p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_-18px_rgba(16,138,203,0.35)]"
    >
      {/* Top accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: borderColor }}
      />
      {/* Decorative soft halo */}
      <div
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: iconBg }}
      />

      <div className="relative flex items-start gap-4">
        {/* Icon badge */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ring-1 ring-white shadow-sm"
          style={{ background: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1.5">
            {label}
          </p>
          {loading ? (
            <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
          ) : (
            <p
              className="text-[1.65rem] font-extrabold tracking-tight leading-none"
              style={{ color: "#0F2540" }}
            >
              {value}
            </p>
          )}
          {subtext && !loading && (
            <p className="text-xs text-slate-400 font-medium mt-1.5">{subtext}</p>
          )}
          {trend && !loading && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                style={{
                  background: trend.positive ? "#F0F7E4" : "#FDECF3",
                  color: trend.positive ? "#5E8A1F" : "#C8316E",
                }}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};