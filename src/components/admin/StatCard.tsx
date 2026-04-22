/**
 * StatCard.tsx
 * Reusable KPI stat card — mirrors the user app's stat card pattern.
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
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
      style={{ borderLeftColor: borderColor }}
    >
      {/* Icon badge */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
            {value}
          </p>
        )}
        {subtext && !loading && (
          <p className="text-xs text-gray-400 font-medium mt-1">{subtext}</p>
        )}
        {trend && !loading && (
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className={`text-[11px] font-bold ${
                trend.positive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
